import { useEffect, useRef, useState } from "react"
import PageScaffold from "../components/PageScaffold"
import { jobs } from "../content/jobs"

export default function Experience() {
    const [activeJobIndex, setActiveJobIndex] = useState(0)
    const [jobShown, setJobShown] = useState(jobs[0])
    const tabRefs = useRef([])

    /* creates the tabs used to view different experience listings */
    const companiesList = jobs.map(i => i.company)
    const tabs = companiesList.map((company, index) => (
        <button
            key={index}
            ref={(element) => {tabRefs.current[index] = element}}
            className={activeJobIndex === index ? "tab-callout job-tab" : "job-tab"}
            onClick={e => changeJobDisplay(e)}
        >
            {company}
        </button>
    ))

    /* fn runs when new tab is clicked */
    const highlightTab = () => {
        tabRefs.current[activeJobIndex].className = "job-tab"
        setActiveJobIndex(companiesList.indexOf(jobShown.company))
        tabRefs.current[activeJobIndex].className = "tab-callout job-tab"
    }

    /* when jobShown changes via tab click, the highlighted tab changes accordingly */
    useEffect(() => highlightTab(), [jobShown])

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
            <div className="page-section-primary">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            <div className="job-tab-container">
                {tabs}
            </div>
            <div className="page-section-primary">
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>{jobShown.title} @ <a
                                style={{color: 'inherit'}}
                                href={jobShown.url}
                                target="_blank"
                                rel="external"
                            >
                                {jobShown.company}
                            </a>
                        </p>
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