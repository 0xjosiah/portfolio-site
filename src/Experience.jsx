import { Billboard, Float, Scroll, ScrollControls, Text, Text3D, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import SiteTitle from './components/SiteTitle'

export default function Experience() {

    const { width, height } = useThree((state) => state.viewport)

    const { position, rotation } = useControls({
        position: [ 0, 0, 0 ],
        rotation: [ 0, 0, 0 ],
    })

    const {x, y, z} = useThree((state) => state.camera.position)
    // console.log(camPos)

    // TODO: clean up when decide texture
    const [ chrome, colorShift, gore, limeGreenToon, skin, slate, sunSet, tan ] = useTexture([
        './textures/matcaps/chrome.png',
        './textures/matcaps/colorShift.png',
        './textures/matcaps/gore.png',
        './textures/matcaps/limeGreenToon.png',
        './textures/matcaps/skin.png',
        './textures/matcaps/slate.png',
        './textures/matcaps/sunSet.png',
        './textures/matcaps/tan.png',

    ])

    const textOptions = {
        size: .5,
        height: .2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: .02,
        bevelOffset: 0,
        bevelSegments: 4
    }

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            <SiteTitle text='0xJosiah' position={ [ -0.35, -0.2, 4.5 ] } rotation={ [ 0, 1, 0.09 ] } />
            
            {/* <Section position={[ 3.5, 0.5, 6.5 ]} /> */}

            <ScrollControls pages={6} infinite horizontal>
                <Scroll>

                    <Float
                        position={[ width * 0.6, 2, 2 ]}
                    >
                        <Billboard follow={ false } >
                            <Text3D {...textOptions} font={'./fonts/dosis/Dosis_Regular.json'}>
                                ABOUT
                                <meshMatcapMaterial matcap={chrome} />
                            </Text3D>
                        </Billboard>
                    </Float>

                    <Float
                        position={[ width, 2, -4 ]}
                    >
                        <Text color='black'>
                            Experience
                        </Text>
                    </Float>

                    <Float
                        position={[ width*1.7, 2, 1 ]}
                    >
                        <Text color='black'>
                            Projects
                        </Text>
                    </Float>

                </Scroll>
            </ScrollControls>
        </>
    )
}