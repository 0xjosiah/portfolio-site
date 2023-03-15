import PageScaffold from "../components/PageScaffold"

export default function About() {
   
    return (
        <PageScaffold title="About me">
            <p className="page-content">
                This page is alll about me! <br/>
                I am the <span className="keyword-callout">
                shit</span>, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an <span className="keyword-callout">absolute</span> nob not to hire me. <br/>
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                <span className="keyword-callout">You'd</span> be an absolute nob not to hire me. <br/>
                This page is alll about me!
                I am the shit, plain and simple.
                You'd be an absolute nob not to <span className="keyword-callout">hire me</span> .
            </p>
            {/* <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p>
            <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p>
            <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p> */}
        </PageScaffold>
    )
}