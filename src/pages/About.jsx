import PageScaffold from "../components/PageScaffold"
import ResumeCallout from "../components/ResumeCallout"

export default function About() {
   
    return (
        <PageScaffold title="About me" socials={true}>
            <div className="page-section-primary">
                <p>
                    Hi, my name is <span className="keyword-callout">Josiah Webb</span>.
                </p>
                <p>
                    I am a self-taught <span className="keyword-callout">Front-End Developer</span> with a passion for <span className="keyword-callout">design</span>, <span className="keyword-callout">problem-solving</span>, and <span className="keyword-callout">3D</span> experiences.
                </p>
                <p>
                    I am proficient in various technologies including <span className="keyword-callout">JavaScript</span>, <span className="keyword-callout">TypeScript</span>, <span className="keyword-callout">CSS</span>, <span className="keyword-callout">GLSL</span>, <span className="keyword-callout">React</span>, <span className="keyword-callout">React 3 Fiber</span> and <span className="keyword-callout">Three.js</span>.
                </p>
                <p>
                    Before diving into the world of software development, I started my career as a financial advisor. I was driven by a desire to help people avoid financial pitfalls and grow their wealth. Despite finding success in various roles in the sector, I couldn't shake the feeling that I needed to be more creative and solve more compelling problems. With the pandemic only exacerbating this feeling, I ultimately decided to pivot and pursue another path.
                </p>
                <p>
                    Now, with years of experience under my belt, I have a fire and excitement for my work that I haven't felt in years. I am eager to continue learning and growing as a developer while leveraging my former experiences to contribute meaningfully to my next role.
                </p>
                <p>
                    Outside of my professional life, you can find me mountain biking, skiing, or enjoying live music.
                </p>
                <ResumeCallout />
            </div>
        </PageScaffold>
    )
}