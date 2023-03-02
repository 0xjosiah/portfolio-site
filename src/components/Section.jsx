import { ContactShadows, GizmoHelper, Html, Mask, MeshTransmissionMaterial, OrbitControls, PivotControls, SpotLight, Text, Torus, useHelper, useMask } from '@react-three/drei'
import { useControls } from 'leva'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Section(props) {
    const { sectionBkgdColor, textPos, textRotation, textColor, invert } = useControls({
        sectionBkgdColor: '#f5d5d5',
        textPos: [ -0.9, 2, 0.5],
        textRotation: [ -Math.PI * .5 , 0, 0 ],
        textColor: { r: 0, g: 0, b: 0 },
        invert: false
    })
    const light = useRef(null)
    useHelper(light, THREE.DirectionalLightHelper, 1)

    // transmission material config
    // const config = useControls({
    //     backside: false,
    //     samples: { value: 16, min: 1, max: 32, step: 1 },
    //     resolution: { value: 256, min: 64, max: 2048, step: 64 },
    //     transmission: { value: 0.95, min: 0, max: 1 },
    //     roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    //     clearcoat: { value: 0.1, min: 0, max: 1, step: 0.01 },
    //     clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    //     thickness: { value: 200, min: 0, max: 200, step: 0.01 },
    //     backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
    //     ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
    //     chromaticAberration: { value: 1, min: 0, max: 1 },
    //     anisotropy: { value: 1, min: 0, max: 10, step: 0.01 },
    //     distortion: { value: 0, min: 0, max: 1, step: 0.01 },
    //     distortionScale: { value: 0.2, min: 0.01, max: 1, step: 0.01 },
    //     temporalDistortion: { value: 0, min: 0, max: 1, step: 0.01 },
    //     attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    //     attenuationColor: '#ffffff',
    //     color: '#ffffff',
    //   })

    const html = useRef(null)
    console.log(html.current)

    // useEffect(() => {
    //     const stopScroll = html.current.onscroll((event) => event.preventDefault())
        
    //     return () => stopScroll()
    // })

    const stencil = useMask(1, invert)

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
            <PivotControls
                anchor={[ 0, 0, 0 ]}
                scale={ .2 }
            >
                <Mask
                    id={1}
                    {...props}
                >
                    {/* <planeGeometry /> */}
                    {/* <meshBasicMaterial /> */}
                {/* <mesh
                    {...props}
                > */}
                    <planeGeometry args={[ .5, .5 ]} />
                    <meshBasicMaterial color={ sectionBkgdColor } />
                    {/* <MeshTransmissionMaterial {...config} /> */}
                {/* </mesh> */}
                </Mask>
            </PivotControls>

            {/* test shapes */}
            <mesh>
                <torusGeometry />
                <meshBasicMaterial {...stencil} />
            </mesh>


        </>
    )
}