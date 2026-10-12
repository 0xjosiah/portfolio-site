import vertexShader from '../shaders/glints/vertex.glsl'
import fragmentShader from '../shaders/glints/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import { extend, useThree } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { forwardRef, useEffect, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { sceneCentre } from '../camera'
import { east, north } from '../compass'
import { setRawColor } from '../controls'
import { paletteDefaults } from '../sunset'

const colorDefaults = { a: paletteDefaults.sunDisc, b: paletteDefaults.sun }

/* The wave settings the ocean hands down, so the sparkles ride exactly the surface that is drawn */
const waveUniforms = [ 'uBigWavesElevation', 'uBigWavesFrequency', 'uBigWavesSpeed', 'uSmallWavesElevation', 'uSmallWavesFrequency', 'uSmallWavesSpeed', 'uSmallWavesIterations' ]

/* Small seeded generator (mulberry32), so a seed always scatters the sparkles the same way */
function seededRandom(seed) {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6D2B79F5) >>> 0
        let value = Math.imul(state ^ (state >>> 15), state | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
}

/*
 * One point per sparkle. Positions are only 0 - 1 across and along the area, the shader stretches them over
 * whatever area the panel asks for, so resizing it does not rebuild anything.
 */
function createGlintGeometry(count, seed) {
    const random = seededRandom(seed)
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 3)

    for(let i = 0; i < count; i++) {
        const i3 = i * 3

        positions[i3 + 0] = random()
        positions[i3 + 2] = random()

        randoms[i3 + 0] = random()
        randoms[i3 + 1] = random()
        randoms[i3 + 2] = random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3))
    return geometry
}

const GlintsMaterial = shaderMaterial(
    /* Uniforms */
    {
        /* kept in step with the ocean every frame, see Ocean.jsx */
        uTime: 0,
        uWaveOrigin: new THREE.Vector2( sceneCentre[0], sceneCentre[2] ),
        uFlow: new THREE.Vector2(),

        uBigWavesElevation: 0.283,
        uBigWavesFrequency: new THREE.Vector2( 0.72, 0.369 ),
        uBigWavesSpeed: 0.33,
        uSmallWavesElevation: 0.167,
        uSmallWavesFrequency: 1.765,
        uSmallWavesSpeed: 0.178,
        uSmallWavesIterations: 2.0,

        uWaterLevel: sceneCentre[1],
        uNorth: new THREE.Vector2( north.x, north.z ),
        uEast: new THREE.Vector2( east.x, east.z ),

        /* (nearest, furthest, reach either side, fade distance) */
        uArea: new THREE.Vector4( 1, 9, 7, 4 ),

        uSize: 14,
        uSizeVariation: 0.7,
        uPixelRatio: 1,
        uBrightness: 0.9,
        uTwinkle: 0.9,
        uTwinkleSpeed: 2.5,
        uRays: 0.6,
        uLift: 0.03,

        uColorA: new THREE.Color(colorDefaults.a),
        uColorB: new THREE.Color(colorDefaults.b),
    },
    vertexShader,
    fragmentShader
)

extend({ GlintsMaterial })

/*
 * Star-like sparkles on the water nearest the camera, which is the bottom of the view.
 *   waves - the ocean's uniforms, the wave ones are picked out of it
 *   ref   - the material, so the ocean can keep its time and flow in step each frame
 */
const WaterGlints = forwardRef(function WaterGlints({ waves }, glintsMat) {
    const pixelRatio = useThree((state) => state.viewport.dpr)

    const { count, seed, distance, reach, fade, colorA, colorB, ...uniforms } = useControls('Ocean', {
        'Star sparkles on water': folder({
            count: { value: 250, min: 0, max: 3000, step: 10, label: 'Number of sparkles' },
            /* the bottom edge of the default view meets the water about 1.2 away */
            distance: { value: [ 1, 9 ], min: 0.5, max: 25, step: 0.1, label: 'Nearest → furthest from camera' },
            fade: { value: 4, min: 0, max: 20, step: 0.1, label: 'Fade out over (from the furthest)' },
            reach: { value: 7, min: 1, max: 15, step: 0.1, label: 'Reach left / right of view' },
            seed: { value: 1, min: 0, step: 1, label: 'Layout (any whole number)' },
            uSize: { value: 14, min: 1, max: 60, step: 0.1, label: 'Size (pixels, 3 away)' },
            uSizeVariation: { value: 0.7, min: 0, max: 1, step: 0.01, label: 'Size variation' },
            uRays: { value: 0.6, min: 0, max: 1, step: 0.01, label: 'Star rays (0 = plain dot)' },
            uBrightness: { value: 0.9, min: 0, max: 1, step: 0.01, label: 'Brightness' },
            colorA: { value: colorDefaults.a, label: 'Colour, each sparkle is a mix of this…' },
            colorB: { value: colorDefaults.b, label: '…and this' },
            uTwinkle: { value: 0.9, min: 0, max: 1, step: 0.01, label: 'Flashing (0 = always lit)' },
            uTwinkleSpeed: { value: 2.5, min: 0, max: 10, step: 0.1, label: 'Flash speed' },
            uLift: { value: 0.03, min: 0, max: 0.3, step: 0.005, label: 'Height above the water' },
        }, { collapsed: true }),
    })

    const geometry = useMemo(() => createGlintGeometry(count, seed), [ count, seed ])

    /* made by hand rather than in JSX, so the old buffers have to be freed whenever the layout is rebuilt */
    useEffect(() => () => geometry.dispose(), [ geometry ])

    const [ nearest, furthest ] = distance

    useLayoutEffect(() => {
        setRawColor(glintsMat.current.uColorA, colorA)
        setRawColor(glintsMat.current.uColorB, colorB)
    }, [ colorA, colorB ])

    useLayoutEffect(() => {
        /* kept apart so the area always has some depth to wrap round in */
        glintsMat.current.uArea.set(nearest, Math.max(furthest, nearest + 0.1), reach, fade)
    }, [ nearest, furthest, reach, fade ])

    const waveValues = Object.fromEntries(waveUniforms.map((name) => [ name, waves[name] ]))

    return (
        /* never culled: the points are placed by the shader, so their real positions are not known to three.js */
        <points geometry={geometry} frustumCulled={false}>
            <glintsMaterial
                ref={glintsMat}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uPixelRatio={pixelRatio}
                {...waveValues}
                {...uniforms}
            />
        </points>
    )
})

export default WaterGlints
