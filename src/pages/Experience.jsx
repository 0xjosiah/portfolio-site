import { useEffect, useRef, useState } from "react"
import ListLink from "../components/ListLink"
import PageScaffold from "../components/PageScaffold"
import ResumeCallout from "../components/ResumeCallout"
import { jobs } from "../content/jobs"

export default function Experience() {
    const [activeJobIndex, setActiveJobIndex] = useState(0)
    const [jobShown, setJobShown] = useState(jobs[0])
    const tabRefs = useRef([])
    const jobTabContainer = useRef(null)

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

    /* fn runs when new tab is clicked, changes highlighted job tab */
    const highlightTab = () => {
        tabRefs.current[activeJobIndex].className = "job-tab"
        setActiveJobIndex(companiesList.indexOf(jobShown.company))
        tabRefs.current[activeJobIndex].className = "tab-callout job-tab"
    }

    /* fn runs when job tab container is scrolled, changes the box shadow */
    const setScrollPosition = (e) => {
        const scrollPos = jobTabContainer.current.scrollLeft
        const scrollMax = jobTabContainer.current.scrollWidth - jobTabContainer.current.clientWidth
        /* this calcs the offset based on scroll pos */
        /* and sets range bounds from -10 to 10 */
        const shadowOffset = (((scrollPos - scrollMax) / scrollMax) + .5) * 20
        jobTabContainer.current.style.setProperty('--shadow-offset', shadowOffset + 'px')
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
        <PageScaffold title="Experience" socials={true}>
            <div className="page-section-primary">
                <p>
                    A little about my experience and how it can help any team...
                </p>
            </div>
            {/* Renders all experience tabs */}
            <div ref={jobTabContainer} className="job-tab-container" onScroll={(e) => setScrollPosition(e)}>
                {tabs}
            </div>
            {/* Renders specific info about selected experience */}
            <div className="page-section-primary">
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>{jobShown.title} @ <a
                                style={{color: 'inherit'}}
                                href={jobShown.url} // links to company website
                                target="_blank"
                                rel="external"
                            >
                                {jobShown.company}
                            </a>
                        </p>
                        <p>{jobShown.dates}</p>
                    </div>
                    {/* List of selected experience duties */}
                    <ul>
                        {jobShown.duties.map((i, index) => (<li key={`duty${index}`}>{i}</li>))}
                        {/* if has associated proj to show - adds link to projects page, not specific proj */}
                        {jobShown.isProjLink &&
                            <ListLink />
                        }
                    </ul>
                </div>
            </div>
            <div className="page-section-primary" style={{ marginTop: '1em'}}>
                <ResumeCallout />
            </div>
        </PageScaffold>
    )
}