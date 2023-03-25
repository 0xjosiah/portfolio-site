import { useHover } from "../hooks/useHover"
import ProjectLinks from "./ProjectLinks"
import ProjectTag from "./ProjectTag"

export default function ProjectCard({ description, links, img, problem, solution, tags }) {
    const [hoverRef, isHovered] = useHover()

    /* TODO: delete this */
    img = "../images/Screenshot_test2.png"
    tags = ['react', 'react 3 fiber', 'css', 'cannon js', 'supercool']

    description = `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores rem veniam molestiae! Nesciunt cum beatae, saepe molestias labore voluptatum vero repellat accusantium magnam, voluptatem sunt, officia ipsum ea ullam.`

    problem = `Lorem ipsum dolor sit amet consectetur adipisicing elit. In saepe ipsam ea, doloribus atque, facilis vitae officia voluptate assumenda commodi natus beatae unde ex, velit fuga quasi quo. Debitis, voluptate.`

    solution = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum reiciendis ullam ipsam impedit possimus officia a quisquam pariatur quaerat, voluptatem quasi error inventore perferendis necessitatibus delectus veritatis rerum excepturi numquam!`

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
                <h3 className={`${isHovered ? 'project-card-title no-br' : 'project-card-title'}`}>
                    Super Dope Project
                </h3>
                <div
                    style={{
                        // display: `${isHovered ? 'block' : 'none'}`,
                        height: `${isHovered ? '100%' : '0'}`
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