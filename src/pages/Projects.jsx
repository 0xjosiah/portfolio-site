import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs"
import PageScaffold from "../components/PageScaffold"
import ProjectCard from "../components/ProjectCard"
import { projects } from "../content/projects"

export default function Projects() {

    /* produces carousel dot elements */
    const carouselDots = projects.map((proj, index) => {
        if(index == 0) return (<span key={index} className="project-carousel-dot active"></span>)
        return (
            <span key={index} className="project-carousel-dot"></span>
        )
    })


    /* TODO: make this functional */
    const handleBtnClick = (event) => {
        if(event.target == "left") {
            // cycle jobs left
        }
        if(event.target == "right") {
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
                >
                    <BsArrowLeftCircleFill className="social-icon" style={{ borderRadius: "30px", padding: "2.5px" }} />
                </button>

                <ProjectCard />

                <button
                    style={{ padding: "0", margin: "1.5rem", background: "none", border: "none", cursor: "pointer" }}
                    onClick={(e) => handleBtnClick(e)}
                >
                    <BsArrowRightCircleFill className="social-icon" style={{ borderRadius: "30px", padding: "2.5px" }} />
                </button>

            </div>
        </PageScaffold>
    )
}