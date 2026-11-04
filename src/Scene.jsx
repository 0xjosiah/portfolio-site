import { OrbitControls, ScrollControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { button, useControls } from 'leva'
import { Perf } from 'r3f-perf'
import Ocean from './components/Ocean'
import SectionTitle from './components/SectionTitle'
import SiteTitle from './components/SiteTitle'
import Sign from './components/Sign'
import Sky from './components/Sky'
import Stars from './components/Stars'
import SunsetLights from './components/SunsetLights'
import SunsetClouds from './components/SunsetClouds'
import Placed from './components/Placed'
import Boat from './components/Boat'
import Seagulls from './components/Seagulls'
import Crow, { CrowPerch } from './components/Crow'
import RaySource from './components/RaySource'
import LensFrame from './components/LensFrame'
import TravelDriver from './components/TravelDriver'
import CameraIntro from './components/CameraIntro'
import { camConfig, camTarget, useSceneViewport } from './camera'
import { savedValue, useDefaultPreset } from './controls'

/* Panel folder for the 3D text, each title gets a sub-folder inside it */
const titlesFolder = 'Titles & sign'

/* Panel folder for the boats further out, the one nearest the camera keeps its own 'Sailboat' folder */
const boatsFolder = 'Boats'

/*
 * The parts of the scene with no files to load, shown straight away while the rest of it (Scene below) is still
 * loading. The intro holds the camera looking up into this sky until sceneLoaded, then tilts down onto the sunset.
 */
export function Backdrop({ sceneLoaded }) {

    /* after Sky and Stars register their settings, so the sky shows the preset's colours from the start */
    useDefaultPreset()

    return (
        <>
            <Sky />
            <Stars />
            <CameraIntro waiting={!sceneLoaded} />
        </>
    )
}

export default function Scene() {

    const { width } = useSceneViewport()

    /* General purpose controls, attach to whatever for adjustment */
    // const { position, rotation } = useControls({
    //     position: [ 0, 0, 0 ],
    //     rotation: [ 0, 0, 0 ],
    // })

    /* Camera position if needed */
    // const { position } = useThree((state) => state.camera)
    // const { camera } = useThree((state) => state)
    // console.log('camPos', position)

    const get = useThree((state) => state.get)

    const aimCamera = () => {
        const { camera, controls } = get()
        camera.lookAt(...camTarget)

        /* OrbitControls keeps its own look-at point, without this it would snap back on the next drag */
        if(controls) {
            controls.target.set(...camTarget)
            controls.update()
        }
    }

    /* Listed in the panel so a dragged view can be read off, typed in, and saved with presets */
    const [ { cameraPosition }, setCamera ] = useControls('Camera', () => ({
        cameraPosition: { value: camConfig.position, step: 0.05, label: 'Camera position (x, y, z)' },
        'Reset camera to original view': button(() => {
            /* back to the active preset file's view, or the one in code if the file has none */
            const position = savedValue('Camera.cameraPosition', camConfig.position)
            setCamera({ cameraPosition: position })
            get().camera.position.set(...position)
            aimCamera()
        }),
    }))

    useLayoutEffect(() => {
        get().camera.position.set(...cameraPosition)
        aimCamera()
    }, [ cameraPosition ])

    /* Writes the view back to the panel once an orbit drag is let go */
    const syncCameraPosition = () => {
        setCamera({ cameraPosition: get().camera.position.toArray().map((value) => Math.round(value * 100) / 100) })
    }

    /* Debug helpers, only reachable from the leva panel (yarn start) */
    const { showPerf, orbitCamera } = useControls('Debug', {
        showPerf: { value: false, label: 'Show performance monitor' },
        orbitCamera: { value: false, label: 'Drag to orbit camera' },
    }, { collapsed: true })

    /* after every useControls in the scene, so the saved values land on top of the ones written in code */
    useDefaultPreset()

    /*
     * Titles take turns crossing the view: each starts one gap further upstream than the last and they all
     * share one circuit, so a full scroll loop (4 pages) brings every title past once.
     */
    const titleGap = Math.max(width, 7)
    const titleLoop = titleGap * 4

    /* makes site title responsive to device width: on narrow screens it is pushed back from wherever the panel places it */
    const siteTitleOffset = [ 0, 0, width < 9 ? width * .5 - 4.5 : 0 ]

    return (
        <>
            {/* no damping, so the camera has stopped moving by the time its position is synced */}
            { orbitCamera && <OrbitControls makeDefault target={camTarget} enableDamping={false} onEnd={syncCameraPosition} /> }
            { showPerf && <Perf position='top-left' /> }

            <SunsetLights />
            <SunsetClouds />
            <Seagulls />
            {/* lands on the CrowPerch spots inside the titles below */}
            <Crow first='Site title' />

            <Ocean />

            {/* places here are the fallback, the panel and the preset file decide where each one sits */}
            {/* the one nearest the camera, sailed around with the arrow keys */}
            <Boat path={[ 'Sailboat' ]} model='Sailboat' place={[ -0.3, -3.25 ]} shadow steer />
            <Boat path={[ boatsFolder, 'Boat left of site title' ]} model='PaperBoat' place={[ -5.8, -3.7 ]} size={0.5} shadow />
            {/* shares the titles' circuit, so with the same motion switched on in the panel it stays between the two titles as they move */}
            <Boat path={[ boatsFolder, 'Boat between About and Experience' ]} model='TallSail' place={[ -2.5, -6.6 ]} size={0.5} shadow drift={{ loop: titleLoop }} />
            <Boat path={[ boatsFolder, 'Boat on the horizon' ]} model='WideSail' place={[ -2.5, -19.2 ]} size={1.4} shadow />

            {/* positions here are the fallback, the panel and the preset file decide where each one starts */}
            <Placed folderName={titlesFolder} name='Site title' position={[ -4.6, -0.8, -3.25 ]} rotation={[ 0, 57.3, 5.16 ]} offset={siteTitleOffset} screen={titleGap} loop={titleLoop}>
                <SiteTitle text='0xJosiah' navTo='/' />
                {/* middle of the top of the '0' */}
                <CrowPerch name='Site title' position={[ 0.185, 0.52, 0.1 ]} />
                {/* the dot in the middle of the '0', on its front face */}
                <RaySource position={[ 0.185, 0.251, 0.23 ]} />
                {/* the see-through middle of the '0', just inside its edge */}
                <LensFrame min={[ 0.092, 0.044 ]} max={[ 0.279, 0.46 ]} z={0.23} />
            </Placed>
            <Placed folderName={titlesFolder} name='Contact sign' position={[ -0.65, -0.45, -1.25 ]} frameSize={[ 0.3, 0.3, 0.3 ]} screen={titleGap} loop={titleLoop}>
                <Sign text='CONTACT' navTo='/contact' />
            </Placed>

            {/* each starts a whole number of screens upstream, so its position is where it sits as it passes the middle of the view */}
            <Placed folderName={titlesFolder} name='About title' position={[ -4.6, 1.4, -5.6 ]} loop={titleLoop} lead={1} screen={titleGap}>
                <SectionTitle text='ABOUT' navTo='/about' />
                {/* the bar of the 'T' */}
                <CrowPerch name='About title' position={[ 1.69, 0.525, 0.1 ]} />
            </Placed>
            <Placed folderName={titlesFolder} name='Experience title' position={[ -7.6, 1.4, -9.8 ]} loop={titleLoop} lead={2} screen={titleGap}>
                <SectionTitle text='WORK' navTo='/experience' />
                {/* middle of the top of the 'O' */}
                <CrowPerch name='Work title' position={[ 0.735, 0.52, 0.1 ]} />
            </Placed>
            <Placed folderName={titlesFolder} name='Projects title' position={[ -5.2, 1.4, -6.4 ]} loop={titleLoop} lead={3} screen={titleGap}>
                <SectionTitle text='PROJECTS' navTo='/projects' />
            </Placed>

            <ScrollControls pages={4} infinite horizontal>
                <TravelDriver scrollDistance={titleLoop} />
            </ScrollControls>
        </>
    )
}