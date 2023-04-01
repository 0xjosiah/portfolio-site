import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Experience from "../pages/Experience";
import Projects from "../pages/Projects";

export default function AnimatedRoutes() {
    const location = useLocation()

    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                <Route path="/about" element={ <About /> } />
                <Route path="/experience" element={ <Experience /> } />
                <Route path="/projects" element={ <Projects /> } />
                <Route path="/contact" element={ <Contact /> } />
            </Routes>
        </AnimatePresence>
    )
}