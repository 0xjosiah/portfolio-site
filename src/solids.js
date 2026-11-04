import { useEffect } from 'react'
import * as THREE from 'three'
import { waterLevel } from './water'

/*
 * Things in the scene a sailed boat can't go through, e.g. the site title. Each one is a mesh; its outline on the
 * water is worked out from where the mesh actually is every frame, so a solid that drifts with the scroll, or is
 * dragged, tilted or resized in the panel, keeps blocking exactly where it is drawn.
 */
const solids = new Set()

/* Marks the mesh in ref as solid for as long as the calling component is mounted and enabled is true */
export function useSolid(ref, enabled = true) {
    useEffect(() => {
        const mesh = ref.current
        if(!enabled || !mesh) return
        solids.add(mesh)
        return () => { solids.delete(mesh) }
    }, [ ref, enabled ])
}

const corner = new THREE.Vector3()
const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

/* Smallest convex outline around the points, anticlockwise when looking down at the water from above (monotone chain) */
const convexHull = (points) => {
    const sorted = [ ...points ].sort((a, b) => a.x - b.x || a.y - b.y)
    const lower = []
    for(const point of sorted) {
        while(lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop()
        lower.push(point)
    }
    const upper = []
    for(const point of sorted.reverse()) {
        while(upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop()
        upper.push(point)
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/*
 * Each solid's outline on the water as a convex polygon of THREE.Vector2 (x, z): the mesh's box in its own space,
 * turned and moved to where it is in the world, seen from straight above. A solid wholly above reach (the top
 * of the boat's mast) or below the water is left out, the boat passes over or under it.
 */
export function solidOutlines(reach) {
    const outlines = []
    for(const mesh of solids) {
        if(!mesh.geometry) continue
        if(!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
        const { min, max } = mesh.geometry.boundingBox
        mesh.updateWorldMatrix(true, false)

        let low = Infinity
        let high = - Infinity
        const points = []
        for(let i = 0; i < 8; i++) {
            corner.set(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).applyMatrix4(mesh.matrixWorld)
            low = Math.min(low, corner.y)
            high = Math.max(high, corner.y)
            points.push(new THREE.Vector2(corner.x, corner.z))
        }
        if(low > waterLevel + reach || high < waterLevel - 0.1) continue
        outlines.push(convexHull(points))
    }
    return outlines
}

const edge = new THREE.Vector2()
const toPoint = new THREE.Vector2()
const nearestPoint = new THREE.Vector2()
const nearestEdge = new THREE.Vector2()

/*
 * How far the point is from the outside of the polygon: positive outside, negative inside. Also sets away to the
 * direction straight out of the polygon from that point, the way to push something out of it.
 */
export function signedDistance(polygon, point, away) {
    let nearest = Infinity
    let inside = true
    for(let i = 0; i < polygon.length; i++) {
        const a = polygon[i]
        const b = polygon[(i + 1) % polygon.length]
        edge.subVectors(b, a)
        toPoint.subVectors(point, a)
        /* anticlockwise outline, so a point to the right of any edge is outside */
        if(edge.x * toPoint.y - edge.y * toPoint.x < 0) inside = false
        const along = THREE.MathUtils.clamp(toPoint.dot(edge) / edge.lengthSq(), 0, 1)
        toPoint.copy(a).addScaledVector(edge, along)
        const distance = toPoint.distanceTo(point)
        if(distance < nearest) {
            nearest = distance
            nearestPoint.copy(toPoint)
            nearestEdge.copy(edge)
        }
    }

    /* outside it is away from the nearest point on the outline, inside it is toward it, the shortest way out */
    if(nearest > 1e-6) away.subVectors(point, nearestPoint).divideScalar(inside ? - nearest : nearest)
    else away.set(nearestEdge.y, - nearestEdge.x).normalize()

    return inside ? - nearest : nearest
}
