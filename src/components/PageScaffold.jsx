import { useEffect } from "react"
import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link, useNavigate } from "react-router-dom"
import Socials from "./Socials"

export default function PageScaffold({ children, title = 'page title', socials = false, noTitle = false, style }) {
    const navigate = useNavigate()

    /* fn to return home */
    const returnHome = (event) => {
        if(event.key === 'Escape') {
            // code to return home
            navigate('/')
        }
    }

    /* Adds listener that allows a return home with ESC key press */
    useEffect(() => {
        document.addEventListener('keydown', (e) => returnHome(e))

        return document.removeEventListener('keydown', (e) => returnHome(e))
    }, [])

    return (
        <div
            className={noTitle ? "page-scaffold no-title" : "page-scaffold"}
            style={{...style}}
        >
            <Link to="/" className="home-btn">
                <BsArrowDownLeftSquareFill style={{ borderRadius: '0 10px 0 0' }}/>
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