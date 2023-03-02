import { Canvas } from '@react-three/fiber'
import { Route, Routes } from 'react-router-dom'
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

            {/* <Routes>
                <Route exact path='/' element={ <TODO /> } />
                <Route path='/TODO' element={ <TODO /> } />
                <Route path='/TODO' element={ <TODO /> } />
                <Route path='/TODO' element={ <TODO /> } />
            </Routes> */}
        </>
    )
}