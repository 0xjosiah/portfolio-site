import { ContactShadows, GizmoHelper, MeshTransmissionMaterial, OrbitControls, PivotControls, SpotLight, Text, useHelper } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Section({ }) {
    const { sectionBkgdColor, textPos, textRotation, textColor } = useControls({
        sectionBkgdColor: '#ffffff',
        textPos: [ -0.9, 2, 0.5],
        textRotation: [ -Math.PI * .5 , 0, 0 ],
        textColor: { r: 0, g: 0, b: 0 },
    })
    const light = useRef(null)
    useHelper(light, THREE.DirectionalLightHelper, 1)

    // transmission material config
    const config = useControls({
        backside: false,
        samples: { value: 16, min: 1, max: 32, step: 1 },
        resolution: { value: 256, min: 64, max: 2048, step: 64 },
        transmission: { value: 0.95, min: 0, max: 1 },
        roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
        clearcoat: { value: 0.1, min: 0, max: 1, step: 0.01 },
        clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
        thickness: { value: 200, min: 0, max: 200, step: 0.01 },
        backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
        ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
        chromaticAberration: { value: 1, min: 0, max: 1 },
        anisotropy: { value: 1, min: 0, max: 10, step: 0.01 },
        distortion: { value: 0, min: 0, max: 1, step: 0.01 },
        distortionScale: { value: 0.2, min: 0.01, max: 1, step: 0.01 },
        temporalDistortion: { value: 0, min: 0, max: 1, step: 0.01 },
        attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
        attenuationColor: '#ffffff',
        color: '#ffffff',
      })

    return (
        <>
            {/* Directional Light */}
            {/* <PivotControls
                // anchor={[ 0, 0, 0 ]}
            >
                <directionalLight
                    ref={ light }
                    castShadow
                    position={ [ -1, 4, 1 ] }
                    intensity={ .75 }
                    shadow-mapSize={ [ 2048, 2048 ] }
                    shadow-camera-near={ 1 }
                    shadow-camera-far={ 20 }
                    shadow-camera-top={ 20 }
                    shadow-camera-right={ 20 }
                    shadow-camera-bottom={ - 20 }
                    shadow-camera-left={ - 20 }
                />
            </PivotControls> */}

            {/* Section Title */}
            {/* <PivotControls
                anchor={[ 0, 0, 0 ]}
            > */}
                {/* <Text
                    position={ textPos }
                    rotation={ textRotation }
                    color={ textColor }
                    castShadow
                > */}
                    {/* Work */}
                    {/* <meshMatcapMaterial /> */}
                {/* </Text> */}

            {/* </PivotControls> */}

            {/* Section Board */}
            <mesh
                receiveShadow
                position={[ 0, 0, 0 ]}
            >
                <planeGeometry args={[ 4, 4]} />
                <meshStandardMaterial color={ sectionBkgdColor } side={THREE.DoubleSide}/>
                {/* <MeshTransmissionMaterial {...config} /> */}
            </mesh>
        </>
    )
}