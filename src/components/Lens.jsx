import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChromaticAberration, RadialGradient, Shader } from "shaders/react"
import { blinkOpen, blinkShut, lensFrame } from "../rays"

/* Pixels along each side of the lens before it is fitted to the opening. Only sets how sharply it is drawn */
const lensSize = 160

/*
 * The lens is uncovered the way an eye on its side opens: two curved lids part from a closed line down the middle.
 * This is the lids' outline as a clip-path, wide enough when fully open (1) to clear the whole opening.
 */
const lids = (open) => `ellipse(${ 75 * open }% 65% at 50% 50%)`

/*
 * The CSS transform that lays a lensSize square over any four-cornered shape on screen, perspective included.
 * Corners go top left, top right, bottom right, bottom left.
 */
function fitTo([ [ x0, y0 ], [ x1, y1 ], [ x2, y2 ], [ x3, y3 ] ]) {
    const dx1 = x1 - x2, dx2 = x3 - x2, sx = x0 - x1 + x2 - x3
    const dy1 = y1 - y2, dy2 = y3 - y2, sy = y0 - y1 + y2 - y3
    const cross = dx1 * dy2 - dx2 * dy1

    const g = (sx * dy2 - dx2 * sy) / cross
    const h = (dx1 * sy - sx * dy1) / cross

    const across = [ x1 - x0 + g * x1, y1 - y0 + g * y1, 0, g ].map((value) => value / lensSize)
    const down = [ x3 - x0 + h * x3, y3 - y0 + h * y3, 0, h ].map((value) => value / lensSize)

    return `matrix3d(${ [ ...across, ...down, 0, 0, 1, 0, x0, y0, 0, 1 ].join(', ') })`
}

/*
 * A glass lens set in the see-through middle of the '0', where LensFrame marks it. Its rings are split into
 * their colours the way light is at the edge of a real lens. Drawn with WebGPU, so browsers without it show nothing.
 *   on - the lens opens while true and closes when false. Closed, nothing of it shows
 */
export default function Lens({ on }) {
    const lens = useRef(null)

    /* keeps the lens on the opening as the title moves */
    useEffect(() => {
        let frame
        const follow = () => {
            lens.current.style.display = lensFrame.visible ? 'block' : 'none'
            if(lensFrame.visible) lens.current.style.transform = fitTo(lensFrame.corners)

            frame = requestAnimationFrame(follow)
        }
        follow()

        return () => cancelAnimationFrame(frame)
    }, [])

    return (
        <div ref={lens} className="lens" style={{ width: lensSize, height: lensSize, display: 'none' }}>
            <motion.div
                style={{ width: '100%', height: '100%' }}
                initial={{ clipPath: lids(0) }}
                /* blinks open, the null starts it from however open it already is. Taken out of the page once shut, which is what stops the shader drawing */
                animate={on
                    ? { clipPath: [ null, ...blinkOpen.amounts.map(lids) ], display: 'block' }
                    : { clipPath: lids(0), transitionEnd: { display: 'none' } }}
                transition={on ? blinkOpen.transition : blinkShut}
            >
                <Shader disableTelemetry style={{ width: '100%', height: '100%' }}>
                    <ChromaticAberration strength={0.4}>
                        <RadialGradient colorA="transparent" colorB="#ffffff" radius={0.5} repeat={2} opacity={0.7} />
                    </ChromaticAberration>
                </Shader>
            </motion.div>
        </div>
    )
}
