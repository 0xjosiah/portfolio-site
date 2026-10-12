import { folder, useControls } from 'leva'
import * as THREE from 'three'
import { compassToDirection } from './compass'

/* Shared by the sky, ocean, lights and clouds so they all agree on where the sun is */

export const sunDefaults = {
    /* compass heading, 0 is north which is straight ahead of the camera, + is to the right */
    azimuth: 0,
    /* degrees above the horizon */
    elevation: 2.6,
}

export const sunDirection = new THREE.Vector3()

/* Mutates the shared vector, every shader holding it as a uniform picks the change up */
export function setSunDirection(azimuth, elevation) {
    compassToDirection(azimuth, elevation, sunDirection)
}

setSunDirection(sunDefaults.azimuth, sunDefaults.elevation)

/* Where the sun sits, from the 'Sky & Sun' panel folder. Any component can call this, they all share the same two inputs */
export function useSunPosition() {
    return useControls('Sky & Sun', {
        'Sun position': folder({
            azimuth: { value: sunDefaults.azimuth, min: -40, max: 40, step: 0.1, label: 'Left / right of view (°)' },
            elevation: { value: sunDefaults.elevation, min: -5, max: 30, step: 0.1, label: 'Height above horizon (°)' },
        }),
    })
}

export const paletteDefaults = {
    zenith: '#2b2f6b',
    mid: '#d9708f',
    horizon: '#ffb37a',
    sun: '#ffd9a0',
    sunDisc: '#fff3d6',
}

export const palette = {
    zenith: new THREE.Color(paletteDefaults.zenith),
    mid: new THREE.Color(paletteDefaults.mid),
    horizon: new THREE.Color(paletteDefaults.horizon),
    sun: new THREE.Color(paletteDefaults.sun),
    sunDisc: new THREE.Color(paletteDefaults.sunDisc),
}
