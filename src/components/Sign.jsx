import { RoundedBox, useTexture } from "@react-three/drei"
import SiteTitle from "./SiteTitle"


export default function Sign({ text, navTo }) {
    const chrome = useTexture('./textures/matcaps/chrome.png')

    return (
        <>
            {/* Contact title */}
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

            {/* arrows for scroll hint */}
            <SiteTitle
                text={'<<'}
                cursorHover={false}
                navTo={null}
                position={[ 3.71, -0.02, 6.47 ]}
                rotation={[ -0.21, 0.33, 1.67 ]}
                size={.05}
                height={.03}
                bevelThickness={0.005}
                bevelSize={.003}
                letterSpacing={.005}
            />

            {/* sign post */}
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