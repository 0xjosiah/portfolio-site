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