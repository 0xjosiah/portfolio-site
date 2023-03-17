import { useEffect, useState } from "react"
import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const [jobShown, setJobShown] = useState(jobs[0])

    /* creates the buttons used to view different experience listings */
    const companiesList = jobs.map(i => i.company)
    const buttons = companiesList.map((company, index) => {
        if(index == 0) {
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

    /* function changes the job displayed */
    const changeJobDisplay = (e) => {
        const company = e.target.innerHTML
        for(const i of jobs) {
            if(i.company === company) {
                setJobShown(i)
            }
        }
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