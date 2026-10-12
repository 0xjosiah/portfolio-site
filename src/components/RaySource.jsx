import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { raySource } from '../rays'

const onScreen = new THREE.Vector3()

/*
 * Marks the point the light rays are projected from. Put it inside whatever it should sit on, with the position
 * measured from that parent, so the rays follow it when it is moved, tilted, resized or drifting.
 */
export default function RaySource({ position }) {
    const spot = useRef(null)

    useFrame(({ camera }) => {
        spot.current.getWorldPosition(onScreen).project(camera)
        raySource.x = onScreen.x * 0.5 + 0.5
        raySource.y = 0.5 - onScreen.y * 0.5
    })

    return <group ref={spot} position={position} />
}
