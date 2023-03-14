import { BsArrowDownLeft, BsArrowDownLeftSquareFill, BsFillArrowDownLeftCircleFill } from "react-icons/bs"
import { Link } from "react-router-dom"

export default function PageScaffold({ children, title }) {
    return (
        <div className="page-scaffold">
            {/* <BsFillArrowDownLeftCircleFill className="home-btn"/> */}
            {/* <BsArrowDownLeft className="home-btn"/> */}
            <Link to="/">
                <BsArrowDownLeftSquareFill className="home-btn"/>
            </Link>
            <h2 className="page-title">
                {title}
            </h2>
            {children}
        </div>
    )
}