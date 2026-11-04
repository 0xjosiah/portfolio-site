import { useFrame } from '@react-three/fiber'
import { button, useControls } from 'leva'
import { useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { camTarget } from '../camera'

const lookDown = new Vector3()
const lookUp = new Vector3()
const look = new Vector3()

const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/* Whether the opening shot still has hold of the camera, read by anything that should wait for the resting view (the steered boat) */
export const cameraIntro = { running: true }

/* Skipped for people who have asked their system for less motion */
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Opening shot: the scene starts looking up into the sky and holds there while the canvas fades in (see .scene-canvas
 * in index.css). After the hold time, and once nothing is still loading (waiting), it tilts down onto the sunset.
 * Takes over the camera's aim every frame until it lands on camTarget, then leaves it alone. Renders nothing.
 */
export default function CameraIntro({ waiting = false }) {
    const start = useRef(null)
    const tiltStart = useRef(null)
    const done = useRef(false)

    /* read inside useFrame, which keeps the first render's props */
    const waitingRef = useRef(waiting)
    waitingRef.current = waiting

    const { tiltUp, hold, duration } = useControls('Intro', {
        tiltUp: { value: 55, min: 0, max: 85, step: 1, label: 'Starts looking up by (degrees)' },
        hold: { value: 1.4, min: 0, max: 5, step: 0.1, label: 'Hold on the sky for (s)' },
        duration: { value: 3.5, min: 0.5, max: 10, step: 0.1, label: 'Tilt down over (s)' },
        'Replay intro': button(() => {
            start.current = null
            tiltStart.current = null
            done.current = false
            cameraIntro.running = true
        }),
    }, { collapsed: true })

    useFrame(({ camera, clock, controls }) => {
        /* orbit controls (debug only) aim the camera themselves */
        if(done.current || controls) {
            cameraIntro.running = false
            return
        }
        const now = clock.elapsedTime
        if(start.current === null) start.current = now

        /* held on the sky for at least the hold time, and for as long as the rest of the scene is still loading */
        if(tiltStart.current === null && !waitingRef.current && now - start.current >= hold) {
            tiltStart.current = now
        }

        /* reduced motion goes straight to the resting view, even while loading */
        const t = reducedMotion ? 1
            : tiltStart.current === null ? 0
            : MathUtils.clamp((now - tiltStart.current) / duration, 0, 1)

        /* the same compass direction as the resting view, raised towards the sky */
        lookDown.set(...camTarget).sub(camera.position).normalize()
        const resting = Math.asin(lookDown.y)
        const raised = Math.min(resting + MathUtils.degToRad(tiltUp), MathUtils.degToRad(89))
        const flat = Math.hypot(lookDown.x, lookDown.z)
        lookUp.set(lookDown.x / flat * Math.cos(raised), Math.sin(raised), lookDown.z / flat * Math.cos(raised))

        look.lerpVectors(lookUp, lookDown, easeInOutCubic(t)).normalize().add(camera.position)
        camera.lookAt(look)

        if(t === 1) {
            /* land exactly on the resting view, the same aim the rest of the scene uses */
            camera.lookAt(...camTarget)
            done.current = true
            cameraIntro.running = false
        }
    })

    return null
}
