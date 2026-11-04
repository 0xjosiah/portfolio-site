import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { nestFolders } from '../controls'
import { cameraIntro } from './CameraIntro'
import { waterLevel } from '../water'

const arrowKeys = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]

/* Keys typed into a form or the panel are left alone */
const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || [ 'INPUT', 'TEXTAREA', 'SELECT' ].includes(target.tagName))

/* Steering is only on the home view, the pages opened over the scene keep the arrow keys for scrolling */
const onHomeView = () => window.location.pathname === '/'

/* Which arrow keys are held right now, kept up to date from the window's key events */
function useArrowKeys() {
    const held = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false })

    useEffect(() => {
        const press = (event) => {
            if(!arrowKeys.includes(event.key) || isTyping(event.target) || !onHomeView()) return
            /* otherwise the arrows also scroll the page or the scroll controls */
            event.preventDefault()
            held.current[event.key] = true
        }
        const release = (event) => {
            if(arrowKeys.includes(event.key)) held.current[event.key] = false
        }
        /* a key let go while the window is in the background never sends its keyup */
        const releaseAll = () => arrowKeys.forEach((key) => { held.current[key] = false })

        window.addEventListener('keydown', press)
        window.addEventListener('keyup', release)
        window.addEventListener('blur', releaseAll)
        return () => {
            window.removeEventListener('keydown', press)
            window.removeEventListener('keyup', release)
            window.removeEventListener('blur', releaseAll)
        }
    }, [])

    return held
}

/* Gentle at both ends: the motor takes a moment to bite, then holds a steady speed */
const easeInOut = (t) => t * t * (3 - 2 * t)

/* Shortest way round from one angle to another, in -PI to PI */
const angleBetween = (from, to) => THREE.MathUtils.euclideanModulo(to - from + Math.PI, Math.PI * 2) - Math.PI

const wanted = new THREE.Vector3()
const bow = new THREE.Vector3()
const outward = new THREE.Vector3()
const rightward = new THREE.Vector3()
const probe = new THREE.Vector3()
const onScreen = new THREE.Vector3()
const ndc = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const water = new THREE.Plane(new THREE.Vector3(0, 1, 0), - waterLevel)

/* Where a point in the world is on screen, -1 to 1 each way */
const toScreen = (point, camera) => onScreen.copy(point).project(camera)

/*
 * The boat's place on the water measured around the camera: how far out it is and how far round from straight
 * ahead. Lines straight out from the camera run (very nearly) straight up the screen and circles around it run
 * across, so this is the screen's own up/down and left/right laid on the water.
 */
const aroundCamera = (camera, x, z) => {
    const dx = x - camera.position.x
    const dz = z - camera.position.z
    camera.getWorldDirection(probe)
    return { distance: Math.hypot(dx, dz), angle: angleBetween(Math.atan2(probe.x, probe.z), Math.atan2(dx, dz)) }
}

/* The reverse of aroundCamera, as [ x, z ] */
const fromAroundCamera = (camera, distance, angle) => {
    camera.getWorldDirection(probe)
    const absolute = angle + Math.atan2(probe.x, probe.z)
    return [ camera.position.x + Math.sin(absolute) * distance, camera.position.z + Math.cos(absolute) * distance ]
}

/* Sets the directions away from the camera and toward screen-right, as seen from a point on the water */
const screenAxesAt = (camera, x, z) => {
    outward.set(x - camera.position.x, 0, z - camera.position.z).normalize()
    rightward.set(- outward.z, 0, outward.x)
}

/*
 * Sails a boat around the water with the arrow keys. Renders nothing, it moves the boat's mesh each frame and the
 * float shader reads that placement, so the boat keeps riding the waves wherever it goes.
 *   path   - the boat's panel folders, the steering settings go in a folder inside them
 *   mesh   - ref to the boat's mesh. It sits inside a frame placed at start, so it is moved by the difference
 *   start  - [ x, z ] the boat is placed at, it sails from there and goes back there if the panel moves it
 *   yaw    - the boat's starting turn about the vertical, in radians (0 = bow toward +Z)
 *   size   - length of the boat, sets how far past the screen edge it has to go before it comes round
 *   height - height of the boat, so it is only sent round once the top of the mast has left the bottom of the screen
 *
 * The arrows point the way to go on screen: up is straight away from the camera, down straight toward it, left and
 * right go around it. The boat turns its bow
 * that way and always moves along its bow, so the front leads. Off a side of the screen it comes back on the other
 * side, off the bottom it comes back out at the far edge, and sailing past the far edge brings it in from the bottom.
 */
export default function Steering({ path, mesh, start, yaw: startYaw, size, height }) {
    const held = useArrowKeys()

    const { topSpeed, speedUpTime, slowDownTime, turnSpeed, farEdge } = useControls(path[0], nestFolders([ ...path.slice(1), 'Arrow-key steering' ], {
        topSpeed: { value: 1.2, min: 0.1, max: 6, step: 0.05, label: 'Cruising speed (units / s)' },
        speedUpTime: { value: 1.6, min: 0.1, max: 6, step: 0.05, label: 'Seconds to reach cruising speed' },
        slowDownTime: { value: 2.2, min: 0.1, max: 8, step: 0.05, label: 'Seconds to coast to a stop' },
        turnSpeed: { value: 100, min: 10, max: 360, step: 1, label: 'Turn speed (degrees / s)' },
        farEdge: { value: 13, min: 4, max: 20, step: 0.1, label: 'Far edge (distance from camera)' },
    }))

    const [ startX, startZ ] = start

    /* where the boat is and how it is moving, changed every frame so kept out of React */
    const boat = useRef(null)
    if(!boat.current) boat.current = { x: startX, z: startZ, yaw: startYaw, throttle: 0, turning: 0 }

    /* moved or turned from the panel: the boat is put back where it was placed, at rest */
    useEffect(() => {
        Object.assign(boat.current, { x: startX, z: startZ, yaw: startYaw, throttle: 0, turning: 0 })
        mesh.current?.position.set(0, 0, 0)
    }, [ startX, startZ, startYaw ])

    /* how far below the top of the mast is still on screen, with the mast pulled back by margin so it is fully out of sight */
    const mastShowing = (camera, x, z, margin) => {
        screenAxesAt(camera, x, z)
        return toScreen(probe.set(x, waterLevel + size * height, z).addScaledVector(outward, margin), camera).y >= -1
    }

    /*
     * Sends the boat to the opposite edge once it has fully left the view. Each one only happens while the boat is
     * heading out that way, so it arrives heading in and is not sent straight back.
     */
    const comeRound = (camera) => {
        const state = boat.current
        const margin = size * 0.75
        const { distance, angle } = aroundCamera(camera, state.x, state.z)

        screenAxesAt(camera, state.x, state.z)
        bow.set(Math.sin(state.yaw), 0, Math.cos(state.yaw))
        const goingRight = bow.dot(rightward)
        const goingAway = bow.dot(outward)

        /* off a side: in from the other side at the same distance, turned so it keeps going the same way across the screen */
        for(const side of [ 1, -1 ]) {
            if(goingRight * side <= 0) continue
            const inner = toScreen(probe.set(state.x, waterLevel, state.z).addScaledVector(rightward, - side * margin), camera)
            if(inner.x * side > 1) {
                ;[ state.x, state.z ] = fromAroundCamera(camera, distance, - angle)
                state.yaw = angleBetween(0, state.yaw - 2 * angle)
                return
            }
        }

        /* off the bottom: back out at the far edge, the same way across the screen */
        if(goingAway < 0 && !mastShowing(camera, state.x, state.z, margin)) {
            ;[ state.x, state.z ] = fromAroundCamera(camera, farEdge, angle)
            return
        }

        /* past the far edge: in from just below the bottom of the screen, as close as it takes for even the mast to be out of sight */
        if(goingAway > 0 && distance > farEdge) {
            raycaster.setFromCamera(ndc.set(0, -1), camera)
            const bottomRow = raycaster.ray.intersectPlane(water, probe)
            let closer = bottomRow ? aroundCamera(camera, bottomRow.x, bottomRow.z).distance : 1
            let [ x, z ] = fromAroundCamera(camera, closer, angle)
            while(closer > margin && mastShowing(camera, x, z, margin)) {
                closer -= margin * 0.5
                ;[ x, z ] = fromAroundCamera(camera, closer, angle)
            }
            state.x = x
            state.z = z
        }
    }

    useFrame(({ camera }, delta) => {
        if(!mesh.current) return

        /* a long pause (a background tab) would otherwise send the boat a long way in one step */
        const dt = Math.min(delta, 0.05)
        const state = boat.current
        /* while the opening shot is still tilting down from the sky the arrows do nothing, the view is not settled yet */
        const keys = cameraIntro.running ? {} : held.current

        /* the way the arrows point, on screen. Opposite keys cancel out */
        const across = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
        const along = (keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)
        const driving = across !== 0 || along !== 0

        /* throttle opens steadily while an arrow is held and closes steadily once let go, the easing makes both ends soft */
        state.throttle = driving
            ? Math.min(1, state.throttle + dt / speedUpTime)
            : Math.max(0, state.throttle - dt / slowDownTime)
        const pace = easeInOut(state.throttle)
        const speed = topSpeed * pace

        /* the bow swings round toward the way the arrows point, easing into and out of the turn */
        let turnTarget = 0
        if(driving) {
            screenAxesAt(camera, state.x, state.z)
            wanted.set(0, 0, 0).addScaledVector(outward, along).addScaledVector(rightward, across)
            const off = angleBetween(state.yaw, Math.atan2(wanted.x, wanted.z))
            const most = THREE.MathUtils.degToRad(turnSpeed)
            turnTarget = THREE.MathUtils.clamp(off * 4, - most, most)
        }
        state.turning += (turnTarget - state.turning) * (1 - Math.exp(- dt * 6))

        /* a boat barely moving turns slowly, under way it answers the helm fully */
        state.yaw = angleBetween(0, state.yaw + state.turning * dt * (0.35 + 0.65 * pace))

        /* always along the bow, so the front leads */
        state.x += Math.sin(state.yaw) * speed * dt
        state.z += Math.cos(state.yaw) * speed * dt

        if(speed > 0 && !cameraIntro.running) comeRound(camera)

        mesh.current.position.set(state.x - startX, 0, state.z - startZ)
        mesh.current.rotation.y = state.yaw
    })

    return null
}
