import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils'
import { savedValue } from '../controls'
import { useMotion } from '../travel'
import DragFrame from './DragFrame'

/* Exported from the rigged seagull .blend: one skinned mesh facing -X, with a looping 'Flap' clip and a held 'Soar' pose */
const modelPath = './models/seagull.glb'

useGLTF.preload(modelPath)

/* Wing tip to wing tip in the model's own units, so the panel can ask for a wingspan in world units */
const modelWingspan = 16.1

/* How long one flap-then-glide cycle lasts for an average bird, in seconds */
const glideCycle = 7

const positionDefault = [ -6.7, 2.6, -12.3 ]

/* 290 is right to left across the screen (270) turned a little toward north, which is away from the camera */
const flight = { heading: 290, moving: true }

const up = new THREE.Vector3(0, 1, 0)

/* Reused every frame for this pass's flight direction, rather than making a new vector each time */
const passDirection = new THREE.Vector3()

/* Small seeded generator (mulberry32), so a seed always arranges the flock the same way */
function seededRandom(seed) {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6D2B79F5) >>> 0
        let value = Math.imul(state ^ (state >>> 15), state | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
}

export default function Seagulls() {
    const { scene, animations } = useGLTF(modelPath)

    const mover = useRef(null)
    const flock = useRef(null)

    /* distance flown under the birds' own power, on top of whatever the world's travel adds */
    const flown = useRef(0)

    /* what this pass rolled: how many birds are out and how far the heading is turned. key says which pass and settings it was rolled for */
    const pass = useRef({ key: '', birds: 0, turn: 0 })

    const [ { count, countVariation, headingVariation, flyIn, flyOut, seed, position, spread, size, sizeVariation, flightSpeed, flapSpeed, glide, bob, tint }, set ] = useControls('Seagulls', () => ({
        count: { value: 7, min: 0, max: 40, step: 1, label: 'Number of birds' },
        countVariation: { value: 3, min: 0, max: 10, step: 1, label: 'More or fewer each pass (±)' },
        headingVariation: { value: 3, min: 0, max: 30, step: 0.5, label: 'Heading change each pass (± °)' },
        /* the flock crosses the view through this point. Each pass turns about it, so it is always flown through */
        position: { value: positionDefault, step: 0.1, label: 'Flies through (x, y, z)' },
        /* both have to be far enough that the flock is out of view, shorter means it is back sooner */
        flyIn: { value: 16, min: 1, max: 80, step: 0.5, label: 'Flies in from this far before' },
        flyOut: { value: 30, min: 1, max: 80, step: 0.5, label: 'Turns back this far after' },
        spread: { value: [ 7, 1.6, 4 ], min: 0, step: 0.1, label: 'Flock size (length, height, width)' },
        seed: { value: 1, min: 0, step: 1, label: 'Formation (any whole number)' },
        size: { value: 0.7, min: 0.05, max: 5, step: 0.01, label: 'Wingspan' },
        sizeVariation: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Size variation' },
        flightSpeed: { value: 1.2, min: 0, max: 10, step: 0.05, label: 'Flying speed (units / second)' },
        flapSpeed: { value: 1, min: 0, max: 4, step: 0.01, label: 'Wing beat speed' },
        glide: { value: 0.35, min: 0, max: 1, step: 0.01, label: 'Time spent gliding (0 = always flapping)' },
        bob: { value: 0.12, min: 0, max: 1, step: 0.01, label: 'Rise and fall' },
        tint: { value: '#ffffff', label: 'Tint colour' },
    }), { collapsed: true })

    const motion = useMotion([ 'Seagulls' ], flight, () => {
        flown.current = 0
        set({ position: savedValue('Seagulls.position', positionDefault) })
    })

    /*
     * One material for the whole flock. The model's own asks for extra glTF shading features, which would mean a
     * much heavier shader for birds this small. The texture belongs to the loaded model and is reused, not copied.
     */
    const material = useMemo(() => {
        let map = null
        scene.traverse((child) => { if(child.isSkinnedMesh) map = child.material.map })
        return new THREE.MeshStandardMaterial({ map, roughness: 0.75, metalness: 0, side: THREE.DoubleSide })
    }, [ scene ])

    useEffect(() => () => material.dispose(), [ material ])

    useEffect(() => {
        material.color.set(tint)
    }, [ material, tint ])

    /*
     * A skinned mesh cannot be instanced, each bird needs bones of its own to flap out of step with the others.
     * So every bird is a clone of the model: its own skeleton and animation mixer, sharing the one geometry,
     * material and texture.
     */
    const birds = useMemo(() => {
        const random = seededRandom(seed)
        const flapClip = THREE.AnimationClip.findByName(animations, 'Flap')
        const soarClip = THREE.AnimationClip.findByName(animations, 'Soar')

        /*
         * Enough birds for the largest flock a pass can ask for, made once. A pass only shows or hides them,
         * so nothing is created or thrown away as the flock comes and goes.
         */
        return Array.from({ length: count + countVariation }, () => {
            const object = cloneSkinned(scene)
            const skeletons = []
            object.traverse((child) => {
                if(!child.isSkinnedMesh) return
                child.material = material
                skeletons.push(child.skeleton)
            })

            const mixer = new THREE.AnimationMixer(object)
            const flap = mixer.clipAction(flapClip).play()
            const soar = mixer.clipAction(soarClip).play()
            soar.setEffectiveWeight(0)

            /* every bird starts somewhere different in its wing beat */
            flap.time = random() * flapClip.duration

            return {
                object, skeletons, mixer, flap, soar,
                /* where it sits in the flock, each -0.5 to 0.5 of the flock's length, height and width */
                place: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5),
                scale: random() - 0.5,
                pace: 0.85 + random() * 0.3,
                phase: random(),
                gliding: 0,
            }
        })
    }, [ scene, animations, material, count, countVariation, seed ])

    /* clones are made by hand, so their mixers and bone textures have to be released when the flock is rebuilt or removed */
    useEffect(() => () => {
        for(const bird of birds) {
            bird.mixer.stopAllAction()
            bird.mixer.uncacheRoot(bird.object)
            bird.skeletons.forEach((skeleton) => skeleton.dispose())
        }
    }, [ birds ])

    const [ length, height, width ] = spread

    useFrame((state, delta) => {
        if(motion.moving) flown.current += flightSpeed * delta

        /* one pass runs from out of view on the way in to out of view on the way out, then the next begins */
        const travelled = motion.travelled() + flown.current
        const passLength = flyIn + flyOut
        const passNumber = Math.floor(travelled / passLength)
        const along = THREE.MathUtils.euclideanModulo(travelled, passLength) - flyIn

        /*
         * Rolled from the pass number, so there is nothing to store per pass and going backwards (scrolling)
         * gives the earlier flock back. The change over happens at the jump between passes, which is out of view.
         */
        const passKey = `${passNumber} ${seed} ${count} ${countVariation} ${headingVariation}`
        if(pass.current.key !== passKey) {
            const random = seededRandom(Math.imul(passNumber, 7919) + Math.imul(seed, 104729))
            const change = Math.round((random() * 2 - 1) * countVariation)

            pass.current.key = passKey
            /* never an empty sky unless the panel asks for no birds at all */
            pass.current.birds = count === 0 ? 0 : Math.max(count + change, 1)
            pass.current.turn = THREE.MathUtils.degToRad((random() * 2 - 1) * headingVariation)

            birds.forEach((bird, index) => { bird.object.visible = index < pass.current.birds })
        }

        /* compass headings run clockwise seen from above, the opposite way to a turn about the y axis */
        passDirection.copy(motion.direction).applyAxisAngle(up, - pass.current.turn)
        mover.current.position.copy(passDirection).multiplyScalar(along)

        /* the model faces -X: turn it to the heading, then tip it up or down by the climb */
        const yaw = Math.atan2(passDirection.z, - passDirection.x)
        const pitch = Math.asin(THREE.MathUtils.clamp(passDirection.y, -1, 1))
        flock.current.rotation.set(0, yaw, - pitch, 'YZX')

        const time = state.clock.elapsedTime
        const ease = 1 - Math.exp(- delta * 3)

        for(const bird of birds) {
            /* birds sitting this pass out cost nothing: no animation, no bones to update, not drawn */
            if(!bird.object.visible) continue

            /* each bird glides for the first part of its own cycle and flaps for the rest, easing between the two */
            const cycle = (time * bird.pace / glideCycle + bird.phase) % 1
            bird.gliding += ((cycle < glide ? 1 : 0) - bird.gliding) * ease
            bird.flap.setEffectiveWeight(1 - bird.gliding)
            bird.soar.setEffectiveWeight(bird.gliding)
            bird.mixer.update(delta * flapSpeed * bird.pace)

            const wave = time * bird.pace * 0.8 + bird.phase * Math.PI * 2
            bird.object.position.set(
                bird.place.x * length,
                bird.place.y * height + Math.sin(wave) * bob,
                bird.place.z * width
            )

            /* a slow roll from side to side, as if riding the wind */
            bird.object.rotation.x = Math.sin(wave * 0.7) * 0.15

            bird.object.scale.setScalar(size / modelWingspan * (1 + bird.scale * sizeVariation))
        }
    })

    return (
        <group ref={mover}>
            <DragFrame
                label='Seagulls'
                position={position}
                onMove={(position) => set({ position })}
                frameSize={spread}
            >
                <group ref={flock}>
                    { birds.map((bird) => <primitive key={bird.object.uuid} object={bird.object} />) }
                </group>
            </DragFrame>
        </group>
    )
}
