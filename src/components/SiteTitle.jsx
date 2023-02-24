import { Text3D, useTexture } from '@react-three/drei'

export default function SiteTitle(props) {
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
        <Text3D font={'./fonts/dosis/Dosis_Regular.json'} {...textOptions} {...props}>
            {text}
            <meshMatcapMaterial matcap={ chrome } />
        </Text3D>
    )
}