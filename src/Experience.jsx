import { OrbitControls, Sky } from '@react-three/drei'
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
        </>
    )
}