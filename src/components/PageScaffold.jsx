import { useEffect } from "react"
import { BsArrowDownLeftSquareFill } from "react-icons/bs"
import { Link, useNavigate } from "react-router-dom"
import { motion, useIsPresent } from "framer-motion"
import Socials from "./Socials"

export default function PageScaffold({ children, title = 'page title', socials = false, noTitle = false, style }) {
    const navigate = useNavigate()
    const isPresent = useIsPresent()

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
        <motion.div
            className={noTitle ? "page-scaffold no-title" : "page-scaffold"}
            style={{...style}} // allows for any styling to be passed from instance of PageScaffold to this parent div
            key="page"
            initial={{ opacity: 0, top: '0%' }}
            animate={{ opacity: 1, top: '7.5vh' }}
            exit={{ opacity: 0, top: 0, transition: { duration: 0.5, ease: 'circOut' }  }}
            // transition={{ ease: "easeOut", duration: 1.5 }}
        >
            <Link to="/" className="home-btn">
                <BsArrowDownLeftSquareFill style={{ borderRadius: '0 10px 0 0' }}/>
            </Link>
            <h2 className="page-title">
                {/* This allows for providing either title or noTitle prop */}
                {!noTitle && title}
            </h2>
            
            {/* Contents of page */}
            {children}

            {socials &&
                <Socials />
            }

            <motion.div
                key="page-screen"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0, transition: { duration: 0.5, ease: "circOut" } }}
                exit={{ scaleX: 1, transition: { duration: 0.5, ease: "circIn" } }}
                style={{ originX: isPresent ? 0 : 1 }}
                className="privacy-screen"
            />
        </motion.div>

    )
}