import { OrbitControls, Sky } from '@react-three/drei'
import { useControls } from 'leva'
import Ocean from './components/Ocean'
import Section from './components/Section'

export default function Experience() {
    /* sky controls */
    // const { turbidity, rayleigh, mieCoefficient, mieDirectionalG, elevation, azimuth, exposure } = useControls({
    //     turbidity: 10,
    //     rayleigh: 3,
    //     mieCoefficient: 0.005,
    //     mieDirectionalG: .7,
    //     elevation: 2,
    //     azimuth: 180,
    //     exposure: .5,
    // })

    return (
        <>
            <OrbitControls makeDefault />
            {/* <ambientLight intensity={ 0.5 } /> */}
            
            <Ocean />
            {/* <Sky 
                turbidity={ turbidity }
                rayleigh={ rayleigh }
                mieCoefficient={ mieCoefficient }
                mieDirectionalG={ mieDirectionalG }
                elevation={ elevation }
                azimuth={ azimuth }
                exposure={ exposure }
            /> */}
            {/* <Section /> */}
        </>
    )
}