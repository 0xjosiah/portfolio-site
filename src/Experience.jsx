import { GizmoHelper, OrbitControls, PivotControls, SpotLight, Text, useHelper } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Experience() {
    const { sectionBkgdColor } = useControls({ sectionBkgdColor: '#ffffff' })
    const light = useRef(null)
    useHelper(light, THREE.DirectionalLightHelper, 1)
    return (
        <>
            <OrbitControls makeDefault />
            {/* <ambientLight intensity={ 0.5 } /> */}

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
                    position={[ 0, 3, 0 ]}
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