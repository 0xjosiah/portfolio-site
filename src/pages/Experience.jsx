import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const companiesList = jobs.map(i => i.company)
    const buttons = companiesList.map((company, index) => {
        if(index == 0) {
            return (
                <button className="job-btn job-callout">
                    {company}
                </button>

            )
        }
        return (
            <button className="job-btn">
                {company}
            </button>
        )
    })

    console.log(buttons)

    return (
        <PageScaffold title="Experience">
            <div className="page-content">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            <div className="job-btn-container">
                {buttons}
                {/* <div>
                    <span className="job-callout">
                        Job 1
                    </span><br/>
                </div>
                <div>
                    Job 2
                </div>
                <div>
                    Job 3
                </div>
                <div>
                    Job 4
                </div>
                <div>
                    Job 5
                </div>
                <div>
                    Job 6
                </div> */}
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