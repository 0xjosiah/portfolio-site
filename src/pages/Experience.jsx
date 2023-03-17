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
                <button className="job-btn job-callout" onClick={e => changeJobDisplay(e)}>
                    {company}
                </button>

            )
        }

        return (
            <button className="job-btn" onClick={e => changeJobDisplay(e)}>
                {company}
            </button>
        )
    })

    const changeJobDisplay = (e) => {
        const job = e.target.innerHTML
        console.log(job)
    }

    return (
        <PageScaffold title="Experience">
            <div className="page-content">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            <div className="job-btn-container">
                {buttons}
            </div>
            <div className="page-content">
                <div>
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