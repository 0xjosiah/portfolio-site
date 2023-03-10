import { Box, FirstPersonControls, Html, PivotControls, RoundedBox, Scroll, ScrollControls, Svg, useTexture } from '@react-three/drei'
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


    /* Contact stuff attempt */
    //TODO likely delete this
    const contactStagePos = [ 3.50, -0.25, 6 ]
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
    
    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            {/* <FirstPersonControls
                constrainVertical={true}
                // verticalMax={Math.PI * .5}
                // verticalMin={0}
            /> */}

            <Ocean />
            <SiteTitle text='0xJosiah' navTo='/' position={[ -0.35, -0.2, 4.5 ]} rotation={[ 0, 1, 0.09 ]} />
            <SiteTitle text='CONTACT' navTo='/contact' position={[ 3.6, 0.15, 6.5 ]} size={.05} height={.03} bevelThickness={0.005} bevelSize={.003} letterSpacing={.005} />
            {/* <PivotControls
                anchor={[ 0, 1, 0 ]}
            >
                <RoundedBox
                    args={[1, 1, 1]} // Width, height, depth. Default is [1, 1, 1]
                    radius={0.05} // Radius of the rounded corners. Default is 0.05
                    smoothness={10} // The number of curve segments. Default is 4
                    position={contactStagePos}
                >
                    <meshBasicMaterial {...instaTexture} />
                </RoundedBox>

            </PivotControls> */}
            
            {/* <Section position={[ 3.5, 0.5, 6.5 ]} /> */}

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