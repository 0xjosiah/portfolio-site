import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { lensFrame } from '../rays'

const corner = new THREE.Vector3()

/*
 * Marks the opening the lens (components/Lens.jsx) is fitted into. Put it inside whatever has the opening, measured
 * from that parent, so the lens follows it when it is moved, tilted, resized or drifting.
 *   min, max - bottom left and top right of the opening, [ x, y ]
 *   z        - how far forward the face of the opening is
 */
export default function LensFrame({ min, max, z }) {
    const spot = useRef(null)

    useFrame(({ camera, size }) => {
        const [ left, bottom ] = min
        const [ right, top ] = max
        let inView = true

        ;[ [ left, top ], [ right, top ], [ right, bottom ], [ left, bottom ] ].forEach(([ x, y ], index) => {
            spot.current.localToWorld(corner.set(x, y, z)).project(camera)
            if(Math.abs(corner.z) > 1) inView = false

            lensFrame.corners[index][0] = (corner.x * 0.5 + 0.5) * size.width
            lensFrame.corners[index][1] = (0.5 - corner.y * 0.5) * size.height
        })

        /* seen from behind, the corners run the other way round */
        const [ topLeft, topRight, , bottomLeft ] = lensFrame.corners
        const facing = (topRight[0] - topLeft[0]) * (bottomLeft[1] - topLeft[1]) - (topRight[1] - topLeft[1]) * (bottomLeft[0] - topLeft[0])

        lensFrame.visible = inView && facing > 0
    })

    return <group ref={spot} />
}
