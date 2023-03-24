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
                <h3 style={{margin: '0', borderBottom: '1px solid black', padding: '1rem', background: 'white', borderRadius: '10px'}}>Super Dope Project</h3>
                <div
                    style={{
                        background: 'white',
                        display: `${isHovered ? 'block' : 'none'}`
                    }}
                >
                    <p>
                        Description:
                    </p>
                    <p>
                        Problem:
                    </p>
                    <p>
                        Solution:
                    </p>
                </div>
            </div>

            {/* Card footer - Keywords and Links */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'start' }}>
                <div style={{ display: 'inherit', maxWidth: '65%', flexWrap: 'wrap' }}>
                    {tags.map(tag => <ProjectTag tag={tag} />)}
                </div>
                <ProjectLinks links={links} />
            </div>
        </>
    )
}