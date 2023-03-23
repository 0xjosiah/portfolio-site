import { HiCode, HiExternalLink, HiOutlineCode, HiOutlineExternalLink } from "react-icons/hi";
import PageScaffold from "../components/PageScaffold";

export default function Projects() {
    
    return (
        <PageScaffold title="Projects">
            <img
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
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                <div style={{ display: 'inherit', alignItems: 'center', maxWidth: '85%', flexWrap: 'wrap' }}>
                    <p
                        style={{
                            // margin: '0',
                            color: 'white',
                            marginRight: '.5rem'

                        }}
                    >
                        <span className="keyword-callout">React</span><br/>
                    </p>
                    <p
                        style={{
                            // margin: '0 auto'
                            color: 'white',
                            marginRight: '.5rem'
                        }}
                    >
                        <span className="keyword-callout">React 3 Fiber</span><br/>
                    </p>
                    <p
                        style={{
                            // margin: '0 auto'
                            color: 'white',
                            marginRight: '.5rem'
                        }}
                    >
                        <span className="keyword-callout">Cannon js</span><br/>
                    </p>
                    <p
                        style={{
                            // margin: '0 auto'
                            color: 'white',
                            marginRight: '.5rem'
                        }}
                    >
                        <span className="keyword-callout">CSS</span><br/>
                    </p>
                    <p
                        style={{
                            // margin: '0 auto'
                            color: 'white',
                            marginRight: '.5rem'
                        }}
                    >
                        <span className="keyword-callout">SuperCool</span><br/>
                    </p>
                </div>
                <div>
                    <a href="https://github.com" alt="link to project code" target="_blank">
                        <HiOutlineCode className="project-icon" />
                    </a>
                    <a href="https://google.com" alt="link to project demo" target="_blank">
                        <HiOutlineExternalLink className="project-icon" />
                    </a>
                </div>
            </div>
        </PageScaffold>
    )
}