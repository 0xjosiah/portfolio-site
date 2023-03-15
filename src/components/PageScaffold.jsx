import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"

export default function PageScaffold({ children, title }) {
    return (
        <div className="page-scaffold">
            <Link to="/">
                <BsArrowDownLeftSquareFill className="home-btn"/>
            </Link>
            <h2 className="page-title">
                {/* the callout looks kinda nice */}
                {/* <span className="keyword-callout"> */}
                    {title}
                {/* </span> */}
            </h2>
            {children}
        </div>
    )
}