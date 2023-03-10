export default function About() {
    const styles = {
        position: 'absolute',
        top: 5,
        left: 5
    }
    return (
        <div style={{...styles}}>
            <h2 className="page-title">
                About me
            </h2>
            <p className="page-content">
                This page is alll about me!
            </p>
        </div>
    )
}