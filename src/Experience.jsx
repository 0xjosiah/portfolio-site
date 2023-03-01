import { Billboard, Float, GradientTexture, Html, Mask, OrbitControls, Scroll, ScrollControls, Sky, Text, Text3D, Trail, useMask } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { PlaneGeometry } from 'three'
import { Fish } from './components/Fish'
import Ocean from './components/Ocean'
import Section from './components/Section'
import SiteTitle from './components/SiteTitle'

export default function Experience() {

    const { width, height } = useThree((state) => state.viewport)

    const { position, rotation, invert } = useControls({
        position: [ 0, 0, 0 ],
        rotation: [ 0, 0, 0 ],
    })

    const {x, y, z} = useThree((state) => state.camera.position)
    // console.log(camPos)

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            <SiteTitle text='0xJosiah' position={ [ -0.35, -0.2, 4.5 ] } rotation={ [ 0, 1, 0.09 ] } />
            
            <Section position={[ 3.5, 0.5, 6.5 ]} />
            {/* <Mask id={1} invert={false}>
                <mesh
                    position={[ 3.5, 0.5, 6.5 ]}
                >
                    <planeGeometry />
                </mesh>
            </Mask> */}


            <ScrollControls pages={6} infinite horizontal>
                <Scroll>
                    <Float
                        position={[ width * 0.6, 2, 2 ]}
                    >
                        {/* <Fish rotation-y={Math.PI * 0.5} position-x={-2} /> */}
                        <Billboard follow={ false } >
                        <Trail
                            width={ 2 }
                            length={ .5 }
                            decay={ .5 }
                            stride={ 0 }
                            attenuation={(width) => width * 2}
                            
                        >
                            <Text castShadow>
                                About
                                <meshBasicMaterial>
                                    <GradientTexture
                                    stops={[0, 1]} // As many stops as you want
                                    colors={['aquamarine', 'hotpink']} // Colors need to match the number of stops
                                    size={1024} // Size is optional, default = 1024
                                    />
                                </meshBasicMaterial>
                            </Text>
                            {/* <Section /> */}

                        </Trail>

                        </Billboard>
                    </Float>
                    <Float
                        position={[ width, 2, -4 ]}
                    >
                        {/* <Fish rotation-y={Math.PI * 0.5} position-x={-2} /> */}
                        <Text color='black'>
                            Experience
                        </Text>
                    </Float>
                    <Float
                        position={[ width*2, 2, -8 ]}
                    >
                        <Text color='black'>
                            Contact
                        </Text>
                    </Float>
                    <Float
                        position={[ width*1.7, 2, 1 ]}
                    >
                        {/* <Fish rotation-y={Math.PI * 0.5} position-x={-2} /> */}
                        <Text color='black'>
                            Projects
                        </Text>
                    </Float>
                </Scroll>
            </ScrollControls>
        </>
    )
}