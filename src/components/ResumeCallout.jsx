import { HiOutlineDownload } from "react-icons/hi";

export default function ResumeCallout() {
    return (
        <p>
            {/* TODO: update resume and replace here */}
            Download my <a href="./images/website-resume-2023.pdf" download="Josiah Webb Resume" className="resume">
                <span className="keyword-callout">
                    Resume
                    <HiOutlineDownload className="inline-icon"/>
                </span>
            </a> or check out my other profiles below.
        </p>
    )
}