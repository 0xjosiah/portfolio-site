import { ContactShadows, GizmoHelper, OrbitControls, PivotControls, SpotLight, Text, useHelper } from '@react-three/drei'
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

    return (
        <>
            {/* Directional Light */}
            <PivotControls
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
            </PivotControls>

            {/* Section Title */}
            <PivotControls
                anchor={[ 0, 0, 0 ]}
            >
                <Text
                    position={ textPos }
                    rotation={ textRotation }
                    color={ textColor }
                    castShadow
                >
                    Work
                    {/* <meshMatcapMaterial /> */}
                </Text>

            </PivotControls>

            {/* Section Board */}
            <mesh
                receiveShadow
                position={[ 0, 0, 0 ]}
            >
                <planeGeometry args={[ 4, 4]} />
                <meshStandardMaterial color={ sectionBkgdColor } side={THREE.DoubleSide}/>
            </mesh>
        </>
    )
}