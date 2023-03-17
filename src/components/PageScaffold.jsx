import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import Socials from "./Socials"

export default function PageScaffold({ children, title, socials }) {
    return (
        <div className="page-scaffold">
            <div
                style={{
                    // overflow: 'auto',
                    // position: 'fixed'
                }}
            >
                <Link to="/" className="home-btn">
                    <BsArrowDownLeftSquareFill />
                </Link>
                <h2 className="page-title">
                    {/* the callout looks kinda nice */}
                    {/* <span className="keyword-callout"> */}
                        {title}
                    {/* </span> */}
                </h2>
            </div>

            <div
                style={{
                    // overflow: 'auto',
                    // position: 'relative'
                    maxHeight: '75vh',
                    maxWidth: '75vw'
                }}
            >
                {children}
            </div>

            {socials &&
                <Socials />
            }
        </div>
    )
}