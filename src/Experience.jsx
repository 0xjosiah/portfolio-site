import { Float, OrbitControls, Scroll, ScrollControls, Sky, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import Section from './components/Section'
import SiteTitle from './components/SiteTitle'

export default function Experience() {

    const { width, height } = useThree((state) => state.viewport)

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            {/* <Section /> */}
            <SiteTitle />
            <ScrollControls pages={6} infinite horizontal>
                <Scroll>
                    <Float
                        position={[ width * 0.6, 2, 2 ]}
                    >
                        <Text color='black'>
                            About
                        </Text>
                    </Float>
                    <Float
                        position={[ width, 2, -4 ]}
                    >
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
                        <Text color='black'>
                            Projects
                        </Text>
                    </Float>
                </Scroll>
            </ScrollControls>
        </>
    )
}