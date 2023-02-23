import { Float, OrbitControls, Scroll, ScrollControls, Sky, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import Section from './components/Section'

export default function Experience() {

    const { width, height } = useThree((state) => state.viewport)

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            {/* <Section /> */}
            <ScrollControls pages={4} infinite>
                <Scroll>
                    <Float
                        position={[ -2, 2, 2 ]}
                    >
                        <Text color='black'>
                            About
                        </Text>
                    </Float>
                    <Float
                        position={[ -.75, -height, -4 ]}
                    >
                        <Text color='black'>
                            Experience
                        </Text>
                    </Float>
                    <Float
                        position={[ 2, -height * 2, 1 ]}
                    >
                        <Text color='black'>
                            Contact
                        </Text>
                    </Float>
                    <Float
                        position={[ -10, -height * 3, -8 ]}
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