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

    /* produces carousel dot elements */
    const carouselDots = projects.map((proj, index) => {
        if(index == projShownIndex) return (<span key={index} ref={(element) => {dotsRefs.current[index] = element}} className="project-carousel-dot active"></span>)
        return (
            <span key={index} ref={(element) => {dotsRefs.current[index] = element}} className="project-carousel-dot"></span>
        )
    })


    /* TODO: make this functional */
    const handleBtnClick = (event) => {
        if(event.currentTarget == leftBtn.current) {
            // cycle jobs left
            console.log('left')
        }
        if(event.currentTarget == rightBtn.current) {
            // console.log(event.target)
            console.log('right')
            // cycle jobs right
        }
    }
    
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

                <ProjectCard />

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