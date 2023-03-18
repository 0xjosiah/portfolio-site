import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import Socials from "./Socials"

export default function PageScaffold({ children, title, socials }) {
    return (
        <div className="page-scaffold">
            <div
                style={{
                    // overflow: 'auto',
                    // position: 'absolute',
                    // top: 0,
                    // left: 0,
                    // width: '100%'
                    maxHeight: '2.5rem'
                }}
            >
                <Link to="/" className="home-btn">
                    <BsArrowDownLeftSquareFill />
                </Link>
                {/* {title && */}
                    <h2 className="page-title">
                        {/* the callout looks kinda nice */}
                        {/* <span className="keyword-callout"> */}
                            {title}
                        {/* </span> */}
                    </h2>
                {/* } */}
            </div>

            <div
                style={{
                    // overflow: 'auto',
                    // position: 'relative',
                    // display: 'block',
                    // height: '100px',
                    // maxHeight: '90%',
                    // width: '100px',
                    // maxWidth: '75vw'
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