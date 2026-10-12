import * as THREE from 'three'
import { camTarget } from './camera'

/*
 * Compass directions for the scene, treating the world as flat.
 * The camera sits at [ 0, 0, 0 ] and the way it faces is north, so on screen:
 *   0 = north, away from the camera     90 = east, toward screen-right
 *   180 = south, toward the camera      270 = west, toward screen-left
 */
export const north = new THREE.Vector3(camTarget[0], 0, camTarget[2]).normalize()
export const east = new THREE.Vector3().crossVectors(north, new THREE.Vector3(0, 1, 0)).normalize()

/*
 * Turns a compass heading into an x, y, z direction of length 1.
 *   heading - degrees clockwise from north
 *   climb   - degrees above (+) or below (-) level, 0 stays parallel to the water
 *   target  - optional vector to write into, to avoid creating a new one in a frame loop
 */
export function compassToDirection(heading, climb = 0, target = new THREE.Vector3()) {
    const bearing = THREE.MathUtils.degToRad(heading)
    const pitch = THREE.MathUtils.degToRad(climb)
    const level = Math.cos(pitch)

    return target.set(
        (north.x * Math.cos(bearing) + east.x * Math.sin(bearing)) * level,
        Math.sin(pitch),
        (north.z * Math.cos(bearing) + east.z * Math.sin(bearing)) * level
    )
}

/* The reverse: reads a direction back as { heading, climb } in degrees, heading in 0-360 */
export function directionToCompass(direction) {
    const length = direction.length()
    const heading = THREE.MathUtils.radToDeg(Math.atan2(direction.dot(east), direction.dot(north)))

    return {
        heading: THREE.MathUtils.euclideanModulo(heading, 360),
        climb: THREE.MathUtils.radToDeg(Math.asin(length === 0 ? 0 : direction.y / length)),
    }
}
