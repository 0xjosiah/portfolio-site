import { Canvas } from '@react-three/fiber'
import { Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Experience from './pages/Experience'
import Projects from './pages/Projects'
import Scene from './Scene'

const camConfig = {
    fov: 45,
    near: 0.1,
    far: 200,
    position: [ 4.25, .6, 7.75 ]
}


export default function App(props) {

    return (
        <>
            <Canvas shadows camera={{...camConfig}}>
                <Scene />
            </Canvas>

            <Routes>
                {/* <Route exact path='/' element={ <Scene /> } /> */}
                <Route path='/about' element={ <About /> } />
                <Route path='/experience' element={ <Experience /> } />
                <Route path='/projects' element={ <Projects /> } />
                <Route path='/contact' element={ <Contact /> } />
            </Routes>
        </>
    )
}