import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { button, useControls } from 'leva'
import { useRef } from 'react'
import { advanceTravel, resetAllPositions, startAllMotion, stopAllMotion, travelFolder } from '../travel'

/*
 * Feeds the travel every frame through two separate channels (see advanceTravel):
 *   motion - a constant automatic drift, plus a push from scrolling that keeps things coasting for a moment
 *            after the scroll stops. Follows each item's play switch.
 *   scroll - the scroll position itself, one full scroll loop moves the world by scrollDistance.
 *            Follows each item's 'Moves with scroll' switch.
 * Has to sit inside <ScrollControls>. Renders nothing.
 */
export default function TravelDriver({ scrollDistance }) {
    const scroll = useScroll()
    const lastOffset = useRef(null)
    const coast = useRef(0)

    const { autoSpeed, scrollPush, coastTime } = useControls(travelFolder, {
        'Stop all motion': button(stopAllMotion),
        'Start motion (as it was before stop)': button(startAllMotion),
        autoSpeed: { value: 0.2, min: -5, max: 5, step: 0.01, label: 'Automatic drift speed', order: -3 },
        scrollPush: { value: 0.15, min: 0, max: 3, step: 0.01, label: 'Motion boost while scrolling', order: -2 },
        coastTime: { value: 1.2, min: 0.1, max: 5, step: 0.1, label: 'Boost fade-out time (s)', order: -1 },
        'Reset every item to original position': button(resetAllPositions),
    })

    /* priority -1 runs before the Drift groups and the ocean read the distance, without taking over rendering */
    useFrame((state, delta) => {
        if(lastOffset.current === null) lastOffset.current = scroll.offset

        let scrolled = scroll.offset - lastOffset.current
        lastOffset.current = scroll.offset

        /* infinite scrolling jumps from the end back to the start, that jump is not real movement */
        if(Math.abs(scrolled) > 0.5) scrolled -= Math.sign(scrolled)

        const scrolledDistance = scrolled * scrollDistance

        coast.current += scrolledDistance * scrollPush
        coast.current *= Math.exp(- delta / coastTime)

        advanceTravel((autoSpeed + coast.current) * delta, scrolledDistance)
    }, -1)

    return null
}
