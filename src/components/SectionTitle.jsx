import { Float } from "@react-three/drei"
import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text, navTo, position }) {

    return (
        <Float position={position}>
            <SiteTitle text={text} navTo={navTo} />
        </Float>
    )
}