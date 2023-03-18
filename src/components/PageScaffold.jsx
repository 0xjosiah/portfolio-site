import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import Socials from "./Socials"

export default function PageScaffold({ children, title, socials, noTitle }) {
    return (
        <div
            className={noTitle ? "page-scaffold no-title" : "page-scaffold"}
        >
            {/* <div
                style={{
                    // overflow: 'auto',
                    // position: 'absolute',
                    // top: 0,
                    // left: 0,
                    // width: '100%'
                    // maxHeight: '2.5rem'
                    // flex: '1',
                }}
            > */}
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
            {/* </div> */}

            <>
                {children}
            </>

            {socials &&
                <Socials />
            }
        </div>
    )
}