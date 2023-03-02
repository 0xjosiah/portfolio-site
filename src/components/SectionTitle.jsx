import { Float } from "@react-three/drei"
import SiteTitle from "./SiteTitle"

export default function SectionTitle(props) {

    const text = props.text

    return (
        <Float {...props}>
            <SiteTitle text={text} />
        </Float>
    )
}