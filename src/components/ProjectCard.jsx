import { HiOutlineCode, HiOutlineExternalLink } from "react-icons/hi"
import { useHover } from "../hooks/useHover"

export default function ProjectCard({  }) {
    const [hoverRef, isHovered] = useHover()

    return (
        <>
            {/* Card body - Project pic and info */}
            <div
                ref={hoverRef}
                style={{
                    backgroundImage: 'url("../images/Screenshot_test2.png")',
                    borderRadius: '10px',
                    height: '62vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'end'

                }}
            >
                {/* <img
                    src="../images/Screenshot_test2.png"
                    alt="test photo"
                    style={{
                        width: '100%',
                        padding: 0,
                        margin: 0,
                        borderRadius: '10px',
                        // opacity: .75,
                        // position: 'absolute',
                        zIndex: -1,
                    }}
                /> */}
                <div
                    style={{ margin: '0'}}
                >
                    <h3 style={{margin: '0', borderBottom: '1px solid black', padding: '1rem', background: 'white', borderRadius: '10px'}}>Super Dope Project</h3>
                </div>
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
                    <p
                        style={{
                            margin: '1rem .5rem 0 0',
                            color: 'white',

                        }}
                    >
                        <span className="keyword-callout">React</span><br/>
                    </p>
                    <p
                        style={{
                            margin: '1rem .5rem 0 0',
                            color: 'white',
                        }}
                    >
                        <span className="keyword-callout">React 3 Fiber</span><br/>
                    </p>
                    <p
                        style={{
                            margin: '1rem .5rem 0 0',
                            color: 'white',
                        }}
                    >
                        <span className="keyword-callout">Cannon js</span><br/>
                    </p>
                    <p
                        style={{
                            margin: '1rem .5rem 0 0',
                            color: 'white',
                        }}
                    >
                        <span className="keyword-callout">CSS</span><br/>
                    </p>
                    <p
                        style={{
                            margin: '1rem .5rem 0 0',
                            color: 'white',
                        }}
                    >
                        <span className="keyword-callout">SuperCool</span><br/>
                    </p>
                </div>
                <div style={{ display: "flex" }}>
                    <a href="https://github.com" alt="link to project code" target="_blank">
                        <HiOutlineCode className="project-icon" />
                    </a>
                    <a href="https://google.com" alt="link to project demo" target="_blank">
                        <HiOutlineExternalLink className="project-icon" />
                    </a>
                </div>
            </div>
        </>
    )
}