import { RoundedBox, useTexture } from "@react-three/drei"
import SiteTitle from "./SiteTitle"


export default function Sign({ text, navTo }) {
    const chrome = useTexture('./textures/matcaps/chrome.png')

    return (
        <>
            <SiteTitle
                text={text}
                navTo={navTo}
                position={[ 3.6, 0.15, 6.5 ]}
                size={.05}
                height={.03}
                bevelThickness={0.005}
                bevelSize={.003}
                letterSpacing={.005}
            />
            <RoundedBox
                position={[ 3.746, 0.029, 6.515 ]}
                args={[ .0095, 0.25, 0.035 ]}
                radius={0.0025} // Radius of the rounded corners. Default is 0.05
                smoothness={4}
            >
                <meshMatcapMaterial matcap={chrome} />
            </RoundedBox>
        </>
    )
}