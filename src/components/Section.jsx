import { GizmoHelper, OrbitControls, PivotControls, SpotLight, Text, useHelper } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Section({ }) {
    const { sectionBkgdColor, textPos, textRotation } = useControls({ sectionBkgdColor: '#ffffff', textPos: [ -0.9, 2, 0.5], textRotation: [ -Math.PI * .5 , 0, 0 ] })
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
                    intensity={ 1.5 }
                    shadow-mapSize={ [ 1024, 1024 ] }
                    shadow-camera-near={ 1 }
                    shadow-camera-far={ 10 }
                    shadow-camera-top={ 10 }
                    shadow-camera-right={ 10 }
                    shadow-camera-bottom={ - 10 }
                    shadow-camera-left={ - 10 }
                />
            </PivotControls>

            {/* Section Title */}
            <PivotControls
                anchor={[ 0, 0, 0 ]}
            >
                <Text
                    position={ textPos }
                    rotation={ textRotation }
                    castShadow
                >
                    Work
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