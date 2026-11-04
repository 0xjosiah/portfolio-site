import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { keepOutOfSolids, pushables, shove } from '../solids'

/* How quickly a shoved boat's glide and spin die away, per second. Higher stops it sooner */
const waterDrag = 1.4
const spinDrag = 2.2

const pushedOut = new THREE.Vector2()
const glide = new THREE.Vector2()

/*
 * Lets a boat be shoved around by the sailed boat (see Steering). Renders nothing: it keeps how far the boat has
 * been pushed and turned from where it was placed, and moves the boat's mesh by that each frame. A shoved boat
 * glides on and slows to a stop, can't be pushed through anything solid, and bumps the other pushable boats.
 *   mesh      - ref to the boat's mesh, sitting at 0, 0, 0 inside the frame that places it (drifting included)
 *   yaw       - the boat's own turn about the vertical, in radians, what any spin is added to
 *   size      - length of the boat
 *   halfWidth - half the hull's width in the model's own units
 *   height    - height of the boat in the model's own units
 *   place     - where it is placed. Moving it in the panel puts the boat back there, at rest
 */
export default function Pushable({ mesh, yaw, size, halfWidth, height, place }) {
    /* the hull other boats collide with, in the world, plus how far it is pushed from where it is placed */
    const body = useRef(null)
    if(!body.current) body.current = { x: 0, z: 0, yaw, vx: 0, vz: 0, spin: 0, pushedX: 0, pushedZ: 0, turned: 0 }
    Object.assign(body.current, { size, halfWidth, height })

    useEffect(() => {
        const state = body.current
        pushables.add(state)
        return () => { pushables.delete(state) }
    }, [])

    /* moved or turned from the panel: back where it was placed, at rest */
    const [ placeX, placeZ ] = place
    useEffect(() => {
        Object.assign(body.current, { vx: 0, vz: 0, spin: 0, pushedX: 0, pushedZ: 0, turned: 0 })
        mesh.current?.position.set(0, 0, 0)
    }, [ placeX, placeZ, yaw ])

    useFrame((_, delta) => {
        const boat = mesh.current
        const state = body.current
        if(!boat) return
        const dt = Math.min(delta, 0.05)

        /* the sailed boat may have shoved it since last frame: take that in before moving on */
        state.pushedX += state.x - (state.placedX ?? state.x)
        state.pushedZ += state.z - (state.placedZ ?? state.z)

        /* where the frame holding it puts it this frame (it may drift), before any pushing */
        boat.position.set(0, 0, 0)
        boat.updateWorldMatrix(true, false)
        const baseX = boat.matrixWorld.elements[12]
        const baseZ = boat.matrixWorld.elements[14]

        /* glides on and turns on from the last shove, slowing all the while */
        state.pushedX += state.vx * dt
        state.pushedZ += state.vz * dt
        state.turned += state.spin * dt
        const slowing = Math.exp(- waterDrag * dt)
        state.vx *= slowing
        state.vz *= slowing
        state.spin *= Math.exp(- spinDrag * dt)

        state.x = baseX + state.pushedX
        state.z = baseZ + state.pushedZ
        state.yaw = yaw + state.turned

        /* bumps any other pushable boat it glides into, each shoved half the way */
        glide.set(state.vx, state.vz)
        for(const other of pushables) {
            if(other !== state) shove(state, glide, other, 0.5)
        }

        /* stopped by the titles: pushed back out, and no longer gliding into them */
        keepOutOfSolids(state, pushedOut)
        if(pushedOut.lengthSq() > 0) {
            pushedOut.normalize()
            const into = state.vx * pushedOut.x + state.vz * pushedOut.y
            if(into < 0) {
                state.vx -= pushedOut.x * into
                state.vz -= pushedOut.y * into
            }
        }

        state.pushedX = state.x - baseX
        state.pushedZ = state.z - baseZ
        /* remembered so a shove that moves x and z before the next frame can be told apart from this frame's move */
        state.placedX = state.x
        state.placedZ = state.z

        boat.position.set(state.pushedX, 0, state.pushedZ)
        boat.rotation.y = state.yaw
    })

    return null
}
