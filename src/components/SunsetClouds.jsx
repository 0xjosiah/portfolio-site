import { Cloud, Clouds, useTexture } from '@react-three/drei'
import { button, folder, useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { addCloud, addFolder, cloudDefaults, removeCloud, sharedFolder, useCloudNames } from '../clouds'
import { forgetSettings, savedValue } from '../controls'
import { motionDefaults } from '../travel'
import DragFrame from './DragFrame'
import Drift from './Drift'

const cloudTexture = './textures/cloud.png'

/* Fetched up front, so adding the first cloud to an empty sky does not suspend the scene while it loads */
useTexture.preload(cloudTexture)

/* Circuit length for the clouds, they are far away so the view is wide there and the loop has to be long */
const cloudLoop = 120

const maxSegments = 50

/* The instance buffers grow this many clouds at a time, so they are not rebuilt on every add and delete */
const cloudsPerBlock = 4

/* Where each motion control sits inside a cloud's folder */
const motionPaths = { speed: 'Motion.speed', heading: 'Motion.heading', climb: 'Motion.climb', moving: 'moving', scrolls: 'scrolls' }

function SunsetCloud({ name, ...shared }) {
    /*
     * Starting values come from the active preset file, so a cloud that appears because a preset was loaded
     * arrives with that file's settings. A brand new cloud is in no file and gets the values written in code.
     */
    const { defaults, motion } = useMemo(() => {
        const saved = (key, fallback) => savedValue(`Clouds.${name}.${key}`, fallback)
        const fallbacks = cloudDefaults(name)

        return {
            defaults: Object.fromEntries(Object.entries(fallbacks).map(([ key, value ]) => [ key, saved(key, value) ])),
            motion: Object.fromEntries(Object.entries(motionPaths).map(([ key, path ]) => [ key, saved(path, motionDefaults[key]) ])),
        }
    }, [ name ])

    const [ { position: livePosition, seed, ...controls }, set ] = useControls('Clouds', () => ({
        [name]: folder({
            position: { value: defaults.position, step: 0.5, label: 'Starting position (x, y, z)' },
            bounds: { value: defaults.bounds, step: 0.1, min: 0.1, label: 'Spread (width, height, depth)' },
            segments: { value: defaults.segments, min: 1, max: maxSegments, step: 1, label: 'Number of puffs' },
            volume: { value: defaults.volume, min: 0.5, max: 20, step: 0.1, label: 'Puff size' },
            color: { value: defaults.color, label: 'Tint colour' },
            /* decides how the puffs are scattered, the same number always gives the same cloud */
            seed: { value: defaults.seed, min: 0, step: 1, label: 'Shape (any whole number)' },
            'Delete this cloud': button(() => {
                if(window.confirm(`Delete '${name}'? Saved preset files keep it until you export over them.`)) removeCloud(name)
            }),
        }, { collapsed: true }),
    }))

    /* the reset button also undoes any dragging of the starting position, back to where the active preset file has it */
    const restorePosition = () => set({ position: savedValue(`Clouds.${name}.position`, cloudDefaults(name).position) })

    /* Puffs are scattered up to one bounds length either side of the centre */
    const frameSize = controls.bounds.map((value) => value * 2)

    return (
        <>
            <Drift path={[ 'Clouds', name ]} loop={cloudLoop} motion={motion} onReset={restorePosition}>
                <DragFrame
                    label={name}
                    position={livePosition}
                    onMove={(position) => set({ position })}
                    frameSize={frameSize}
                    color={controls.color}
                >
                    <Cloud seed={seed} {...shared} {...controls} />
                </DragFrame>
            </Drift>

            {/* A twin half a circuit away with a different shape, so the sky is never empty while the first is out of view. Shares the first one's motion controls */}
            <Drift path={[ 'Clouds', name ]} loop={cloudLoop} lead={cloudLoop * 0.5} motion={motion} onReset={restorePosition}>
                <Cloud seed={seed + 100} position={livePosition} {...shared} {...controls} />
            </Drift>
        </>
    )
}

export default function SunsetClouds() {
    const names = useCloudNames()

    const shared = useControls('Clouds', {
        [sharedFolder]: folder({
            opacity: { value: 0.85, min: 0, max: 1, step: 0.01, label: 'Opacity' },
            speed: { value: 0.1, min: 0, max: 1, step: 0.01, label: 'Churn speed' },
            growth: { value: 2, min: 0, max: 10, step: 0.1, label: 'Puff pulsing amount' },
            fade: { value: 10, min: 1, max: 100, step: 1, label: 'Fade out when nearer than' },
        }),
    })

    const [ , setAdd ] = useControls('Clouds', () => ({
        [addFolder]: folder({
            newName: { value: '', label: 'Name (empty for Cloud 1, 2, …)' },
            'Add cloud': button((get) => {
                try {
                    const name = addCloud(get(`Clouds.${addFolder}.newName`))
                    setAdd({ newName: '', status: `Added '${name}'` })
                } catch(error) {
                    setAdd({ status: error.message })
                }
            }),
            status: { value: 'Export a preset to keep added or deleted clouds', editable: false, label: 'Last action' },
        }),
    }))

    /*
     * The panel keeps the values of inputs that are no longer mounted. For a cloud that has left the scene they
     * would stay in memory, be written into every export, and come back if its name was ever used again.
     * Done here rather than in the cloud itself, by now all of its inputs have been released.
     */
    const previousNames = useRef(names)
    useEffect(() => {
        for(const name of previousNames.current) {
            if(!names.includes(name)) forgetSettings(`Clouds.${name}.`)
        }
        previousNames.current = names
    }, [ names ])

    /* With no clouds there is nothing to draw, so the instanced mesh and its per frame sorting are dropped altogether */
    if(names.length === 0) return null

    /* Buffer size for the single instanced draw call, has to cover every cloud and its twin at max puff count */
    const limit = Math.ceil(names.length / cloudsPerBlock) * cloudsPerBlock * maxSegments * 2

    return (
        <Clouds
            material={THREE.MeshLambertMaterial}
            texture={cloudTexture}
            limit={limit}
            frustumCulled={false}
        >
            { names.map((name) => (
                <SunsetCloud key={name} name={name} {...shared} />
            )) }
        </Clouds>
    )
}
