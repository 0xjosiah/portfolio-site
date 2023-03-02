import { Float } from "@react-three/drei"
import { Link, useNavigate } from "react-router-dom"
import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text, linkTo, position }) {

    const navigate = useNavigate()

    const clickNav = () => {
        navigate(linkTo)
    }

    return (
        <Float position={position} onClick={clickNav}>
            <SiteTitle text={text} linkTo={linkTo}/>
        </Float>
    )
}