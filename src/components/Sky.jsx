import vertexShader from '../shaders/sky/vertex.glsl'
import fragmentShader from '../shaders/sky/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useLayoutEffect, useRef } from 'react'
import { palette, paletteDefaults, setSunDirection, sunDirection, useSunPosition } from '../sunset'
import { setRawColor } from '../controls'

/* Panel angles are degrees above the horizon, the shader works in height (the y of the view direction) */
const heightAt = (degrees) => Math.sin(THREE.MathUtils.degToRad(degrees))

/* Start and end of a colour blend as heights, kept apart so a zero-width blend is a hard line rather than undefined */
function setBlend(uniform, [ start, end ]) {
    const from = heightAt(start)
    uniform.set(from, Math.max(heightAt(end), from + 0.0001))
}

/* Has to stay inside the camera's far plane */
const skyGeometry = new THREE.SphereGeometry(100, 32, 16)

const SkyMaterial = shaderMaterial(
    /* Uniforms */
    {
        uSunDirection: sunDirection,

        uZenithColor: palette.zenith,
        uMidColor: palette.mid,
        uHorizonColor: palette.horizon,
        uSunColor: palette.sun,
        uSunDiscColor: palette.sunDisc,

        uSunSize: 0.045,
        uGlowStrength: 0.7,
        uHazeStrength: 0.85,
        uHazeFalloff: 16.0,

        /* (start, end) height of each colour blend */
        uHorizonBlend: new THREE.Vector2(0.0, 0.14),
        uMidBlend: new THREE.Vector2(0.08, 0.42),
    },
    vertexShader,
    fragmentShader,
    /* shaderMaterial copies its uniform values, hand the shared sun and palette objects back so edits to them show */
    (material) => {
        material.uSunDirection = sunDirection
        material.uZenithColor = palette.zenith
        material.uMidColor = palette.mid
        material.uHorizonColor = palette.horizon
        material.uSunColor = palette.sun
        material.uSunDiscColor = palette.sunDisc
    }
)

extend({ SkyMaterial })

export default function Sky() {
    /* Sun position and palette are shared with the ocean, so these also move its glitter and horizon fade */
    const skyMat = useRef(null)

    const { azimuth, elevation } = useSunPosition()

    const { zenith, mid, horizon, sun, sunDisc, horizonBlend, midBlend, hazeHeight, ...uniforms } = useControls('Sky & Sun', {
        'Sun appearance': folder({
            uSunSize: { value: 0.045, min: 0, max: 0.2, step: 0.001, label: 'Disc size' },
            sunDisc: { value: paletteDefaults.sunDisc, label: 'Disc colour' },
            uGlowStrength: { value: 0.7, min: 0, max: 2, step: 0.01, label: 'Glow brightness' },
            sun: { value: paletteDefaults.sun, label: 'Glow + water glitter colour' },
        }),
        'Sky gradient': folder({
            /*
             * Listed top of sky down to the horizon. Each blend is a pair of handles in degrees above the horizon:
             * below the first the lower colour is solid, above the second the upper colour is solid. Slide both to
             * move where the colours meet, pull them apart for a softer blend, and overlap the two blends to squeeze
             * the middle band out.
             */
            zenith: { value: paletteDefaults.zenith, label: 'Top of sky colour' },
            midBlend: { value: [ 4.6, 24.8 ], min: 0, max: 60, step: 0.1, label: 'Middle → top blend (°)' },
            mid: { value: paletteDefaults.mid, label: 'Middle band colour' },
            horizonBlend: { value: [ 0, 8 ], min: 0, max: 60, step: 0.1, label: 'Horizon → middle blend (°)' },
            horizon: { value: paletteDefaults.horizon, label: 'Horizon + ocean fade colour' },
            uHazeStrength: { value: 0.85, min: 0, max: 1, step: 0.01, label: 'Horizon haze amount' },
            hazeHeight: { value: 3.6, min: 0.1, max: 30, step: 0.1, label: 'Horizon haze height (°)' },
        }),
    })

    useLayoutEffect(() => {
        setSunDirection(azimuth, elevation)
    }, [ azimuth, elevation ])

    useLayoutEffect(() => {
        setRawColor(palette.zenith, zenith)
        setRawColor(palette.mid, mid)
        setRawColor(palette.horizon, horizon)
        setRawColor(palette.sun, sun)
        setRawColor(palette.sunDisc, sunDisc)
    }, [ zenith, mid, horizon, sun, sunDisc ])

    useLayoutEffect(() => {
        setBlend(skyMat.current.uHorizonBlend, horizonBlend)
        setBlend(skyMat.current.uMidBlend, midBlend)
    }, [ horizonBlend, midBlend ])

    return (
        <mesh
            geometry={ skyGeometry }
            renderOrder={ -1 }
            frustumCulled={ false }
        >
            <skyMaterial ref={skyMat} side={THREE.BackSide} depthWrite={false} uHazeFalloff={1 / heightAt(hazeHeight)} {...uniforms} />
        </mesh>
    )
}
