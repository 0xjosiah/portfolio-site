import vertexShader from '../shaders/wake/vertex.glsl'
import fragmentShader from '../shaders/wake/simulate.glsl'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { nestFolders, setRawColor } from '../controls'
import { wakeUniforms, waveUniforms } from '../water'

/* Texels along each side of the wake's patch of water. The ocean's shader assumes this too, for the ripple */
const resolution = 256

/* A jump further than this in one frame is the boat being sent round to the other edge, not sailing */
const teleport = 1

const lastWaveOrigin = new THREE.Vector2()

/*
 * A trail of churned water behind the sailed boat, like ChromaFlow (shaders.com) but laid on the ocean in the
 * world rather than over the screen, and stirred by the boat rather than the cursor. A small patch of water
 * centred on the boat is simulated on the graphics card: the hull pushes water out to the sides and leaves
 * foam, the outward flow carries the foam away so the trail opens into a V, and it fades and spreads as it
 * goes. The ocean paints the patch on itself (wakeUniforms), so there is no extra mesh to draw.
 * Renders nothing itself.
 *   path  - the boat's panel folders, the trail's settings go in a folder inside them
 *   boat  - the steered boat's state from Steering: x, z, yaw and how much throttle it has
 *   size  - length of the boat
 *   halfWidth - half the hull's width in the model's own units
 */
export default function Wake({ path, boat, size, halfWidth }) {
    const [ topFolder, ...subFolders ] = path

    const controls = useControls(topFolder, nestFolders([ ...subFolders, 'Wake trail' ], {
        show: { value: true, label: 'Show' },
        strength: { value: 1.8, min: 0, max: 8, step: 0.05, label: 'Foam brightness' },
        foamRate: { value: 3, min: 0, max: 12, step: 0.1, label: 'Foam stirred up by the hull' },
        foamLife: { value: 1.8, min: 0.1, max: 8, step: 0.05, label: 'Seconds the foam lasts' },
        push: { value: 1.1, min: 0, max: 3, step: 0.01, label: 'Spreads out to the sides (V width)' },
        flowLife: { value: 1.6, min: 0.1, max: 6, step: 0.05, label: 'Seconds the water keeps flowing out' },
        spread: { value: 3, min: 0, max: 20, step: 0.1, label: 'Softness' },
        hullWidth: { value: 1.3, min: 0.3, max: 4, step: 0.05, label: 'Width at the hull (x hull)' },
        breakup: { value: 0.85, min: 0, max: 1, step: 0.01, label: 'Breaks into flecks (0 smooth)' },
        ripple: { value: 0.6, min: 0, max: 3, step: 0.01, label: 'Roughens the water (glitter in the trail)' },
        foamColor: { value: '#fff3ea', label: 'Foam colour' },
        chroma: { value: 0.45, min: 0, max: 1, step: 0.01, label: 'Colour by flow direction (ChromaFlow)' },
        awayColor: { value: '#ffd2a8', label: 'Flowing away from camera' },
        towardColor: { value: '#a8dcff', label: 'Flowing toward camera' },
        leftColor: { value: '#d6b0ff', label: 'Flowing left' },
        rightColor: { value: '#ffaccf', label: 'Flowing right' },
        areaSize: { value: 10, min: 3, max: 24, step: 0.5, label: 'Patch of water simulated (units)' },
    }))

    const gl = useThree((state) => state.gl)

    /* two textures taken in turns, each frame reads one and writes the other */
    const sim = useMemo(() => {
        const options = {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            depthBuffer: false,
            stencilBuffer: false,
        }
        const targets = [ new THREE.WebGLRenderTarget(resolution, resolution, options), new THREE.WebGLRenderTarget(resolution, resolution, options) ]

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uPrevious: { value: null },
                uShift: { value: new THREE.Vector2() },
                uTexel: { value: 1 / resolution },
                uAreaSize: { value: 10 },
                uAreaOrigin: { value: new THREE.Vector2() },
                uDt: { value: 0 },
                uBoat: { value: new THREE.Vector2() },
                uBow: { value: new THREE.Vector2(0, 1) },
                uHull: { value: new THREE.Vector2(0.5, 0.1) },
                uSpeed: { value: 0 },
                uFoamRate: { value: 0 },
                uPush: { value: 0 },
                uFoamLife: { value: 1 },
                uFlowLife: { value: 1 },
                uSpread: { value: 0 },
            },
        })

        const stage = new THREE.Scene()
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
        quad.frustumCulled = false
        stage.add(quad)

        /* the quad's shader ignores the camera, it is only there because rendering needs one */
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

        return { targets, material, quad, stage, camera, read: 0, origin: null, last: null }
    }, [])

    /* made by hand, so freed by hand. The ocean stops painting the wake when it goes */
    useEffect(() => () => {
        sim.targets.forEach((target) => target.dispose())
        sim.material.dispose()
        sim.quad.geometry.dispose()
        wakeUniforms.uWakeField.value = null
        wakeUniforms.uWakeArea.value.w = 0
    }, [ sim ])

    const { strength, chroma, ripple, breakup, foamColor, awayColor, towardColor, leftColor, rightColor } = controls

    useEffect(() => {
        wakeUniforms.uWakeLook.value.set(strength, chroma, ripple, breakup)
        setRawColor(wakeUniforms.uWakeFoam.value, foamColor)
        setRawColor(wakeUniforms.uWakeAway.value, awayColor)
        setRawColor(wakeUniforms.uWakeToward.value, towardColor)
        setRawColor(wakeUniforms.uWakeLeft.value, leftColor)
        setRawColor(wakeUniforms.uWakeRight.value, rightColor)
    }, [ strength, chroma, ripple, breakup, foamColor, awayColor, towardColor, leftColor, rightColor ])

    /* switched off from the panel: nothing painted, and it starts from calm water when switched back on */
    useEffect(() => {
        if(controls.show) return
        wakeUniforms.uWakeArea.value.w = 0
        sim.origin = null
    }, [ controls.show ])

    useFrame((_, delta) => {
        const state = boat.current
        if(!controls.show || !state) return

        const dt = Math.min(delta, 0.05)
        const { areaSize } = controls
        const texel = areaSize / resolution
        const uniforms = sim.material.uniforms

        /* how far the boat actually went, collisions included. A jump to the other edge stirs nothing on the way */
        const last = sim.last ?? { x: state.x, z: state.z }
        const moved = Math.hypot(state.x - last.x, state.z - last.z)
        const speed = moved > teleport || dt === 0 ? 0 : moved / dt
        sim.last = { x: state.x, z: state.z }

        /* the patch stays centred on the boat, moved in whole texels so what is already there is not blurred */
        const origin = {
            x: Math.round((state.x - areaSize * 0.5) / texel) * texel,
            z: Math.round((state.z - areaSize * 0.5) / texel) * texel,
        }

        /* and the water itself drifts when the scene travels: the wave pattern moves exactly as far as its origin */
        const waveOrigin = waveUniforms.uWaveOrigin.value
        const drifted = sim.origin ? waveOrigin.clone().sub(lastWaveOrigin) : new THREE.Vector2()
        lastWaveOrigin.copy(waveOrigin)

        /* a new patch size or a first frame starts from calm water: the shift reaches beyond the old patch */
        const fresh = !sim.origin || sim.origin.size !== areaSize
        if(fresh) uniforms.uShift.value.set(2, 2)
        else uniforms.uShift.value.set(
            (origin.x - sim.origin.x - drifted.x) / areaSize,
            (origin.z - sim.origin.z - drifted.y) / areaSize
        )
        sim.origin = { ...origin, size: areaSize }

        uniforms.uPrevious.value = sim.targets[sim.read].texture
        uniforms.uAreaSize.value = areaSize
        uniforms.uAreaOrigin.value.set(origin.x, origin.z)
        uniforms.uDt.value = dt
        uniforms.uBoat.value.set(state.x, state.z)
        uniforms.uBow.value.set(Math.sin(state.yaw), Math.cos(state.yaw))
        uniforms.uHull.value.set(size * 0.5, size * halfWidth * controls.hullWidth)
        /* stirs harder the faster it goes, a boat at rest leaves the water alone */
        uniforms.uSpeed.value = Math.min(speed / Math.max(size * 1.5, 0.01), 1.5)
        uniforms.uFoamRate.value = controls.foamRate
        uniforms.uPush.value = controls.push * size / 0.6
        uniforms.uFoamLife.value = controls.foamLife
        uniforms.uFlowLife.value = controls.flowLife
        uniforms.uSpread.value = controls.spread

        const write = 1 - sim.read
        const previous = gl.getRenderTarget()
        gl.setRenderTarget(sim.targets[write])
        gl.render(sim.stage, sim.camera)
        gl.setRenderTarget(previous)
        sim.read = write

        wakeUniforms.uWakeField.value = sim.targets[write].texture
        wakeUniforms.uWakeArea.value.set(origin.x, origin.z, areaSize, 1)
    })

    return null
}
