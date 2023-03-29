import { BsArrowRightShort } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function ListLink() {
    return (
        <li>
            You can view associated work in <Link to={'/projects'} className="resume">
                <span className="keyword-callout">
                    Projects
                    <BsArrowRightShort className="inline-icon"/>
                </span>
            </Link>
        </li>
    )
}