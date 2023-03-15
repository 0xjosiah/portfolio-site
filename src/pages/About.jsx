import PageScaffold from "../components/PageScaffold"
import Socials from "../components/Socials"

export default function About() {
   
    return (
        <PageScaffold title="About me">
            <div className="page-content">
                <p>
                    Hi, my name is <span className="keyword-callout">Josiah Webb</span>
                </p>
                <p>
                    I am a <span className="keyword-callout">Front-End Developer</span> who is passionate about <span className="keyword-callout">design</span> especially when it comes to <span className="keyword-callout">3D</span>.
                </p>
                <p>
                    I am proficient in various technologies including <span className="keyword-callout">JavaScript</span>, <span className="keyword-callout">CSS</span>, <span className="keyword-callout">React</span>, <span className="keyword-callout">React Three Fiber</span>, and <span className="keyword-callout">Three.js</span>.
                </p>
                <p>
                    I started my career as a financial advisor. Having grown up financially strained, I was drawn to helping people avoid financial pitfalls and grow wealth. I worked in various roles in the sector ranging from advice and consulting to data analysis. However, I had this nagging feeling that I needed to be creative. I love solving problems and the problems I was tasked with were few and typically less than compelling. Ultimately, as the pandemic set in, I found it difficult to reconcile my need to create and solve with the repetitive tasks I was completing that lacked any real substance. And so, I quit...
                </p>
                <p>
                    Now, a few years on, I've found a passion for creation on the web. I have a fire I haven't felt in years and I'm excited to learn more. I look forward to bringing my former experience to a new role and contributing in any way that I can.
                </p>
            </div>
            {/* <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p>
            <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p>
            <p className="page-content">
                This page is alll about me! <br/>
                I am the shit, plain and simple. <br/>
                You'd be an absolute nob not to hire me. <br/>
            </p> */}
            <Socials />
        </PageScaffold>
    )
}