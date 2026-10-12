import SiteTitle from "./SiteTitle"

export default function SectionTitle({ text='Title', navTo='/', position=[ 0, 0, 0 ] }) {
    return (
        <group position={position}>
            <SiteTitle
                text={text}
                navTo={navTo}
            />
        </group>
    )
}
