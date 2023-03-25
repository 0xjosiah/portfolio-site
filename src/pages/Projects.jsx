import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs"
import PageScaffold from "../components/PageScaffold"
import ProjectCard from "../components/ProjectCard"

export default function Projects() {


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
        <PageScaffold title="Projects">
            <div style={{ display: "flex", alignItems: "center" }}>
                <button
                    style={{ padding: "0", margin: "0", background: "none", border: "none", }}
                    onClick={(e) => handleBtnClick(e)}
                >
                    <BsArrowLeftCircleFill className="social-icon" style={{ borderRadius: "30px", padding: "2.5px", margin: "2.5rem", cursor: "pointer" }} />
                </button>
                <ProjectCard />
                <button
                    style={{ padding: "0", margin: "0", background: "none", border: "none", }}
                    onClick={(e) => handleBtnClick(e)}
                >
                    <BsArrowRightCircleFill className="social-icon" style={{ borderRadius: "30px", padding: "2.5px", margin: "2.5rem", cursor: "pointer" }} />
                </button>
            </div>
        </PageScaffold>
    )
}