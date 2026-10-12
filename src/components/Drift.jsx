import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useMotion } from '../travel'

/*
 * Slides its children across the view as the world travels, then brings them round again.
 *   path   - panel folders this item's motion controls (speed, compass heading, climb) go inside,
 *            e.g. [ 'Clouds', 'Cloud left of sun' ]
 *   loop   - length of the circuit in world units. Has to be wider than the view at the children's depth,
 *            so the jump from one end back to the other happens off screen.
 *   lead   - how far upstream the children start. 0 means they begin exactly where they are placed.
 *   motion - optional starting values for the controls: { speed, heading, climb, moving, scrolls }
 *   onReset - optional extra step for this item's reset button, e.g. restoring a dragged starting position
 * Children keep their own positions, this only adds the offset along the heading.
 */
export default function Drift({ path, loop, lead = 0, motion, onReset, children }) {
    const group = useRef(null)
    const { direction, travelled } = useMotion(path, motion, onReset)

    useFrame(() => {
        const along = THREE.MathUtils.euclideanModulo(travelled() - lead + loop * 0.5, loop) - loop * 0.5
        group.current.position.copy(direction).multiplyScalar(along)
    })

    return <group ref={group}>{ children }</group>
}
