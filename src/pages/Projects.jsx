import { useRef, useState } from "react"
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs"
import PageScaffold from "../components/PageScaffold"
import ProjectCard from "../components/ProjectCard"
import { projects } from "../content/projects"

export default function Projects() {
    const [projShownIndex, setProjShownIndex] = useState(0)
    const dotsRefs = useRef([])
    const leftBtn = useRef(null)
    const rightBtn = useRef(null)
    // const cardsRefs = useRef([])

    /* produces carousel dot elements */
    const carouselDots = projects.map((proj, index) => {
        if(index == projShownIndex) return (<span key={index} ref={(element) => {dotsRefs.current[index] = element}} className="project-carousel-dot active"></span>)
        return (
            <span key={index} ref={(element) => {dotsRefs.current[index] = element}} className="project-carousel-dot"></span>
        )
    })

    const cycleProjects = (direction) => {
        if(direction === 'left') {
            if(projShownIndex > 0) { setProjShownIndex(prev => prev -= 1) }
            else { setProjShownIndex(projects.length - 1) }
        }
        if(direction === 'right') {
            if(projShownIndex === projects.length - 1) { setProjShownIndex(0) }
            else { setProjShownIndex(prev => prev += 1) }
        }
    }

    /* TODO: make this functional */
    const handleBtnClick = (event) => {
        dotsRefs.current[projShownIndex].className = "project-carousel-dot"
        if(event.currentTarget == leftBtn.current) cycleProjects('left')
        if(event.currentTarget == rightBtn.current) cycleProjects('right')
        dotsRefs.current[projShownIndex].className = "project-carousel-dot active"
    }

    const projCards = projects.map((proj, index) => {
        if(index == projShownIndex) {
            return (
                <ProjectCard
                    // ref={(element) => {cardsRefs.current[index] = element}}
                    key={`proj${index}`}
                    style={{ display: 'block' }}
                    {...proj}
                />
            )
        }
        return (
                <ProjectCard
                    // ref={(element) => {cardsRefs.current[index] = element}}
                    key={`proj${index}`}
                    style={{ display: 'none' }}
                    {...proj}
                />
        )
    })
    
    return (
        <PageScaffold title="Projects" style={{ maxWidth: "75vw" }}>
            <div className="project-carousel-position">
                {carouselDots}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                <button
                    style={{ padding: "0", margin: "1.5rem", background: "none", border: "none", cursor: "pointer" }}
                    onClick={(e) => handleBtnClick(e)}
                    ref={leftBtn}
                >
                    <BsArrowLeftCircleFill id="left" className="social-icon" style={{ borderRadius: "30px", padding: "2.5px" }} />
                </button>

                {projCards}

                <button
                    style={{ padding: "0", margin: "1.5rem", background: "none", border: "none", cursor: "pointer" }}
                    onClick={(e) => handleBtnClick(e)}
                    ref={rightBtn}
                >
                    <BsArrowRightCircleFill className="social-icon" style={{ borderRadius: "30px", padding: "2.5px" }} />
                </button>

            </div>
        </PageScaffold>
    )
}