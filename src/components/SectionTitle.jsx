import { Float } from "@react-three/drei"
import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text='Title', navTo='/', position=[ 0, 0, 0 ] }) {

    return (
        <Float position={position}>
            <SiteTitle text={text} navTo={navTo} />
        </Float>
    )
}