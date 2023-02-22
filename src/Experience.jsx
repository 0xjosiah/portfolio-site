import { OrbitControls } from '@react-three/drei'
import Section from './components/Section'

export default function Experience() {
    
    return (
        <>
            <OrbitControls makeDefault />
            {/* <ambientLight intensity={ 0.5 } /> */}

            <Section />
        </>
    )
}