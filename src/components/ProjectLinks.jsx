import { HiOutlineCode, HiOutlineExternalLink } from "react-icons/hi"

export default function ProjectLinks({
    links = {
        codeLink: 'https://github.com/0xjosiah',
        demoLink: 'https://google.com'
    } 
}) {
    const { codeLink, demoLink } = links

    return (
        <div style={{ display: "flex" }}>
            <a href={codeLink} alt="link to project code" target="_blank" rel="external">
                <HiOutlineCode className="project-card-icon" />
            </a>
            <a href={demoLink} alt="link to project demo" target="_blank" rel="external">
                <HiOutlineExternalLink className="project-card-icon" />
            </a>
        </div>
    )
}