import { Text3D, useCursor, useTexture } from "@react-three/drei"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SiteTitle({
    /* prop defaults */
    text='Title',
    position=[ 0, 0, 0 ],
    rotation=[ 0, 0, 0 ],
    navTo='/',
    size=.5,
    height=.2,
    curveSegments=5,
    bevelEnabled=true,
    bevelThickness=0.03,
    bevelSize=.02,
    bevelOffset=0,
    bevelSegments=4.,
    letterSpacing=0,
    cursorHover=true
}) {
    
    const ref = useRef(null)
    const nav = useNavigate()
    const clickNav = () => nav(navTo)

    const [hovered, setHovered] = useState(false)
    if(cursorHover) useCursor(hovered)
    
    const textOptions = {
        size,
        height,
        curveSegments,
        bevelEnabled,
        bevelThickness,
        bevelSize,
        bevelOffset,
        bevelSegments,
        letterSpacing
    }

    const chrome = useTexture('./textures/matcaps/chrome.png')

    return (
        <Text3D
            font={'./fonts/dosis/Dosis_Regular.json'}
            position={position}
            rotation={rotation}
            onClick={clickNav}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            {...textOptions}
            ref={ref}
        >
            {text}
            <meshMatcapMaterial matcap={chrome} />
        </Text3D>
    )
}