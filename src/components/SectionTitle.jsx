import { Float } from "@react-three/drei"
import SiteTitle from "./SiteTitle"
import { useRef, useState } from "react"

export default function SectionTitle({ text='Title', navTo='/', position=[ 0, 0, 0 ] }) {
    const [hover, setHover] = useState(false)
    const ref = useRef(null)

    const hoverState = () => {
        setHover(prev => !prev)
        if(!hover) {
            ref.current.rotationIntensity = 1
            ref.current.speed = 1
        }
        if(hover) {
            ref.current.rotationIntensity = 1.5
            ref.current.speed = 5
        }
    }

    return (
        <Float
            position={position}
            // speed={5} // Animation speed, defaults to 1
            // rotationIntensity={1.5} // XYZ rotation intensity, defaults to 1
            // floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
            // floatingRange={[-1, 1]}
            ref={ref}
            onPointerOver={() => hoverState() }
            onPointerOut={() => hoverState() }
        >
            <SiteTitle
                text={text}
                navTo={navTo}
            />
        </Float>
    )
}