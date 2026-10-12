import { RoundedBox, useTexture } from "@react-three/drei"
import SiteTitle from "./SiteTitle"


export default function Sign({ text, navTo }) {
    const chrome = useTexture('./textures/matcaps/chrome.png')

    /* everything is placed relative to the sign's text, the parent decides where the whole sign goes */
    return (
        <>
            {/* Contact title */}
            <SiteTitle
                text={text}
                navTo={navTo}
                size={.05}
                height={.03}
                bevelThickness={0.005}
                bevelSize={.003}
                letterSpacing={.005}
            />

            {/* arrows for scroll hint */}
            <SiteTitle
                text={'<<'}
                cursorHover={false}
                navTo={null}
                position={[ 0.11, -0.17, -0.03 ]}
                rotation={[ -0.21, 0.33, 1.67 ]}
                size={.05}
                height={.03}
                bevelThickness={0.005}
                bevelSize={.003}
                letterSpacing={.005}
            />

            {/* sign post */}
            <RoundedBox
                position={[ 0.146, -0.121, 0.015 ]}
                args={[ .0095, 0.25, 0.035 ]}
                radius={0.0025} // Radius of the rounded corners. Default is 0.05
                smoothness={4}
            >
                <meshMatcapMaterial matcap={chrome} />
            </RoundedBox>
        </>
    )
}