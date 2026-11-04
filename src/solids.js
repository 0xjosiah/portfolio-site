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

const hullPoint = new THREE.Vector2()
const away = new THREE.Vector2()
const push = new THREE.Vector2()

/* Points along a hull from stern (-1) to bow (1) that are kept out of solids, each with the hull's half-width round it */
const hullStations = [ -1, -0.5, 0, 0.5, 1 ]

/*
 * Pushes a boat back out of any solid it has got into, the shortest way, so it keeps any movement along the
 * solid's side. Moves hull.x and hull.z in place and sets out to the way it was pushed (zero if it wasn't).
 *   hull - { x, z, yaw, size, halfWidth, height }: where it is on the water, which way its bow points (0 = +Z),
 *          its length, half its width and its height as fractions of its length
 */
export function keepOutOfSolids(hull, out) {
    out?.set(0, 0)
    const outlines = solidOutlines(hull.size * hull.height)
    if(!outlines.length) return

    const radius = hull.size * hull.halfWidth
    const halfLength = hull.size * 0.5

    /* pushing out of one side can push into another (a corner, two solids), a few passes settle it */
    for(let pass = 0; pass < 3; pass++) {
        let deepest = 0
        for(const outline of outlines) {
            for(const station of hullStations) {
                hullPoint.set(hull.x + Math.sin(hull.yaw) * station * halfLength, hull.z + Math.cos(hull.yaw) * station * halfLength)
                const gap = signedDistance(outline, hullPoint, away) - radius
                if(gap < deepest) {
                    deepest = gap
                    push.copy(away)
                }
            }
        }
        if(deepest >= 0) return
        hull.x -= push.x * deepest
        hull.z -= push.y * deepest
        out?.addScaledVector(push, - deepest)
    }
}

/*
 * Boats that the sailed boat can shove around. Each is the object a Pushable keeps: its hull, where it is now
 * ({ x, z, yaw } in the world) and how it is moving ({ vx, vz, spin }), so whatever bumps into it can push it.
 */
export const pushables = new Set()

const stern = new THREE.Vector2()
const bow = new THREE.Vector2()
const otherStern = new THREE.Vector2()
const otherBow = new THREE.Vector2()
const along = new THREE.Vector2()
const otherAlong = new THREE.Vector2()
const between = new THREE.Vector2()

/* The hull's centre line from stern to bow */
const hullLine = (hull, from, to) => {
    const reach = hull.size * 0.5
    from.set(hull.x - Math.sin(hull.yaw) * reach, hull.z - Math.cos(hull.yaw) * reach)
    to.set(hull.x + Math.sin(hull.yaw) * reach, hull.z + Math.cos(hull.yaw) * reach)
}

/* Nearest points on two line segments a1-a2 and b1-b2, written to onA and onB */
function closestOnSegments(a1, a2, b1, b2, onA, onB) {
    along.subVectors(a2, a1)
    otherAlong.subVectors(b2, b1)
    between.subVectors(a1, b1)
    const lengthA = along.lengthSq()
    const lengthB = otherAlong.lengthSq()
    const f = otherAlong.dot(between)
    const c = along.dot(between)
    const b = along.dot(otherAlong)
    const denom = lengthA * lengthB - b * b

    let s = denom > 1e-9 ? THREE.MathUtils.clamp((b * f - c * lengthB) / denom, 0, 1) : 0
    let t = (b * s + f) / lengthB
    if(t < 0) {
        t = 0
        s = THREE.MathUtils.clamp(- c / lengthA, 0, 1)
    }
    else if(t > 1) {
        t = 1
        s = THREE.MathUtils.clamp((b - c) / lengthA, 0, 1)
    }
    onA.copy(a1).addScaledVector(along, s)
    onB.copy(b1).addScaledVector(otherAlong, t)
}

const onMover = new THREE.Vector2()
const onOther = new THREE.Vector2()
const normal = new THREE.Vector2()

/*
 * Where two hulls overlap, sets normal to the way from the first to the second and returns how deep the overlap
 * is (0 if they don't touch). onOther is left at the point on the second hull's centre line nearest the first.
 */
export function hullOverlap(mover, other, out) {
    hullLine(mover, stern, bow)
    hullLine(other, otherStern, otherBow)
    closestOnSegments(stern, bow, otherStern, otherBow, onMover, onOther)
    const reach = mover.size * mover.halfWidth + other.size * other.halfWidth
    const distance = onMover.distanceTo(onOther)
    if(distance >= reach) return 0
    /* exactly on top of each other: push out sideways from the mover's bow */
    if(distance > 1e-6) out.subVectors(onOther, onMover).divideScalar(distance)
    else out.set(Math.cos(mover.yaw), - Math.sin(mover.yaw))
    return reach - distance
}

/*
 * Shoves a pushable boat out of the way of a moving one, and the moving one back a little, as if the pushed
 * boat were lighter. The pushed boat takes up the mover's speed along the push and is spun a little when hit
 * off-centre, then glides on by itself (see Pushable).
 *   mover    - { x, z, yaw, size, halfWidth }, moved in place
 *   velocity - the mover's velocity on the water, THREE.Vector2 (x, z)
 *   share    - how much of the overlap the pushed boat takes, the mover takes the rest
 */
export function shove(mover, velocity, other, share = 0.85) {
    /* not placed on the water yet, its first frame hasn't run */
    if(other.placedX === undefined) return false
    const overlap = hullOverlap(mover, other, normal)
    if(overlap <= 0) return false

    other.x += normal.x * overlap * share
    other.z += normal.y * overlap * share
    mover.x -= normal.x * overlap * (1 - share)
    mover.z -= normal.y * overlap * (1 - share)

    /* carried along at the mover's speed into it, if that is faster than it was already going that way */
    const closing = velocity.dot(normal) - (other.vx * normal.x + other.vz * normal.y)
    if(closing > 0) {
        other.vx += normal.x * closing
        other.vz += normal.y * closing
        /* hit away from its middle it turns: twist of the push about its centre, scaled down for a longer boat */
        const leverX = onOther.x - other.x
        const leverZ = onOther.y - other.z
        other.spin += (leverZ * normal.x - leverX * normal.y) * closing * 3 / (other.size * other.size)
    }
    return true
}
