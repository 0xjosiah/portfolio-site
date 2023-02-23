import { Float, OrbitControls, Sky, Text } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import Section from './components/Section'

export default function Experience() {

    return (
        <>
            <OrbitControls makeDefault />
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            <Section />
            <Float
                position={[ -2, 2, 2 ]}
            >
                <Text color='black'>
                    About
                </Text>
            </Float>
            <Float
                position={[ -.75, 3.25, -4 ]}
            >
                <Text color='black'>
                    Experience
                </Text>
            </Float>
            <Float
                position={[ 2, .9, 1 ]}
            >
                <Text color='black'>
                    Contact
                </Text>
            </Float>
            <Float
                position={[ -10, .5, -8 ]}
            >
                <Text color='black'>
                    Projects
                </Text>
            </Float>
        </>
    )
}