import { useHelper } from '@react-three/drei'
import { button, folder, useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { ArrowHelper, DirectionalLightHelper, Object3D, Vector3 } from 'three'
import { sceneCentre } from '../camera'
import { compassToDirection } from '../compass'
import { controlsEnabled, savedValue, useObjectHelpers } from '../controls'
import { paletteDefaults, useSunPosition } from '../sunset'
import { useResetHandler } from '../travel'
import DragFrame from './DragFrame'

const keyFolder = 'Key light (behind camera)'
const sunFolder = 'Sun light (from the sun)'

const keyPositionDefault = [ 4.75, 2.4, 8.25 ]

/* How far from the scene centre the sun light sits. A directional light only cares about direction, this just keeps its frame in view */
const sunLightDistance = 30

const sunLightDirection = new Vector3()

/*
 * A hemisphere light has no place in the scene, it lights everything from straight above (sky colour) and
 * straight below (ground colour). This is only where its frame and arrows are drawn.
 */
const ambientMarker = [ sceneCentre[0], sceneCentre[1] + 2, sceneCentre[2] ]
const ambientArrowLength = 1
const above = [ ambientMarker[0], ambientMarker[1] + ambientArrowLength + 0.5, ambientMarker[2] ]
const below = [ ambientMarker[0], ambientMarker[1] - ambientArrowLength - 0.5, ambientMarker[2] ]

const arrowFrom = new Vector3()
const arrowDirection = new Vector3()

/* Frame label: which light it is, what kind of three.js light, and whether it is switched off */
const lightLabel = (name, type, on) => `${name} · ${type}${on ? '' : ' (off)'}`

/* An arrow starting at `from` and pointing the way the light travels, toward `to`. Capped in length so a far-off light doesn't draw across the whole scene */
function DirectionArrow({ from, to, color, maxLength = 6 }) {
    const arrow = useMemo(() => new ArrowHelper(), [])

    useEffect(() => {
        arrowFrom.fromArray(from)
        arrowDirection.fromArray(to).sub(arrowFrom)
        const length = Math.min(arrowDirection.length(), maxLength)

        arrow.position.copy(arrowFrom)
        arrow.setDirection(arrowDirection.normalize())
        arrow.setLength(length, Math.min(0.6, length * 0.3), Math.min(0.3, length * 0.15))
        arrow.setColor(color)
    }, [ ...from, ...to, color, maxLength ])

    return <primitive object={arrow} />
}

/* The point on the line from the scene centre toward the sun, so the light shines the same way the sun would */
function sunLightPositionFor(azimuth, elevation) {
    compassToDirection(azimuth, elevation, sunLightDirection)
    return sceneCentre.map((value, axis) => Math.round((value + sunLightDirection.getComponent(axis) * sunLightDistance) * 100) / 100)
}

/* What the active preset file holds for a light setting, the value in code is only used if the file has none */
const saved = (lightFolder, setting, fallback) => savedValue(`Lighting.${lightFolder}.${setting}`, fallback)

/* Only the clouds are lit, the ocean is a custom shader and the text uses matcaps */
export default function SunsetLights() {
    const sun = useSunPosition()

    /* the panel buttons are created once, this lets them reach the reset functions from the latest render */
    const resets = useRef({})

    const [ controls, set ] = useControls('Lighting', () => ({
        'Ambient fill (all sides)': folder({
            ambientOn: { value: true, label: 'Light on' },
            skyColor: { value: '#f291a0', label: 'Light from above colour' },
            groundColor: { value: '#365187', label: 'Light from below colour' },
            ambientIntensity: { value: 0.9, min: 0, max: 3, step: 0.01, label: 'Fill brightness' },
        }),
        [keyFolder]: folder({
            keyOn: { value: true, label: 'Light on' },
            keyColor: { value: '#ffb37a', label: 'Colour on cloud faces' },
            keyIntensity: { value: 1.4, min: 0, max: 5, step: 0.01, label: 'Brightness on cloud faces' },
            keyPosition: { value: keyPositionDefault, step: 0.5, label: 'Light position (x, y, z)' },
            'Reset position to original': button(() => resets.current.keyLight()),
        }),
        [sunFolder]: folder({
            sunLightOn: { value: true, label: 'Light on' },
            sunLightColor: { value: paletteDefaults.sun, label: 'Light colour' },
            sunLightIntensity: { value: 1, min: 0, max: 5, step: 0.01, label: 'Brightness' },
            sunLightFollows: { value: true, label: 'Follow the sun (Sky & Sun position)' },
            sunLightPosition: { value: sunLightPositionFor(sun.azimuth, sun.elevation), step: 0.5, label: 'Light position (x, y, z)' },
            /* leva needs every key in one folder tree to be unique, hence the longer name than the key light's button */
            'Reset sun light position to original': button(() => resets.current.sunLight()),
        }),
    }))

    const { ambientOn, skyColor, groundColor, ambientIntensity } = controls
    const { keyOn, keyColor, keyIntensity, keyPosition } = controls
    const { sunLightOn, sunLightColor, sunLightIntensity, sunLightFollows, sunLightPosition } = controls

    const resetKeyLight = () => set({ keyPosition: saved(keyFolder, 'keyPosition', keyPositionDefault) })

    /* back to following the sun unless the preset file saved it parked somewhere of its own */
    const resetSunLight = () => {
        const follows = saved(sunFolder, 'sunLightFollows', true)
        set({
            sunLightFollows: follows,
            sunLightPosition: follows ? sunLightPositionFor(sun.azimuth, sun.elevation) : saved(sunFolder, 'sunLightPosition', sunLightPosition),
        })
    }

    resets.current = { keyLight: resetKeyLight, sunLight: resetSunLight }

    /* included when every item is reset from the Travel folder */
    useResetHandler(() => {
        resetKeyLight()
        resetSunLight()
    })

    /* While following, the position field is driven by the sun controls so it always shows (and saves) where the light is */
    useEffect(() => {
        if(!sunLightFollows) return
        const position = sunLightPositionFor(sun.azimuth, sun.elevation)
        if(position.some((value, axis) => value !== sunLightPosition[axis])) set({ sunLightPosition: position })
    }, [ sunLightFollows, sun.azimuth, sun.elevation, ...sunLightPosition ])

    /* A directional light shines from its position toward its target, which has to be in the scene to be placed */
    const keyTarget = useMemo(() => new Object3D(), [])
    const sunTarget = useMemo(() => new Object3D(), [])

    const { showFrames } = useObjectHelpers()
    const framesShown = controlsEnabled && showFrames

    /* Draws each light's plane and a line to the point it aims at (the scene centre) */
    const keyLight = useRef(null)
    const sunLight = useRef(null)
    useHelper(framesShown && keyLight, DirectionalLightHelper, 1, '#ffff00')
    useHelper(framesShown && sunLight, DirectionalLightHelper, 1, '#ff8800')

    return (
        <>
            <hemisphereLight visible={ambientOn} color={skyColor} groundColor={groundColor} intensity={ambientIntensity} />

            {/* Marker only, the light itself has no position to drag */}
            <DragFrame label={lightLabel('Ambient fill', 'hemisphere light', ambientOn)} position={ambientMarker} frameSize={[ 0.6, 0.6, 0.6 ]} color={skyColor} />
            { framesShown &&
                <>
                    <DirectionArrow from={above} to={ambientMarker} color={skyColor} maxLength={ambientArrowLength} />
                    <DirectionArrow from={below} to={ambientMarker} color={groundColor} maxLength={ambientArrowLength} />
                </>
            }

            {/* Sits behind the camera, cloud puffs always face the camera so a light at the sun would only hit their backs */}
            <DragFrame
                label={lightLabel('Key light', 'directional light', keyOn)}
                position={keyPosition}
                onMove={(keyPosition) => set({ keyPosition })}
                color='#ffff00'
            >
                <directionalLight ref={keyLight} visible={keyOn} target={keyTarget} color={keyColor} intensity={keyIntensity} />
            </DragFrame>
            <primitive object={keyTarget} position={sceneCentre} />
            { framesShown && <DirectionArrow from={keyPosition} to={sceneCentre} color='#ffff00' /> }

            {/* Shines from where the sun is drawn. Dragging it parks it there and stops it following the sun */}
            <DragFrame
                label={lightLabel('Sun light', 'directional light', sunLightOn)}
                position={sunLightPosition}
                onMove={(sunLightPosition) => set({ sunLightFollows: false, sunLightPosition })}
                color='#ff8800'
            >
                <directionalLight ref={sunLight} visible={sunLightOn} target={sunTarget} color={sunLightColor} intensity={sunLightIntensity} />
            </DragFrame>
            <primitive object={sunTarget} position={sceneCentre} />
            { framesShown && <DirectionArrow from={sunLightPosition} to={sceneCentre} color='#ff8800' /> }
        </>
    )
}
