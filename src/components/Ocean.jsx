import vertexShader from '../shaders/ocean/vertex.glsl'
import fragmentShader from '../shaders/ocean/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

// console.log(vertex)
// console.log(fragment)

const debugObject = {}
debugObject.depthColor = 0x365187
debugObject.surfaceColor = 0xf291a0

const waterGeometry = new THREE.PlaneGeometry(15, 15, 512, 512)

const OceanMaterial = shaderMaterial(
    /* Uniforms */
    {
        uTime: 0,

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
    },
    vertexShader,
    fragmentShader
)

extend({ OceanMaterial })

export default function Ocean() {
    const oceanMat = useRef(null)
    useFrame((state, delta) => {
        oceanMat.current.uTime += delta
    })

    return (
        <>
            <mesh
                geometry={ waterGeometry }
                rotation-x={ - Math.PI * 0.5 }
            >
                <oceanMaterial ref={ oceanMat } />
            </mesh>
        </>
    )
}