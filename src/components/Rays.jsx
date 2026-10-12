import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Godrays, Prism, Shader } from "shaders/react"
import { blinkOpen, blinkShut, raySource } from "../rays"

/* The source has to move this far, as a fraction of the window, before the rays are redrawn from the new spot */
const smallestMove = 0.0005

/* The beam of white light from the source splits into its colours this far along the way to the middle of the card */
const splitsAt = 0.12

/* How solid the rays are at their strongest, 0 to 1 */
const strength = 0.9

/* Points along each of the card's rounded corners, enough that the beam's corners read as the same curve */
const cornerSteps = 6

/* The card's outline as points, following its rounded corners */
function cardOutline(card) {
    const { left, top, right, bottom } = card.getBoundingClientRect()
    const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0

    /* centre of each corner's curve, and the angle the curve starts at */
    const corners = [
        [ left + radius, top + radius, Math.PI ],
        [ right - radius, top + radius, Math.PI * 1.5 ],
        [ right - radius, bottom - radius, 0 ],
        [ left + radius, bottom - radius, Math.PI * 0.5 ],
    ]

    return corners.flatMap(([ x, y, start ]) => (
        Array.from({ length: cornerSteps + 1 }, (_, step) => {
            const angle = start + step / cornerSteps * Math.PI * 0.5
            return [ x + Math.cos(angle) * radius, y + Math.sin(angle) * radius ]
        })
    ))
}

/* The tightest outline round a set of points, as if a band were stretched over them */
function outlineAround(points) {
    const sorted = [ ...points ].sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const turn = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

    const half = (ordered) => {
        const edge = []
        for(const point of ordered) {
            while(edge.length > 1 && turn(edge[edge.length - 2], edge[edge.length - 1], point) <= 0) edge.pop()
            edge.push(point)
        }
        edge.pop()
        return edge
    }

    return [ ...half(sorted), ...half(sorted.reverse()) ]
}

/*
 * Light rays over the scene, coming from the spot RaySource marks and cut to a beam that lands exactly on the
 * open card, like a projector lighting a screen. A thin beam of white light leaves the same spot toward the card
 * and fans out into a rainbow on the way. Drawn with WebGPU, so browsers without it show nothing.
 *   on - rays fade in while true and back out when false
 */
export default function Rays({ on }) {
    const layer = useRef(null)
    const [ center, setCenter ] = useState({ ...raySource })

    /* where the white beam splits, 0 to 1 across and down the window like the source */
    const [ split, setSplit ] = useState({ x: 0.5, y: 0.5 })

    const moved = (last, next) => Math.abs(last.x - next.x) > smallestMove || Math.abs(last.y - next.y) > smallestMove

    /* same colour as the cards: their background is #rrggbbaa, the rays take the colour without the see-through part */
    const colour = useMemo(() => (
        getComputedStyle(document.documentElement).getPropertyValue('--accent-alpha-med').trim().slice(0, 7)
    ), [])

    /* follows the source and the card until the rays have gone. The beam keeps its last shape once the card has */
    const follow = () => {
        setCenter((last) => moved(last, raySource) ? { ...raySource } : last)

        /* the newest card, while one is fading out as another fades in */
        const card = [ ...document.querySelectorAll('.page-scaffold') ].pop()
        if(!card) return

        const { left, top, width, height } = card.getBoundingClientRect()
        const middle = { x: (left + width * 0.5) / window.innerWidth, y: (top + height * 0.5) / window.innerHeight }
        const next = {
            x: raySource.x + (middle.x - raySource.x) * splitsAt,
            y: raySource.y + (middle.y - raySource.y) * splitsAt,
        }
        setSplit((last) => moved(last, next) ? next : last)

        const source = [ raySource.x * window.innerWidth, raySource.y * window.innerHeight ]
        const beam = outlineAround([ source, ...cardOutline(card) ])
        layer.current.style.clipPath = `polygon(${ beam.map(([ x, y ]) => `${ x.toFixed(1) }px ${ y.toFixed(1) }px`).join(', ') })`
    }

    const frame = useRef(0)
    const stopFollowing = () => cancelAnimationFrame(frame.current)

    useEffect(() => {
        if(!on) return

        stopFollowing()
        const loop = () => {
            follow()
            frame.current = requestAnimationFrame(loop)
        }
        loop()
    }, [ on ])

    useEffect(() => stopFollowing, [])

    return (
        <motion.div
            ref={layer}
            className="rays"
            initial={{ opacity: 0 }}
            /* comes on with the same blink as the lens, the null starts it from however bright it already is. Taken out of the page once faded, which is what stops the shader drawing */
            animate={on
                ? { opacity: [ null, ...blinkOpen.amounts.map((open) => open * strength) ], display: 'block' }
                : { opacity: 0, transitionEnd: { display: 'none' } }}
            transition={on ? blinkOpen.transition : blinkShut}
            onAnimationComplete={() => { if(!on) stopFollowing() }}
        >
            <Shader disableTelemetry style={{ width: '100%', height: '100%' }}>
                <Godrays center={center} rayColor={colour} density={0.5} intensity={1} />
                {/* full strength right at the source, quick to turn to colour, and faded out well before the card's far side */}
                <Prism position={center} splitPosition={split} beamWidth={0.015} startFalloff={0.02} softness={0.05} spread={0.55} endFalloff={1.5} />
            </Shader>
        </motion.div>
    )
}
