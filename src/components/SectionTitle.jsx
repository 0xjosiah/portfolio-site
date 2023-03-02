import { Float, Text3D, useTexture } from "@react-three/drei"
import SiteTitle from "./SiteTitle"

export default function SectionTitle(props) {
    // const [ chrome, colorShift, gore, limeGreenToon, skin, slate, sunSet, tan ] = useTexture([
    //     './textures/matcaps/chrome.png',
    //     './textures/matcaps/colorShift.png',
    //     './textures/matcaps/gore.png',
    //     './textures/matcaps/limeGreenToon.png',
    //     './textures/matcaps/skin.png',
    //     './textures/matcaps/slate.png',
    //     './textures/matcaps/sunSet.png',
    //     './textures/matcaps/tan.png',

    // ])

    // const textOptions = {
    //     size: .5,
    //     height: .2,
    //     curveSegments: 5,
    //     bevelEnabled: true,
    //     bevelThickness: 0.03,
    //     bevelSize: .02,
    //     bevelOffset: 0,
    //     bevelSegments: 4
    // }

    const text = props.text

    return (
        <>
            <Float
                {...props}
            >
                {/* <Text3D {...textOptions} font={'./fonts/dosis/Dosis_Regular.json'}>
                    {text}
                    <meshMatcapMaterial matcap={chrome} />
                </Text3D> */}
                <SiteTitle text={text} />
            </Float>
        </>
    )
}