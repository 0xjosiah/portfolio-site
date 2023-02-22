import { OrbitControls } from '@react-three/drei'
import Ocean from './components/Ocean'
import Section from './components/Section'

export default function Experience() {
    
    return (
        <>
            <OrbitControls makeDefault />
            {/* <ambientLight intensity={ 0.5 } /> */}
            
            <Ocean />
            {/* <Section /> */}
        </>
    )
}