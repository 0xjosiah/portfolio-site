import vertexShader from '../shaders/stars/vertex.glsl'
import fragmentShader from '../shaders/stars/fragment.glsl'
import starfieldVertexShader from '../shaders/starfield/vertex.glsl'
import starfieldFragmentShader from '../shaders/starfield/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { compassToDirection } from '../compass'
import { setRawColor } from '../controls'

/* Just inside the sky sphere (100), so the stars draw over the gradient and behind everything else */
const starDistance = 95

const colorDefaults = { a: '#ffffff', b: '#ffd9c2' }

const heightAt = (degrees) => Math.sin(THREE.MathUtils.degToRad(degrees))

/* Small seeded generator (mulberry32), so a seed always lays the stars out the same way */
function seededRandom(seed) {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6D2B79F5) >>> 0
        let value = Math.imul(state ^ (state >>> 15), state | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
}

const direction = new THREE.Vector3()

/*
 * Random points on the sky dome, the same idea as the galaxy generator: one buffer of positions and one of
 * per-star random numbers, drawn as a single THREE.Points.
 *   spread - degrees either side of north (straight ahead) the stars reach
 *   band   - [ lowest, highest ] degrees above the horizon
 */
function createStarGeometry(count, seed, spread, [ lowest, highest ]) {
    const random = seededRandom(seed)
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 3)

    const bottom = heightAt(lowest)
    const top = heightAt(highest)

    for(let i = 0; i < count; i++) {
        const i3 = i * 3

        /* picking the height rather than the angle keeps the stars evenly spread over the dome instead of bunching toward the top */
        const heading = (random() * 2 - 1) * spread
        const climb = THREE.MathUtils.radToDeg(Math.asin(bottom + (top - bottom) * random()))

        compassToDirection(heading, climb, direction).multiplyScalar(starDistance).toArray(positions, i3)

        randoms[i3 + 0] = random()
        randoms[i3 + 1] = random()
        randoms[i3 + 2] = random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3))
    return geometry
}

const StarsMaterial = shaderMaterial(
    /* Uniforms */
    {
        uTime: 0,
        uSize: 6,
        uSizeVariation: 0.7,
        uPixelRatio: 1,
        uBrightness: 0.9,
        uTwinkle: 0.5,
        uTwinkleSpeed: 1.5,

        /* heights the stars fade in between */
        uFadeStart: 0,
        uFadeEnd: 0.1,

        uColorA: new THREE.Color(colorDefaults.a),
        uColorB: new THREE.Color(colorDefaults.b),
    },
    vertexShader,
    fragmentShader
)

extend({ StarsMaterial })

const point = new THREE.Vector3()
const spherical = new THREE.Spherical()
const starColor = new THREE.Color()

/*
 * Laid out the way drei's <Stars> does it: scattered evenly over a whole sphere round the camera, between
 * radius and radius + depth away, each with its own size and tint. The differences are that the layout comes
 * from a seed, so it is the same on every load, and every star carries its own blink timing.
 */
function createStarfieldGeometry(count, seed, radius, depth, factor, saturation) {
    const random = seededRandom(seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)

    let distance = radius + depth
    const increment = depth / count

    for(let i = 0; i < count; i++) {
        distance -= increment * random()
        spherical.set(distance, Math.acos(1 - random() * 2), random() * 2 * Math.PI)
        point.setFromSpherical(spherical).toArray(positions, i * 3)

        starColor.setHSL(i / count, saturation, 0.9).toArray(colors, i * 3)
        sizes[i] = (0.5 + 0.5 * random()) * factor
        phases[i] = random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return geometry
}

const StarfieldMaterial = shaderMaterial(
    /* Uniforms */
    {
        uTime: 0,
        uBlink: 1,
        uFade: 1,
    },
    starfieldVertexShader,
    starfieldFragmentShader
)

extend({ StarfieldMaterial })

/*
 * The look of drei's <Stars> with the blinking done per star. A second layer next to the top-edge stars below,
 * each can be used without the other.
 */
function WholeSkyStars() {
    const starfieldMat = useRef(null)

    const { show, count, seed, radius, depth, factor, saturation, fade, speed, blink } = useControls('Stars', {
        'Whole-sky starfield (drei)': folder({
            show: { value: true, label: 'Show' },
            count: { value: 3000, min: 0, max: 20000, step: 100, label: 'Number of stars' },
            radius: { value: 100, min: 10, max: 180, step: 1, label: 'Distance to nearest stars' },
            depth: { value: 50, min: 0, max: 100, step: 1, label: 'Depth of the star layer' },
            factor: { value: 4, min: 0.5, max: 20, step: 0.1, label: 'Size' },
            saturation: { value: 0, min: 0, max: 1, step: 0.01, label: 'Colour (0 = white)' },
            fade: { value: true, label: 'Soft round edges' },
            speed: { value: 1, min: 0, max: 5, step: 0.1, label: 'Blink speed' },
            blink: { value: 1, min: 0, max: 3, step: 0.01, label: 'Blink amount (0 = steady)' },
            seed: { value: 1, min: 0, step: 1, label: 'Layout (any whole number)' },
        }, { collapsed: true }),
    })

    const geometry = useMemo(
        () => createStarfieldGeometry(count, seed, radius, depth, factor, saturation),
        [ count, seed, radius, depth, factor, saturation ]
    )

    /* made by hand rather than in JSX, so the old buffers have to be freed whenever the layout is rebuilt */
    useEffect(() => () => geometry.dispose(), [ geometry ])

    useFrame((state) => {
        starfieldMat.current.uTime = state.clock.elapsedTime * speed
    })

    return (
        <points geometry={geometry} visible={show} renderOrder={-1} frustumCulled={false}>
            <starfieldMaterial
                ref={starfieldMat}
                transparent
                vertexColors
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uBlink={blink}
                uFade={fade ? 1 : 0}
            />
        </points>
    )
}

export default function Stars() {
    const starsMat = useRef(null)
    const pixelRatio = useThree((state) => state.viewport.dpr)

    const { count, seed, spread, band, fade, colorA, colorB, ...uniforms } = useControls('Stars', {
        'Placement': folder({
            count: { value: 400, min: 0, max: 5000, step: 10, label: 'Number of stars' },
            /* the top edge of the default view is about 18° up, the ones above that only show if the camera is moved */
            band: { value: [ 8, 30 ], min: 0, max: 90, step: 0.5, label: 'Lowest → highest (° above horizon)' },
            fade: { value: 7, min: 0, max: 45, step: 0.5, label: 'Fade in over (° from the lowest)' },
            spread: { value: 70, min: 5, max: 180, step: 1, label: 'Reach left / right of view (°)' },
            seed: { value: 1, min: 0, step: 1, label: 'Layout (any whole number)' },
        }),
        'Appearance': folder({
            uSize: { value: 6, min: 1, max: 30, step: 0.1, label: 'Size (pixels)' },
            uSizeVariation: { value: 0.7, min: 0, max: 1, step: 0.01, label: 'Size variation' },
            uBrightness: { value: 0.9, min: 0, max: 1, step: 0.01, label: 'Brightness' },
            colorA: { value: colorDefaults.a, label: 'Colour, each star is a mix of this…' },
            colorB: { value: colorDefaults.b, label: '…and this' },
            uTwinkle: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Twinkle amount' },
            uTwinkleSpeed: { value: 1.5, min: 0, max: 10, step: 0.1, label: 'Twinkle speed' },
        }),
    }, { collapsed: true })

    const [ lowest, highest ] = band

    const geometry = useMemo(() => createStarGeometry(count, seed, spread, [ lowest, highest ]), [ count, seed, spread, lowest, highest ])

    /* made by hand rather than in JSX, so the old buffers have to be freed whenever the layout is rebuilt */
    useEffect(() => () => geometry.dispose(), [ geometry ])

    useLayoutEffect(() => {
        setRawColor(starsMat.current.uColorA, colorA)
        setRawColor(starsMat.current.uColorB, colorB)
    }, [ colorA, colorB ])

    useFrame((state) => {
        starsMat.current.uTime = state.clock.elapsedTime
    })

    /* kept apart so a zero-width fade is a hard line rather than undefined */
    const fadeStart = heightAt(lowest)
    const fadeEnd = Math.max(heightAt(lowest + fade), fadeStart + 0.0001)

    return (
        <>
            <WholeSkyStars />

            {/* renderOrder puts them ahead of the clouds, which are see-through too and would otherwise be drawn first */}
            <points geometry={geometry} renderOrder={-1} frustumCulled={false}>
                <starsMaterial
                    ref={starsMat}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    uPixelRatio={pixelRatio}
                    uFadeStart={fadeStart}
                    uFadeEnd={fadeEnd}
                    {...uniforms}
                />
            </points>
        </>
    )
}
