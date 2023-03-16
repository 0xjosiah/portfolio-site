import PageScaffold from "../components/PageScaffold";

export default function Experience() {

    return (
        <PageScaffold title="Experience">
            <div className="page-content">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', fontWeight: 'normal', borderBottom: '0px solid white', padding: '1em', alignItems: 'center', color: '#fff'}}>
                <div>
                    <span className="job-callout">Job 1</span><br/>
                </div>
                <div>
                    {/* <span className="keyword-callout"> */}
                        Job 2
                    {/* </span> */}
                </div>
                <div>
                    {/* <span className="keyword-callout"> */}
                        Job 3
                    {/* </span> */}
                </div>
                <div>
                    {/* <span className="keyword-callout"> */}
                        Job 4
                    {/* </span> */}
                </div>
                <div>
                    {/* <span className="keyword-callout"> */}
                        Job 5
                    {/* </span> */}
                </div>
                <div>
                    {/* <span className="keyword-callout"> */}
                        Job 6
                    {/* </span> */}
                </div>
            </div>
            <div className="page-content">
                <div style={{ padding: '1em'}}>
                    {/* <span className="keyword-callout">Job 1</span><br/> */}
                    Very Important Job Title
                    <ul>
                        <li>this, that, and the other</li>
                        <li>this, that, and the other</li>
                        <li>this, that, and the other</li>
                    </ul>
                </div>
            </div>
        </PageScaffold>
    )
}