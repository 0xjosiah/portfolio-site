import { button, folder, levaStore, useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { compassToDirection } from './compass'

/*
 * The camera never moves. Instead everything drifts past it, the way scenery slides past a plane window.
 * distance is how far the world has travelled overall, in world units. TravelDriver feeds it every frame
 * through advanceTravel. Mutated in place, never put in React state.
 */
export const travel = { distance: 0 }

/*
 * One entry per moving item, keyed by its panel path: how far it has gone along its own heading, its speed
 * multiplier, whether it is playing (motion) and whether it follows the scroll. Kept here rather than in each
 * component so an item drawn more than once (a cloud and its twin) still only advances once per frame.
 */
const items = new Map()

function getItem(key) {
    if(!items.has(key)) items.set(key, { distance: 0, speed: 1, moving: false, scrolls: false, users: 0 })
    return items.get(key)
}

/*
 * Moves the world on. The two amounts are separate channels with their own per-item switch:
 *   motion - automatic drift plus the extra speed scrolling adds to it. Only reaches items that are playing,
 *            scaled by each item's speed.
 *   scroll - how far the page was scrolled this frame. Only reaches items set to move with scroll, and is
 *            not affected by the item's play switch or speed.
 */
export function advanceTravel(motion, scroll) {
    travel.distance += motion + scroll
    for(const item of items.values()) {
        if(item.moving) item.distance += motion * item.speed
        if(item.scrolls) item.distance += scroll
    }
}

/* Items that were playing when everything was last stopped, so 'start everything' can bring back the same mix */
let playingBeforeStop = null

/* Called when a preset is loaded: its on/off mix replaces whatever an earlier 'stop everything' remembered */
export function forgetStoppedMotion() {
    playingBeforeStop = null
}

/* Flips the play checkboxes in the panel, which is what the items actually follow */
function setPlaying(keys, playing) {
    const values = {}
    for(const key of keys) {
        /* an item remembered from before a stop may have been deleted since */
        if(!items.has(key)) continue
        items.get(key).moving = playing
        values[`${key}.moving`] = playing
    }
    levaStore.set(values, false)
}

/* Stops every item's motion. Any of them can still be started on its own afterwards from its play checkbox, and scrolling still moves the items that follow it */
export function stopAllMotion() {
    const playing = [ ...items.keys() ].filter((key) => items.get(key).moving)

    /* stopping twice in a row, or after starting a few by hand, adds to the remembered list rather than losing it */
    playingBeforeStop = [ ...new Set([ ...(playingBeforeStop ?? []), ...playing ]) ]

    setPlaying(items.keys(), false)
}

/* Starts the items that were playing before the last stop (all of them if nothing was ever stopped). Leaves anything already playing alone */
export function startAllMotion() {
    setPlaying(playingBeforeStop ?? items.keys(), true)
    playingBeforeStop = null
}

/* Leva folder holding the overall travel controls, each item's own motion controls live in that item's folder */
export const travelFolder = 'Travel (everything drifting past)'

/* 270 is west, which is right-to-left across the screen. Items start parked and ignore scrolling unless they opt in */
export const motionDefaults = { speed: 1, heading: 270, climb: 0, moving: false, scrolls: false }

/* Extra work to run on 'reset everything', e.g. putting a dragged starting position back */
const resetHandlers = new Set()

/* Registers a function to run when everything is reset. Always calls the latest version of the function */
export function useResetHandler(handler) {
    const latest = useRef(handler)
    latest.current = handler

    useEffect(() => {
        const run = () => latest.current?.()
        resetHandlers.add(run)
        return () => resetHandlers.delete(run)
    }, [])

    return latest
}

/* Puts every item back where it started: travel returns to zero and dragged starting positions are restored */
export function resetAllPositions() {
    travel.distance = 0
    items.forEach((item) => { item.distance = 0 })
    resetHandlers.forEach((run) => run())
}

/*
 * Motion controls for one item, shown inside that item's own folder in the panel: a play checkbox, a scroll checkbox,
 * a 'Motion' sub-folder and a button that sends just this item back to where it started.
 *   path    - folder names leading to the item, e.g. [ 'Clouds', 'Cloud left of sun' ]. Folders that already
 *             exist are reused, so the motion controls sit next to the item's other settings.
 *   onReset - optional extra step for the reset button, e.g. restoring a dragged starting position
 * Returns the x, y, z direction worked out from its compass heading, travelled() which gives how far
 * along that direction the item has moved since it started or was last reset, and moving, its play switch.
 */
export function useMotion(path, defaults, onReset) {
    const { speed, heading, climb, moving, scrolls } = { ...motionDefaults, ...defaults }
    const [ topFolder, ...subFolders ] = path
    const key = path.join('.')
    const item = getItem(key)

    const latestOnReset = useResetHandler(onReset)

    /*
     * Counts the components drawing this item and drops its entry when the last one unmounts (a deleted cloud),
     * otherwise it would be advanced every frame for the rest of the session.
     */
    useEffect(() => {
        if(!items.has(key)) items.set(key, item)
        item.users++

        return () => {
            item.users--
            if(item.users === 0 && items.get(key) === item) items.delete(key)
        }
    }, [ key, item ])

    const motion = {
        /* this item's own play switch. 'Stop everything' in the Travel folder turns these off, it does not override them */
        moving: { value: moving, label: 'Playing (motion on)' },
        /* independent of the play switch: an item can be parked and still slide when the page is scrolled, or the reverse */
        scrolls: { value: scrolls, label: 'Moves with scroll' },
        Motion: folder({
            speed: { value: speed, min: -5, max: 5, step: 0.01, label: 'Speed (x overall travel)' },
            heading: { value: heading, min: 0, max: 360, step: 1, label: 'Heading (0 N, 90 E, 180 S, 270 W)' },
            climb: { value: climb, min: -90, max: 90, step: 1, label: 'Climb (° up + / down -)' },
        }, { collapsed: true }),
        'Reset position to original': button(() => {
            item.distance = 0
            latestOnReset.current?.()
        }),
    }

    /* wraps the controls in each sub-folder of the path, innermost first */
    const schema = subFolders.reduceRight((inner, name) => ({ [name]: folder(inner, { collapsed: true }) }), motion)

    const controls = useControls(topFolder, schema)

    /* read by advanceTravel every frame */
    item.speed = controls.speed
    item.moving = controls.moving
    item.scrolls = controls.scrolls

    const direction = useMemo(() => compassToDirection(controls.heading, controls.climb), [ controls.heading, controls.climb ])

    const travelled = () => item.distance

    return { direction, travelled, moving: controls.moving }
}
