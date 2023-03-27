import { useHover } from "../hooks/useHover"
import ProjectLinks from "./ProjectLinks"
import ProjectTag from "./ProjectTag"

export default function ProjectCard({ description, img, links, problem, solution, tags, title }) {
    const [hoverRef, isHovered] = useHover()

    /* TODO: delete this */
    title = "Super Dope Project"
    img = "../images/Screenshot_test2.png"
    tags = ['react', 'react 3 fiber', 'css', 'cannon js', 'supercool']

    description = ``

    problem = ``

    solution = ``

    return (
        <div>
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
                        // display: `${isHovered ? 'block' : 'none'}`,
                        height: `${isHovered ? '' : '0'}`,
                        visibility: `${isHovered ? '' : 'hidden'}`
                    }}
                    className="project-card-description"
                >
                    <p>
                        Description: {description}
                    </p>
                    <p>
                        Problem: {problem}
                    </p>
                    <p>
                        Solution: {solution}
                    </p>
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