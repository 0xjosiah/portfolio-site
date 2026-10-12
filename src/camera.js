import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

/* Starting view, also what the 'Reset camera' button in the leva panel returns to */
export const camConfig = {
    fov: 45,
    near: 0.1,
    far: 200,
    position: [ 0, 0, 0 ]
}

/*
 * The camera is the world origin, so everything else is placed relative to it.
 * This is the middle of the scene: the ocean is centred here, the camera looks at it and the key light aims at it.
 */
export const sceneCentre = [ -4.25, -0.6, -7.75 ]

/* Point the camera looks at */
export const camTarget = sceneCentre

/*
 * Width and height of the view, in world units, at the scene centre.
 * R3F's own state.viewport is measured at [ 0, 0, 0 ], which is the camera itself, so it always reports 0.
 */
export function useSceneViewport() {
    const viewport = useThree((state) => state.viewport)
    const camera = useThree((state) => state.camera)
    const size = useThree((state) => state.size)

    return useMemo(() => viewport.getCurrentViewport(camera, sceneCentre, size), [ viewport, camera, size ])
}
