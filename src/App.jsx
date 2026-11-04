import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedRoutes from './components/AnimatedRoutes'
import Presets from './components/Presets'
import Scene, { Backdrop } from './Scene'
import { camConfig } from './camera'
import { controlsEnabled } from './controls'

/* only fetched once a page is first opened */
const Rays = lazy(() => import('./components/Rays'))
const Lens = lazy(() => import('./components/Lens'))

/*
 * Calls onReady once what comes before it has mounted and its effects have run (including the default preset being
 * applied), then waits two frames so those are drawn first. Inside a Suspense it only mounts once everything
 * before it in that Suspense has loaded.
 */
function Ready({ onReady }) {
    useEffect(() => {
        let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(onReady) })
        return () => cancelAnimationFrame(frame)
    }, [])
    return null
}


export default function App() {

    /* the lens in the '0' opens and the light rays come on when a title is clicked and its page opens, then both go as the page closes */
    const raysOn = useLocation().pathname !== '/'

    /* the sky is up, so the canvas can fade in */
    const [ backdropReady, setBackdropReady ] = useState(false)
    /* every model, texture and font has loaded, so the intro can tilt down from the sky */
    const [ sceneLoaded, setSceneLoaded ] = useState(false)

    const [ raysWanted, setRaysWanted ] = useState(false)
    useEffect(() => { if(raysOn) setRaysWanted(true) }, [ raysOn ])

    return (
        <>
            {/* Scene controls, hidden unless started with `yarn start` */}
            <Leva
                hidden={!controlsEnabled}
                titleBar={{ title: 'Wave scene controls' }}
                theme={{ sizes: { rootWidth: '480px', controlWidth: '190px' } }}
            />
            { controlsEnabled && <Presets /> }

            <Canvas camera={{...camConfig}} className={`scene-canvas${backdropReady ? ' ready' : ''}`}>
                {/* has nothing to load, so it shows while the rest of the scene is still loading */}
                <Backdrop sceneLoaded={sceneLoaded} />
                <Ready onReady={() => setBackdropReady(true)} />

                <Suspense fallback={null}>
                    <Scene />
                    <Ready onReady={() => setSceneLoaded(true)} />
                </Suspense>
            </Canvas>

            {/* over the scene, under the pages */}
            { raysWanted && (
                <Suspense fallback={null}>
                    <Rays on={raysOn} />
                    <Lens on={raysOn} />
                </Suspense>
            ) }

            <AnimatedRoutes />
        </>
    )
}