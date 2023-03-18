import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import Socials from "./Socials"

export default function PageScaffold({ children, title = 'page title', socials = false, noTitle = false }) {
    return (
        <div
            className={noTitle ? "page-scaffold no-title" : "page-scaffold"}
        >
            <Link to="/" className="home-btn">
                <BsArrowDownLeftSquareFill />
            </Link>
            <h2 className="page-title">
                {/* the callout looks kinda nice */}
                {/* <span className="keyword-callout"> */}
                    {/* This allows for providing either title or noTitle prop */}
                    {!noTitle && title}
                {/* </span> */}
            </h2>

            {children}

            {socials &&
                <Socials />
            }
        </div>
    )
}