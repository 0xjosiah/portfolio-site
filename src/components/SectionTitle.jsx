import { Float } from "@react-three/drei"
import { Link, useNavigate } from "react-router-dom"
import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text, navTo, position }) {

    const navigate = useNavigate()

    const clickNav = () => {
        navigate(linkTo)
    }

    return (
        <Float position={position}>
            <SiteTitle text={text} navTo={navTo} />
        </Float>
    )
}