import { RoundedBox, Scroll, ScrollControls, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import SectionTitle from './components/SectionTitle'
import SiteTitle from './components/SiteTitle'
import Contact from './pages/Contact'

export default function Scene() {

    const { width, height } = useThree((state) => state.viewport)

    /* General purpose controls, attach to whatever for adjustment */
    // const { position, rotation } = useControls({
    //     position: [ 0, 0, 0 ],
    //     rotation: [ 0, 0, 0 ],
    // })

    /* Camera position if needed */
    // const { position } = useThree((state) => state.camera)
    // const { camera } = useThree((state) => state)
    // console.log('camPos', position)


    const chrome = useTexture('./textures/matcaps/chrome.png')
    
    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}

            <Ocean />
            <SiteTitle text='0xJosiah' navTo='/' position={[ -0.35, -0.2, 4.5 ]} rotation={[ 0, 1, 0.09 ]} />
            <SiteTitle text='CONTACT' navTo='/contact' position={[ 3.6, 0.15, 6.5 ]} size={.05} height={.03} bevelThickness={0.005} bevelSize={.003} letterSpacing={.005} />
            <RoundedBox position={[ 3.746, 0.029, 6.515 ]} args={[ .0095, 0.25, 0.035 ]}
                radius={0.0025} // Radius of the rounded corners. Default is 0.05
                smoothness={4}
            >
                <meshMatcapMaterial matcap={chrome} />
            </RoundedBox>

            <ScrollControls pages={6} infinite horizontal>
                <Scroll>

                    <SectionTitle text='ABOUT' navTo='/about' position={[ width * 0.6, 2, 2 ]} />
                    <SectionTitle text='EXPERIENCE' navTo='/experience' position={[ width, 2, -4 ]} />
                    <SectionTitle text='PROJECTS' navTo='/projects' position={[ width * 1.7, 2, 1 ]} />

                </Scroll>
            </ScrollControls>
        </>
    )
}