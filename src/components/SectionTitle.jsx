import { Float } from "@react-three/drei"
import { Link } from "react-router-dom"
import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text, linkTo, position }) {

    return (
        // <Link to={linkTo}>
            <Float position={position}>
                <SiteTitle text={text} />
            </Float>
        // </Link>
        /* maybe add link in html tag in SiteTitle */
    )
}