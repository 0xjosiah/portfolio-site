import { useEffect, useRef, useState } from "react"
import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const [activeJobId, setActiveJobId] = useState(0)
    const [jobShown, setJobShown] = useState(jobs[0])
    const btnRefs = useRef([])

    /* creates the buttons used to view different experience listings */
    const companiesList = jobs.map(i => i.company)
    const buttons = companiesList.map((company, index) => {
        if(index == 0) {
            return (
                <button
                    key={index}
                    ref={(element) => {btnRefs.current[index] = element}}
                    className="job-btn job-callout"
                    onClick={e => changeJobDisplay(e)}
                >
                    {company}
                </button>

            )
        }
        return (
            <button
                key={index}
                ref={(element) => {btnRefs.current[index] = element}}
                className="job-btn"
                onClick={e => changeJobDisplay(e)}
            >
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
                console.log(btnRefs.current);
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
                        {jobShown.duties.map((i, index) => (<li key={`duty${index}`}>{i}</li>))}
                    </ul>
                </div>
            </div>
        </PageScaffold>
    )
}