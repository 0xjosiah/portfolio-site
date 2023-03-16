import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const companiesList = jobs.map(i => i.company)
    const buttons = companiesList.map(i => (
        <button className="job-btn">
            <span className="job-callout">
                {i}
            </span>
        </button>
    ))

    console.log(buttons)

    return (
        <PageScaffold title="Experience">
            <div className="page-content">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', fontWeight: 'normal', borderBottom: '0px solid white', padding: '1em', alignItems: 'center', color: '#fff'}}>
                <div>
                    <span className="job-callout">
                        Job 1
                    </span><br/>
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
                <div>
                    {/* <span className="keyword-callout">Job 1</span><br/> */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>Job Title @ <a>Company</a></p>
                        <p>Date - 2009</p>
                    </div>
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