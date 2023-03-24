export default function ProjectTag({ tag }) {
    return (
        <p
            style={{
                margin: '1rem .5rem 0 0',
                color: 'white',
            }}
        >
            <span className="keyword-callout" style={{textTransform: "capitalize"}}>{tag}</span>
        </p>
    )
}