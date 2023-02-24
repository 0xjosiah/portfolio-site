import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { Text3D, useTexture } from '@react-three/drei'

const fontLoader = new FontLoader()
const font = fontLoader.load(
    // font path
    './fonts/dosis/Dosis_Regular.json',

    // onLoad callback
    (font) => font
)

export default function SiteTitle(props) {
    // const [ font, setFont ] = useState()
    // useEffect(() => {
    //     new FontLoader().load(
    //         './fonts/dosis/Dosis_Regular.json',
    //         (font) => setFont(font)
    //     )
    // }, [])
    const text = props.text
    const textOptions = {
        size: .5,
        height: .2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: .02,
        bevelOffset: 0,
        bevelSegments: 4
    }

    const textureProps = useTexture({
        matcap: './textures/matcaps/chrome.png'
    })

    return (
        <Text3D font={'./fonts/dosis/Dosis_Regular.json'} {...textOptions} {...props}>
            {text}
            <meshMatcapMaterial {...textureProps} />
        </Text3D>
    )
}