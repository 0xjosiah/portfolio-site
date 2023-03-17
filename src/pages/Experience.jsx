import { useEffect, useState } from "react"
import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const [selection, setSelection] = useState(0)
    const [jobShown, setJobShown] = useState(jobs[0])

    const companiesList = jobs.map(i => i.company)
    const buttons = companiesList.map((company, index) => {
        if(index == selection) {
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

    useEffect(() => {
        
    }, [ selection ])


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
                        <p>{jobShown.title} @ <a>{jobShown.company}</a></p>
                        <p>{jobShown.dates}</p>
                    </div>
                    <ul>
                        {jobShown.duties.map(i => (<li>{i}</li>))}
                    </ul>
                </div>
            </div>
        </PageScaffold>
    )
}