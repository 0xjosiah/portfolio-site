import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedRoutes from './components/AnimatedRoutes'
import Presets from './components/Presets'
import Scene from './Scene'
import { camConfig } from './camera'
import { controlsEnabled } from './controls'

/* only fetched once a page is first opened */
const Rays = lazy(() => import('./components/Rays'))
const Lens = lazy(() => import('./components/Lens'))


export default function App() {

    /* the lens in the '0' opens and the light rays come on when a title is clicked and its page opens, then both go as the page closes */
    const raysOn = useLocation().pathname !== '/'

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

            <Canvas camera={{...camConfig}}>
                <Suspense fallback={null}>
                    <Scene />
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