import { Billboard, Float, Scroll, ScrollControls, Text, Text3D, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import SectionTitle from './components/SectionTitle'
import SiteTitle from './components/SiteTitle'

export default function Scene() {

    const { width, height } = useThree((state) => state.viewport)

    /* General purpose controls, attach to whatever for adjustment */
    // const { position, rotation } = useControls({
    //     position: [ 0, 0, 0 ],
    //     rotation: [ 0, 0, 0 ],
    // })

    /* Camera position if needed */
    // const {x, y, z} = useThree((state) => state.camera.position)
    // console.log(camPos)

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            {/* <Perf position='top-left' /> */}
            
            <Ocean />
            <SiteTitle text='0xJosiah' position={ [ -0.35, -0.2, 4.5 ] } rotation={ [ 0, 1, 0.09 ] } />
            
            {/* <Section position={[ 3.5, 0.5, 6.5 ]} /> */}

            <ScrollControls pages={6} infinite horizontal>
                <Scroll>

                    <SectionTitle text={'ABOUT'} position={[width * 0.6, 2, 2]} />
                    <SectionTitle text={'EXPERIENCE'} position={[width, 2, -4]} />
                    <SectionTitle text={'PROJECTS'} position={[width * 1.7, 2, 1]} />

                </Scroll>
            </ScrollControls>
        </>
    )
}