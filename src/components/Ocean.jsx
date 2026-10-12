import vertexShader from '../shaders/ocean/vertex.glsl'
import fragmentShader from '../shaders/ocean/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useLayoutEffect, useRef } from 'react'
import { sceneCentre } from '../camera'
import { palette, paletteDefaults, sunDirection } from '../sunset'
import { setRawColor } from '../controls'
import { useMotion } from '../travel'
import { floatShadows, horizonFade, waveUniforms } from '../water'
import WaterGlints from './WaterGlints'

const debugObject = {}
debugObject.depthColor = '#365187'
debugObject.surfaceColor = '#f291a0'

const waterGeometry = new THREE.PlaneGeometry(30, 30, 512, 512)

const OceanMaterial = shaderMaterial(
    /* Uniforms */
    {
        uTime: 5.6,

        /* world x/z the wave pattern is measured from, so the waves keep their shape wherever the ocean is placed */
        uWaveOrigin: new THREE.Vector2( sceneCentre[0], sceneCentre[2] ),

        uBigWavesElevation: 0.283,
        uBigWavesFrequency: new THREE.Vector2( 0.72, 0.369 ),
        uBigWavesSpeed: 0.33,

        uSmallWavesElevation: 0.167,
        uSmallWavesFrequency: 1.765,
        uSmallWavesSpeed: 0.178,
        uSmallWavesIterations: 2.0,

        uDepthColor: new THREE.Color(debugObject.depthColor),
        uSurfaceColor: new THREE.Color(debugObject.surfaceColor),
        uColorOffset: 0.051,
        uColorMultiplier: 3.76,

        uSunDirection: sunDirection,
        uSunColor: palette.sun,
        uHorizonColor: palette.horizon,
        uShininess: 40.0,
        uGlitterStrength: 0.3,
        uGlitterColor2: new THREE.Color(paletteDefaults.sun),
        uShininess2: 8.0,
        uGlitterStrength2: 0.0,
        uGlitterSpread2: 1.0,
        uFogNear: 9.0,
        uFogFar: 20.0,

        /* uShadowMask0, uShadowArea0, uShadowLook0 and so on, one set per shadow the ocean can paint */
        ...Object.fromEntries(floatShadows.flatMap((shadow, index) => [
            [ `uShadowMask${index}`, null ],
            [ `uShadowArea${index}`, new THREE.Vector4() ],
            [ `uShadowLook${index}`, new THREE.Vector2() ],
        ])),
    },
    vertexShader,
    fragmentShader,
    /* shaderMaterial copies its uniform values, hand the shared sun and palette objects back so edits to them show */
    (material) => {
        material.uSunDirection = sunDirection
        material.uSunColor = palette.sun
        material.uHorizonColor = palette.horizon

        /* the floating shadows' uniforms are swapped for the shared objects whole, so a mask made later still arrives */
        floatShadows.forEach((shadow, index) => {
            material.uniforms[`uShadowMask${index}`] = shadow.mask
            material.uniforms[`uShadowArea${index}`] = shadow.area
            material.uniforms[`uShadowLook${index}`] = shadow.look
        })
    }
)

extend({ OceanMaterial })

export default function Ocean() {
    const oceanMat = useRef(null)
    const glintsMat = useRef(null)

    /* which way, and how fast, the water flows past */
    const flow = useMotion([ 'Ocean' ])

    useFrame((state, delta) => {
        oceanMat.current.uTime += delta

        /* the mesh stays put, sliding the pattern's origin makes the water flow past with everything else */
        const flowed = flow.travelled()
        oceanMat.current.uWaveOrigin.set(
            sceneCentre[0] + flow.direction.x * flowed,
            sceneCentre[2] + flow.direction.z * flowed
        )

        /* the sparkles sit on the same waves and are carried along by the same flow */
        glintsMat.current.uTime = oceanMat.current.uTime
        glintsMat.current.uWaveOrigin.copy(oceanMat.current.uWaveOrigin)
        glintsMat.current.uFlow.set(flow.direction.x * flowed, flow.direction.z * flowed)

        /* and for anything floating on the water */
        waveUniforms.uTime.value = oceanMat.current.uTime
        waveUniforms.uWaveOrigin.value.copy(oceanMat.current.uWaveOrigin)
    })

    /* Keys starting with 'u' are spread onto the material as uniforms */
    const { bigWavesFrequencyX, bigWavesFrequencyZ, depthColor, surfaceColor, glitterColor2, ...uniforms } = useControls('Ocean', {
        'Big waves (rolling swell)': folder({
            uBigWavesElevation: { value: 0.283, min: 0, max: 1, step: 0.001, label: 'Height' },
            bigWavesFrequencyX: { value: 0.72, min: 0, max: 5, step: 0.001, label: 'Waves per unit, left-right' },
            bigWavesFrequencyZ: { value: 0.369, min: 0, max: 5, step: 0.001, label: 'Waves per unit, near-far' },
            uBigWavesSpeed: { value: 0.33, min: 0, max: 3, step: 0.001, label: 'Travel speed' },
        }),
        'Small waves (surface chop)': folder({
            uSmallWavesElevation: { value: 0.167, min: 0, max: 1, step: 0.001, label: 'Height' },
            uSmallWavesFrequency: { value: 1.765, min: 0, max: 10, step: 0.001, label: 'Density' },
            uSmallWavesSpeed: { value: 0.178, min: 0, max: 2, step: 0.001, label: 'Churn speed' },
            uSmallWavesIterations: { value: 2, min: 0, max: 5, step: 1, label: 'Detail layers (costly)' },
        }),
        'Water colour': folder({
            depthColor: { value: debugObject.depthColor, label: 'Trough colour (low water)' },
            surfaceColor: { value: debugObject.surfaceColor, label: 'Crest colour (high water)' },
            uColorOffset: { value: 0.051, min: -1, max: 1, step: 0.001, label: 'Shift toward crest colour' },
            uColorMultiplier: { value: 3.76, min: 0, max: 10, step: 0.01, label: 'Trough / crest contrast' },
        }),
        /* layer 1, takes its colour from 'Glow + water glitter colour' in Sky & Sun */
        'Sun glitter on water': folder({
            uGlitterStrength: { value: 0.3, min: 0, max: 2, step: 0.01, label: 'Brightness' },
            uShininess: { value: 40, min: 1, max: 300, step: 1, label: 'Tightness (higher = narrower)' },
        }),
        /* added on top of layer 1 with its own colour, off (brightness 0) until turned up. Meant as the subtle fill: spread out so water away from the sun still catches some light */
        'Sun glitter on water, layer 2': folder({
            uGlitterStrength2: { value: 0, min: 0, max: 2, step: 0.01, label: 'Brightness' },
            uShininess2: { value: 8, min: 1, max: 300, step: 1, label: 'Tightness (higher = narrower)' },
            uGlitterSpread2: { value: 1, min: 0, max: 1, step: 0.01, label: 'Sideways spread (0 at sun, 1 full width)' },
            glitterColor2: { value: paletteDefaults.sun, label: 'Colour' },
        }),
        'Fade into horizon': folder({
            uFogNear: { value: 9, min: 0, max: 30, step: 0.1, label: 'Fade starts at distance' },
            uFogFar: { value: 20, min: 0, max: 40, step: 0.1, label: 'Fully faded at distance' },
        }),
    })

    useLayoutEffect(() => {
        setRawColor(oceanMat.current.uDepthColor, depthColor)
        setRawColor(oceanMat.current.uSurfaceColor, surfaceColor)
        setRawColor(oceanMat.current.uGlitterColor2, glitterColor2)
    }, [ depthColor, surfaceColor, glitterColor2 ])

    const bigWavesFrequency = [ bigWavesFrequencyX, bigWavesFrequencyZ ]

    /* the wave and horizon settings, shared with anything floating on the water */
    useLayoutEffect(() => {
        for(const [ name, uniform ] of Object.entries(waveUniforms)) {
            if(name in uniforms) uniform.value = uniforms[name]
        }
        waveUniforms.uBigWavesFrequency.value.set(bigWavesFrequencyX, bigWavesFrequencyZ)

        horizonFade.uFogNear.value = uniforms.uFogNear
        horizonFade.uFogFar.value = uniforms.uFogFar
    })

    const pos = sceneCentre
    const rotation = [ - Math.PI * 0.5, 0, 0 ]

    return (
        <>
            <mesh
                geometry={ waterGeometry }
                rotation={ rotation }
                position={ pos }
            >
                <oceanMaterial
                    ref={ oceanMat }
                    side={THREE.DoubleSide}
                    uBigWavesFrequency={bigWavesFrequency}
                    {...uniforms}
                />
            </mesh>

            <WaterGlints ref={glintsMat} waves={{ ...uniforms, uBigWavesFrequency: bigWavesFrequency }} />
        </>
    )
}
