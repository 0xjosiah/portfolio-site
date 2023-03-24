import { HiOutlineCode, HiOutlineExternalLink } from "react-icons/hi"
import { useHover } from "../hooks/useHover"
import ProjectLinks from "./ProjectLinks"
import ProjectTag from "./ProjectTag"

export default function ProjectCard({ links, img, tags }) {
    const [hoverRef, isHovered] = useHover()

    /* TODO: delete this */
    img = 'url("../images/Screenshot_test2.png")'
    tags = ['react', 'react 3 fiber', 'css', 'cannon js', 'supercool']

    return (
        <>
            {/* Card body - Project pic and info */}
            <div
                ref={hoverRef}
                className="project-card-container"
                style={{
                    backgroundImage: img,
                }}
            >
                <h3 className="project-card-title">Super Dope Project</h3>
                <div
                    style={{
                        display: `${isHovered ? 'block' : 'none'}`
                    }}
                    className="project-card-description"
                >
                    <p>
                        Description: Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores rem veniam molestiae! Nesciunt cum beatae, saepe molestias labore voluptatum vero repellat accusantium magnam, voluptatem sunt, officia ipsum ea ullam.
                    </p>
                    <p>
                        Problem: Lorem ipsum dolor sit amet consectetur adipisicing elit. In saepe ipsam ea, doloribus atque, facilis vitae officia voluptate assumenda commodi natus beatae unde ex, velit fuga quasi quo. Debitis, voluptate.
                    </p>
                    <p>
                        Solution:
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum reiciendis ullam ipsam impedit possimus officia a quisquam pariatur quaerat, voluptatem quasi error inventore perferendis necessitatibus delectus veritatis rerum excepturi numquam!
                    </p>
                </div>
            </div>

            {/* Card footer - Keywords and Links */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'start' }}>
                <div style={{ display: 'inherit', maxWidth: '65%', flexWrap: 'wrap' }}>
                    {tags.map((tag, index) => <ProjectTag tag={tag} key={index} />)}
                </div>
                <ProjectLinks links={links} />
            </div>
        </>
    )
}