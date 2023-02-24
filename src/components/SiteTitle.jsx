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

export default function SiteTitle() {
    // const [ font, setFont ] = useState()
    // useEffect(() => {
    //     new FontLoader().load(
    //         './fonts/dosis/Dosis_Regular.json',
    //         (font) => setFont(font)
    //     )
    // }, [])

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

    const props = useTexture({
        matcap: './textures/matcaps/3.png'
    })

    return (
        <Text3D font={'./fonts/dosis/Dosis_Regular.json'} {...textOptions}>
            0xjosiah
            <meshMatcapMaterial {...props} />
        </Text3D>
    )
}