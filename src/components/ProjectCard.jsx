import { useHover } from "../hooks/useHover"
import ProjectLinks from "./ProjectLinks"
import ProjectTag from "./ProjectTag"

export default function ProjectCard({ description, img, links, problem, solution, style, tags, title }) {
    const [hoverRef, isHovered] = useHover()

    return (
        <div style={{...style}}>
            {/* Card body - Project pic and info */}
            <div
                ref={hoverRef}
                className="project-card-container"
                style={{
                    backgroundImage: `url(${img})`,
                }}
            >
                <h3 className={`${isHovered ? 'project-card-title hover' : 'project-card-title'}`}>
                    {title}
                </h3>
                <div
                    style={{
                        // hides proj info when not card is not being hovered
                        height: `${isHovered ? '' : '0'}`,
                        visibility: `${isHovered ? '' : 'hidden'}`
                    }}
                    className="project-card-description"
                >
                    {description &&
                        <p>
                            {description}
                        </p>
                    }
                    {problem && 
                        <p>
                            Problem: {problem}
                        </p>
                    }
                    {solution &&
                        <p>
                            Solution: {solution}
                        </p>
                    }
                </div>
            </div>

            {/* Card footer - Keywords and Links */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'start' }}>
                <div style={{ display: "inherit", maxWidth: "65%", flexWrap: "wrap" }}>
                    { tags.map((tag, index) => <ProjectTag tag={tag} key={index} />) }
                </div>
                <ProjectLinks links={links} />
            </div>
        </div>
    )
}