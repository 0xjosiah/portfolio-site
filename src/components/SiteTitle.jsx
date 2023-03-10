import { Text3D, useCursor, useTexture } from "@react-three/drei"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SiteTitle({
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
    letterSpacing=0
}) {

    const nav = useNavigate()
    const clickNav = () => nav(navTo)

    const [hovered, setHovered] = useState(false)
    useCursor(hovered)
    
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

    // TODO: clean up when decide texture
    const [ chrome, colorShift, gore, limeGreenToon, skin, slate, sunSet, tan ] = useTexture([
        './textures/matcaps/chrome.png',
        './textures/matcaps/colorShift.png',
        './textures/matcaps/gore.png',
        './textures/matcaps/limeGreenToon.png',
        './textures/matcaps/skin.png',
        './textures/matcaps/slate.png',
        './textures/matcaps/sunSet.png',
        './textures/matcaps/tan.png',

    ])

    return (
        <Text3D
            font={'./fonts/dosis/Dosis_Regular.json'}
            position={position}
            rotation={rotation}
            onClick={clickNav}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            {...textOptions}
        >
            {text}
            <meshMatcapMaterial matcap={chrome} />
        </Text3D>
    )
}