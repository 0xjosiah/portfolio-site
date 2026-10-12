import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/*
 * Exported from the rigged crow .blend. Its one animation flies the bird in, lands it and leaves it looking
 * around. The travel was taken out of the bones on export and written onto an empty called 'Path', so the
 * skeleton always animates on the spot, facing +Z with its feet at the origin once landed, and the code here
 * decides where the bird is.
 *
 * A visit goes: in from off one side of the screen, down the authored landing approach onto one of the
 * landing spots, a look around, then up and away off the other side. The next visit is the mirror image, so
 * it always comes back in from the side it left by.
 */
const modelPath = './models/crow.glb'

useGLTF.preload(modelPath)

/* The animation keeps the .blend's frame numbers, at this many frames a second */
const fps = 24

/* One wing beat of level flight, starting with the wings at the top. The landing approach carries straight on from the end of it */
const beatStart = 19
const beatLength = 24

/* Wings folded and settled. From here to the end it only looks around, blinks and caws */
const landedFrame = 125
const lastFrame = 181

/* Feet to the top of the head when perched, in the model's own units, so the panel can ask for a height in world units */
const modelHeight = 4.4

/* Seconds to swap from the perched pose to flapping at take off, and to get up to flying speed */
const takeOffBlend = 0.35
const takeOffRunUp = 0.5

/* Wings beat this much faster while climbing away than they do in level flight */
const takeOffBeatRate = 1.4

/* How far past the edge of the view it starts, in world units, enough for a whole wing to be out of sight */
const offScreenMargin = 1

/* A landing spot counts as in view when it is this far inside the edges of the screen (1 is the very edge) */
const inViewLimit = 0.9

/* Landing spots by name, each an empty object sitting where the feet should go. Filled in by CrowPerch */
const perches = new Map()

/*
 * Marks a place the crow can land. Put it inside whatever it should land on, with the position measured from that
 * parent, so the spot follows it when it is moved, tilted, resized or drifting. The spot can be adjusted in the panel.
 */
export function CrowPerch({ name, position }) {
    const spot = useRef(null)

    const { [name]: place } = useControls('Crow', {
        'Landing spots': folder({
            [name]: { value: position, step: 0.005, label: `${name} (x, y, z from it)` },
        }, { collapsed: true }),
    })

    useEffect(() => {
        const object = spot.current
        perches.set(name, object)
        return () => { if(perches.get(name) === object) perches.delete(name) }
    }, [ name ])

    return <group ref={spot} position={place} />
}

/* Every visit after the first turns each of the panel's angles by up to this many degrees either way */
const angleVariation = 5

const randomAngle = () => (Math.random() * 2 - 1) * angleVariation

/* Pixels along each side of the shading picture below. Small is fine, it is only ever a smooth gradient */
const shadingSize = 64

/*
 * A picture of a lit ball, which a matcap material reads the bird's shading from: each part of the bird takes the
 * brightness of the part of the ball facing the same way. That gives it shape with no light in the scene needed.
 * Brighter toward the sky above, with a sheen round the edge. Greyscale, the panel's colour tints it.
 */
function makeShading() {
    const pixels = new Uint8Array(shadingSize * shadingSize * 4)
    const fromAbove = new THREE.Vector3(0.25, 0.75, 0.6).normalize()
    const facing = new THREE.Vector3()

    for(let row = 0; row < shadingSize; row++) {
        for(let column = 0; column < shadingSize; column++) {
            const x = (column + 0.5) / shadingSize * 2 - 1
            const y = (row + 0.5) / shadingSize * 2 - 1
            const edge = Math.min(x * x + y * y, 1)
            facing.set(x, y, Math.sqrt(1 - edge))

            const lit = 0.3 + 0.5 * Math.max(facing.dot(fromAbove), 0) + 0.45 * edge * edge * edge
            pixels.fill(Math.min(lit, 1) * 255, (row * shadingSize + column) * 4, (row * shadingSize + column) * 4 + 3)
            pixels[(row * shadingSize + column) * 4 + 3] = 255
        }
    }

    const texture = new THREE.DataTexture(pixels, shadingSize, shadingSize)
    texture.encoding = THREE.sRGBEncoding
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
}

const up = new THREE.Vector3(0, 1, 0)
const spotOnScreen = new THREE.Vector3()
const toCamera = new THREE.Vector3()
const curveTangent = new THREE.Vector3()
const curveTurn = new THREE.Quaternion()
const exitPoint = new THREE.Vector3()
const exitBend = new THREE.Vector3()
const exitTangent = new THREE.Vector3()

/*
 *   first - name of the landing spot the first visit uses. After that it is any spot in view, at random
 */
export default function Crow({ first }) {
    const { scene, animations } = useGLTF(modelPath)

    const anchor = useRef(null)
    const bird = useRef(null)
    const mover = useRef(null)

    /* where the visit has got to: waiting, arriving, perched, leaving or gone, and how long it has been there */
    const visit = useRef({
        stage: 'waiting', time: 0, restFrame: landedFrame, flights: 0,
        /* this visit's landing spot, and its few degrees of difference from the panel's angles */
        perch: null, turned: { facing: 0, exitTurn: 0, exitClimb: 0 },
        /* 1 comes in from the left and leaves to the right, -1 is the mirror image */
        side: 1,
        /* the way in from off screen to where the authored approach starts: the four points of a curve, and the seconds it takes */
        runUp: [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ], runUpTime: 1,
        /* seconds until the next visit, counted from when it went out of sight */
        wait: 0,
    })

    const { size, colour, facing, arrivesAfter, runUp, stay, speed, exitTurn, exitClimb, exitDistance, returnsAfter } = useControls('Crow', {
        size: { value: 0.11, min: 0.05, max: 2, step: 0.01, label: 'Height when perched' },
        colour: { value: '#70748c', label: 'Feather colour' },
        /*
         * The three angles here are the first visit's, every later one is turned a few degrees from them at random.
         * They are for a visit that comes in from the left, the mirrored visits swap left and right.
         */
        facing: { value: 0, min: -180, max: 180, step: 1, label: 'Faces (° turned from facing the camera)' },
        arrivesAfter: { value: 3, min: 0, max: 60, step: 0.5, label: 'First flies in after (seconds)' },
        /* it starts just off the side of the screen, this far further away than where it lands */
        runUp: { value: 14, min: 2, max: 60, step: 0.5, label: 'Flies in from this far beyond the landing spot' },
        stay: { value: 6, min: 0, max: 120, step: 0.5, label: 'Stays for (seconds)' },
        speed: { value: 1, min: 0.2, max: 3, step: 0.05, label: 'Flying speed (x the model\'s own)' },
        exitTurn: { value: 60, min: -180, max: 180, step: 1, label: 'Flies off toward (° from the way it faces)' },
        exitClimb: { value: 25, min: -20, max: 80, step: 1, label: 'Climb as it leaves (°)' },
        /* has to be far enough that it is out of view, it is hidden once it gets there */
        exitDistance: { value: 12, min: 1, max: 40, step: 0.5, label: 'Gone after flying this far' },
        returnsAfter: { value: [ 5, 20 ], min: 0, max: 120, step: 0.5, label: 'Comes back after (seconds, anywhere between)' },
        'Fly in again': button(() => {
            visit.current.stage = 'gone'
            visit.current.time = 0
            visit.current.wait = 0
        }),
    }, { collapsed: true })

    /*
     * Two copies of the same clip on one mixer, so a perched frame and a flapping frame can be mixed for the
     * take off. Neither is left to play: each frame sets their times by hand, which is what lets one wing beat
     * be repeated for as long as the flight needs.
     */
    const { mixer, pose, flap, path } = useMemo(() => {
        const [ clip ] = animations
        const position = clip.tracks.find((track) => track.name === 'Path.position')
        const turn = clip.tracks.find((track) => track.name === 'Path.quaternion')
        const body = new THREE.AnimationClip('Body', clip.duration, clip.tracks.filter((track) => track !== position && track !== turn))

        const mixer = new THREE.AnimationMixer(scene)
        const pose = mixer.clipAction(body).play()
        const flap = mixer.clipAction(body.clone()).play()
        flap.setEffectiveWeight(0)

        const positionAt = position.createInterpolant(new Float32Array(3))
        const turnAt = turn.createInterpolant(new Float32Array(4))

        /* where the authored approach starts, how fast and which way it is going there, and how far the model rises in the middle of a beat */
        const first = new THREE.Vector3().fromArray(positionAt.evaluate(beatStart / fps))
        const next = new THREE.Vector3().fromArray(positionAt.evaluate((beatStart + 2) / fps))
        const top = positionAt.evaluate((beatStart + beatLength * 0.5) / fps)[1]

        return {
            mixer, pose, flap,
            path: {
                positionAt, turnAt, first,
                velocity: next.sub(first).setY(0).multiplyScalar(fps / 2),
                lift: top - first.y,
                firstTurn: new THREE.Quaternion().fromArray(turnAt.evaluate(beatStart / fps)),
            },
        }
    }, [ scene, animations ])

    /*
     * Replaces the model's own material, whose texture is close to black and showed up as a plain silhouette.
     * The eyes are a separate, already black, part of the mesh and keep theirs.
     */
    const feathers = useMemo(() => new THREE.MeshMatcapMaterial({ matcap: makeShading() }), [])

    useEffect(() => {
        scene.traverse((child) => {
            if(child.isSkinnedMesh && child.material.name === 'Feathers') child.material = feathers
        })
    }, [ scene, feathers ])

    useEffect(() => () => {
        feathers.matcap.dispose()
        feathers.dispose()
    }, [ feathers ])

    useEffect(() => {
        feathers.color.set(colour)
    }, [ feathers, colour ])

    useEffect(() => () => {
        mixer.stopAllAction()
        mixer.uncacheRoot(scene)
    }, [ mixer, scene ])

    const scale = size / modelHeight

    /* Picks where to land and works out the way in to it. Returns false when there is nowhere to land just now */
    const startVisit = (camera) => {
        const now = visit.current

        let choices = [ ...perches.values() ].filter((spot) => {
            spot.getWorldPosition(spotOnScreen).project(camera)
            return Math.abs(spotOnScreen.x) < inViewLimit && Math.abs(spotOnScreen.y) < inViewLimit && spotOnScreen.z < 1
        })

        /* the first visit is exactly as written: the named spot, the panel's angles, in from the left */
        const opening = now.flights === 0
        if(opening && perches.has(first)) choices = [ perches.get(first) ]
        if(choices.length === 0) return false

        now.perch = choices[Math.floor(Math.random() * choices.length)]
        now.side = now.flights % 2 === 0 ? 1 : -1
        for(const angle in now.turned) now.turned[angle] = opening ? 0 : randomAngle()
        now.flights++

        placeAnchor(camera)

        /* just past the edge of the screen on the side it comes in from, further away than the landing spot and a little higher */
        const [ from, leaveBy, arriveBy, to ] = now.runUp
        from.copy(anchor.current.position).applyMatrix4(camera.matrixWorldInverse)
        const depth = - from.z + runUp
        const halfWidth = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * camera.aspect
        from.set(- now.side * (halfWidth + offScreenMargin), from.y * depth / - from.z + depth * 0.12, - depth)
        anchor.current.worldToLocal(from.applyMatrix4(camera.matrixWorld))

        /* the curve is worked out for a visit from the left, a mirrored visit is flipped as the very last step each frame */
        from.x *= now.side

        /* arrives at the start of the authored approach going the same way and at the same speed, so the join does not show */
        to.copy(path.first).multiplyScalar(scale)
        const cruise = path.velocity.length() * scale * speed
        now.runUpTime = Math.max(from.distanceTo(to) / cruise, beatLength / fps / speed)

        const reach = cruise * now.runUpTime / 3
        leaveBy.copy(to).sub(from).setY(0).setLength(reach).add(from)
        arriveBy.copy(path.velocity).setLength(- reach).add(to)

        now.stage = 'arriving'
        now.time = - now.runUpTime
        return true
    }

    /* Keeps the bird's own frame on the landing spot, upright whatever the spot is tilted by, and turned to face the camera */
    const placeAnchor = (camera) => {
        const now = visit.current

        now.perch.getWorldPosition(anchor.current.position)
        toCamera.copy(camera.position).sub(anchor.current.position)
        anchor.current.rotation.y = Math.atan2(toCamera.x, toCamera.z) + now.side * THREE.MathUtils.degToRad(facing + now.turned.facing)
        anchor.current.updateMatrixWorld()
    }

    useFrame(({ camera }, frameDelta) => {
        /* a tab left in the background comes back with one huge step */
        const delta = Math.min(frameDelta, 0.1)
        const now = visit.current

        now.time += delta

        const due = now.stage === 'waiting' ? arrivesAfter : now.wait
        if((now.stage === 'waiting' || now.stage === 'gone') && now.time >= due) {
            /* nothing to land on in view (scrolled away), so look again in a second */
            if(!startVisit(camera)) now.time = due - 1
        }

        bird.current.visible = now.stage !== 'waiting' && now.stage !== 'gone'
        if(!bird.current.visible) return

        /* the landing spot may be drifting, and a spot that was removed leaves the bird where it last was */
        if(now.perch.parent) placeAnchor(camera)

        const landing = (landedFrame - beatStart) / fps / speed
        if(now.stage === 'arriving' && now.time >= landing) now.time -= landing, now.stage = 'perched'
        if(now.stage === 'perched' && now.time >= stay) now.time -= stay, now.stage = 'leaving'

        let poseFrame = now.restFrame
        let flapFrame = beatStart
        let flapping = 0

        if(now.stage === 'arriving') {
            const frame = now.time * speed * fps

            if(frame < 0) {
                /* the same beat over and over, timed so the last one ends exactly where the authored approach picks up */
                const beat = THREE.MathUtils.euclideanModulo(frame, beatLength) / beatLength
                poseFrame = beatStart + beat * beatLength

                const [ from, leaveBy, arriveBy, to ] = now.runUp
                const along = 1 + now.time / now.runUpTime
                const left = 1 - along

                mover.current.position.copy(from).multiplyScalar(left * left * left)
                    .addScaledVector(leaveBy, 3 * left * left * along)
                    .addScaledVector(arriveBy, 3 * left * along * along)
                    .addScaledVector(to, along * along * along)
                mover.current.position.y += path.lift * scale * (1 - Math.cos(beat * Math.PI * 2)) * 0.5

                /* turned by however far the curve still has to bend before it lines up with the authored approach */
                curveTangent.copy(leaveBy).sub(from).multiplyScalar(left * left)
                    .addScaledVector(arriveBy, 2 * left * along).addScaledVector(leaveBy, - 2 * left * along)
                    .addScaledVector(to, along * along).addScaledVector(arriveBy, - along * along)
                curveTurn.setFromAxisAngle(up, Math.atan2(curveTangent.x, curveTangent.z) - Math.atan2(path.velocity.x, path.velocity.z))
                mover.current.quaternion.copy(curveTurn).multiply(path.firstTurn)
            } else {
                poseFrame = beatStart + frame

                mover.current.position.fromArray(path.positionAt.evaluate(poseFrame / fps)).multiplyScalar(scale)
                mover.current.quaternion.fromArray(path.turnAt.evaluate(poseFrame / fps))
            }
        }

        if(now.stage === 'perched') {
            /* forward through the looking around and back again, so however long it stays there is never a jump */
            const span = lastFrame - landedFrame
            const frame = THREE.MathUtils.euclideanModulo(now.time * fps, span * 2)
            poseFrame = now.restFrame = landedFrame + (frame < span ? frame : span * 2 - frame)

            mover.current.position.set(0, 0, 0)
            mover.current.quaternion.identity()
        }

        if(now.stage === 'leaving') {
            flapping = THREE.MathUtils.smoothstep(now.time, 0, takeOffBlend)
            flapFrame = beatStart + THREE.MathUtils.euclideanModulo(now.time * fps * takeOffBeatRate, beatLength)

            /* up to the model's own flying speed, eased in so it lifts off rather than jumps */
            const cruise = path.velocity.length() * scale * speed
            const flown = cruise * (now.time - takeOffRunUp * (1 - Math.exp(- now.time / takeOffRunUp)))
            const along = Math.min(flown / exitDistance, 1)

            /* a curve that leaves the perch up and forward, then bends round to the way out */
            const turn = THREE.MathUtils.degToRad(exitTurn + now.turned.exitTurn)
            const climb = THREE.MathUtils.degToRad(exitClimb + now.turned.exitClimb)
            exitBend.set(0, 0.1, 0.15).multiplyScalar(exitDistance)
            exitPoint.set(Math.sin(turn) * Math.cos(climb), Math.sin(climb), Math.cos(turn) * Math.cos(climb)).multiplyScalar(exitDistance)

            mover.current.position.copy(exitBend).multiplyScalar(2 * (1 - along) * along).addScaledVector(exitPoint, along * along)

            /* nose along the curve, tipped up by only part of the climb as the flapping pose is already a flying one */
            exitTangent.copy(exitPoint).sub(exitBend).multiplyScalar(along).addScaledVector(exitBend, 1 - along).normalize()
            mover.current.rotation.set(- Math.asin(exitTangent.y) * 0.5 * flapping, Math.atan2(exitTangent.x, exitTangent.z) * flapping, 0, 'YXZ')

            if(along >= 1) {
                now.stage = 'gone'
                now.time = 0
                now.wait = THREE.MathUtils.lerp(returnsAfter[0], returnsAfter[1], Math.random())
                now.restFrame = landedFrame
                bird.current.visible = false
                return
            }
        }

        /* a mirrored visit: the same flight flipped left to right */
        if(now.side < 0) {
            mover.current.position.x *= -1
            mover.current.quaternion.y *= -1
            mover.current.quaternion.z *= -1
        }

        pose.time = poseFrame / fps
        flap.time = flapFrame / fps
        pose.setEffectiveWeight(1 - flapping)
        flap.setEffectiveWeight(flapping)
        mixer.update(0)
    })

    return (
        <group ref={anchor}>
            <group ref={bird} visible={false}>
                <group ref={mover} scale={scale}>
                    <primitive object={scene} />
                </group>
            </group>
        </group>
    )
}
