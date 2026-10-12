import wavesShader from '../shaders/ocean/waves.glsl'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { compassToDirection } from '../compass'
import { useSunPosition } from '../sunset'
import { claimFloatShadow, horizonFade, releaseFloatShadow, shadowFrame, waterLevel, waveUniforms } from '../water'
import DragFrame from './DragFrame'
import Drift from './Drift'

/*
 * Four boats taken out of 'Origami - Ships and Boats' by Clonk, CC-BY-4.0
 * https://sketchfab.com/3d-models/origami-ships-and-boats-5bccd248d9944204890b99924bcfb232
 * Each resized to 1 unit long with the bow toward +Z and the bottom of the hull at y = 0. They are in one
 * file and share one texture, so however many boats are in the scene there is a single download and a
 * single texture on the graphics card.
 */
const modelPath = './models/boats.glb'

useGLTF.preload(modelPath)

/* The meshes in the file by name, with half the hull's width and the full height in the model's own units (every hull is 1 long) */
const models = {
    Sailboat: { halfWidth: 0.12, height: 0.79 },
    PaperBoat: { halfWidth: 0.245, height: 0.4 },
    TallSail: { halfWidth: 0.207, height: 1.26 },
    WideSail: { halfWidth: 0.24, height: 0.78 },
}

const halfLength = 0.5

const pointing = new THREE.Vector3()
const awayFromSun = new THREE.Vector3()

/* Pixels along each side of the shadow mask. Small on purpose, the shadow is soft and a long way from the eye */
const maskSize = 128

/* How many of the mask's smaller copies the softness slider reaches down through */
const maxBlur = 5

/* Wraps a set of panel inputs in the folders after the first one in a path, e.g. [ 'Boats', 'Boat on the horizon' ] */
const nest = (folders, fields) => folders.reduceRight((inner, name) => ({ [name]: folder(inner, { collapsed: true }) }), fields)

/*
 * Added to the standard material's vertex shader. The boat is moved as one rigid piece: the water height is
 * measured under the bow, stern and both sides, the boat is set at the average and tipped to match the slopes.
 * All of it happens on the graphics card with the ocean's own wave function, so the boat sits on exactly the
 * surface that is drawn and there is nothing to work out in javascript each frame.
 */
const floatShader = /* glsl */`
    ${wavesShader}

    uniform float uWaterLevel;
    uniform float uSink;
    uniform float uRocking;
    uniform vec2 uHull;

    vec3 floatOffset;
    mat3 floatTilt;

    varying float vViewDistance;

    void computeFloat() {
        // Where the boat is and which way it points, read from its own placement in the scene
        vec2 centre = modelMatrix[3].xz;
        vec2 toSide = modelMatrix[0].xz * uHull.y;
        vec2 toBow = modelMatrix[2].xz * uHull.x;
        float size = length(modelMatrix[0].xyz);

        float bow = waveElevation(centre + toBow - uWaveOrigin);
        float stern = waveElevation(centre - toBow - uWaveOrigin);
        float left = waveElevation(centre + toSide - uWaveOrigin);
        float right = waveElevation(centre - toSide - uWaveOrigin);

        // Tipped fore and aft, and side to side, by the slope of the water under the hull
        float pitch = atan(bow - stern, 2.0 * length(toBow)) * uRocking;
        float roll = atan(left - right, 2.0 * length(toSide)) * uRocking;

        mat3 pitchTilt = mat3(
            1.0, 0.0, 0.0,
            0.0, cos(pitch), -sin(pitch),
            0.0, sin(pitch), cos(pitch)
        );
        mat3 rollTilt = mat3(
            cos(roll), sin(roll), 0.0,
            -sin(roll), cos(roll), 0.0,
            0.0, 0.0, 1.0
        );
        floatTilt = pitchTilt * rollTilt;

        // Height is given in world units, the offset is applied before the boat's own scale
        float surface = uWaterLevel + (bow + stern + left + right) * 0.25;
        floatOffset = vec3(0.0, (surface - uSink - modelMatrix[3].y) / size, 0.0);
    }
`

/* Added to the fragment shader: the boat fades into the horizon colour with distance exactly as the water under it does */
const hazeUniforms = /* glsl */`
    uniform float uFogNear;
    uniform float uFogFar;
    uniform vec3 uHorizonColor;
    uniform float uHaze;

    varying float vViewDistance;
`

const hazeShader = /* glsl */`
    gl_FragColor.rgb = mix(gl_FragColor.rgb, uHorizonColor, smoothstep(uFogNear, uFogFar, vViewDistance) * uHaze);
`

/*
 * The boat's shadow on the water, only mounted for a boat that asks for one. Renders nothing itself: it draws
 * the boat's outline into a small mask and hands that to the ocean, which does the painting (see floatShadows).
 *   boat   - ref to the boat's mesh, the shadow follows wherever that actually is, drifting included
 *   height - how tall the model is in its own units, so the mask takes in the top of the mast
 */
function BoatShadow({ path, boat, geometry, height, yaw, size }) {
    const [ topFolder, ...subFolders ] = path

    const { shadow, shadowLength, shadowWidth, shadowSoftness } = useControls(topFolder, nest(subFolders, {
        /* the boat's outline on the water, falling away from the sun. Length is in boat lengths so it grows with the boat */
        shadow: { value: 0.35, min: 0, max: 1, step: 0.01, label: 'Shadow darkness (0 = none)' },
        shadowLength: { value: 2, min: 0.1, max: 10, step: 0.05, label: 'Shadow length (x boat)' },
        shadowWidth: { value: 1, min: 0.1, max: 4, step: 0.05, label: 'Shadow width (1 = true to the boat)' },
        shadowSoftness: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Shadow blur' },
    }))

    const gl = useThree((state) => state.gl)
    const { azimuth } = useSunPosition()

    /* top of the mask's frame, a little above the mast */
    const top = height + 0.06

    /* one of the few shadows the ocean can paint, held for as long as this boat is in the scene. null if they are all in use */
    const [ slot, setSlot ] = useState(null)

    useEffect(() => {
        const claimed = claimFloatShadow()
        setSlot(claimed)
        return () => releaseFloatShadow(claimed)
    }, [])

    /*
     * Everything needed to draw the shadow mask: a small texture and a throwaway scene holding the boat in plain
     * white, looked at side-on by a camera with no perspective. Made once and reused for every redraw.
     */
    const mask = useMemo(() => {
        const target = new THREE.WebGLRenderTarget(maskSize, maskSize, {
            depthBuffer: false,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
        })

        const outline = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, toneMapped: false })
        const outlined = new THREE.Mesh(geometry, outline)

        const stage = new THREE.Scene()
        stage.background = new THREE.Color('#000000')
        stage.add(outlined)

        const { halfWidth, bottom } = shadowFrame
        const camera = new THREE.OrthographicCamera(- halfWidth, halfWidth, top, bottom, 0.1, 10)

        return { target, outline, outlined, stage, camera }
    }, [ geometry, top ])

    /* the texture lives on the graphics card and the material was made by hand, neither is freed automatically */
    useEffect(() => () => {
        mask.target.dispose()
        mask.outline.dispose()
    }, [ mask ])

    /*
     * Redrawn only when the outline the sun sees changes: the boat turns or the sun moves sideways. Not every frame.
     * The camera stands on the sun's side of the boat, level with the water, looking the way the shadow falls.
     */
    useEffect(() => {
        compassToDirection(azimuth, 0, awayFromSun).negate()

        mask.outlined.rotation.y = yaw
        mask.camera.position.copy(awayFromSun).multiplyScalar(-5)
        mask.camera.lookAt(0, 0, 0)

        const previous = gl.getRenderTarget()
        gl.setRenderTarget(mask.target)
        gl.render(mask.stage, mask.camera)
        gl.setRenderTarget(previous)
    }, [ gl, mask, yaw, azimuth ])

    /* the mask's frame is a little larger than the boat, so the shadow's area is scaled up to match and shifted so the hull's base sits at the boat */
    const reach = size * shadowLength * (top - shadowFrame.bottom) / shadowFrame.reference
    const offset = size * shadowLength * shadowFrame.bottom / shadowFrame.reference
    const width = size * shadowWidth * shadowFrame.halfWidth * 2

    /* the ocean does the drawing, this only hands it the mask and says how it should look */
    useEffect(() => {
        if(!slot) return
        slot.mask.value = mask.target.texture
        slot.look.value.set(shadow, shadowSoftness * maxBlur)
    }, [ slot, mask, shadow, shadowSoftness ])

    /* and where: read from the boat itself every frame, so a boat that drifts or follows the scroll takes its shadow with it */
    useFrame(() => {
        if(!slot || !boat.current) return

        boat.current.updateWorldMatrix(true, false)
        const { elements } = boat.current.matrixWorld

        compassToDirection(azimuth, 0, awayFromSun).negate()
        slot.area.value.set(elements[12] + awayFromSun.x * offset, elements[14] + awayFromSun.z * offset, reach, width)
    })

    return null
}

/*
 * A paper boat floating on the ocean.
 *   path    - panel folders its controls go in, e.g. [ 'Boats', 'Boat on the horizon' ]. The last one is also its frame label
 *   model   - which boat from the file: 'Sailboat', 'PaperBoat', 'TallSail' or 'WideSail'
 *   place   - [ x, z ] it starts at, written in code and used when the preset file has none. The water sets the height
 *   heading - compass heading the bow points along
 *   size    - length of the hull in world units
 *   shadow  - true to cast a shadow on the water. The ocean can paint a handful at once (maxFloatShadows)
 *   drift   - optional { loop, lead, motion }, passed to Drift so the boat travels with the scene like the titles do
 */
export default function Boat({ path, model, place: placeDefault, heading: headingDefault = 270, size: sizeDefault = 0.6, shadow = false, drift }) {
    const { nodes } = useGLTF(modelPath)
    const [ topFolder, ...subFolders ] = path
    const label = path[path.length - 1]
    const mesh = useRef(null)

    const [ { show, place, heading, size, sink, rocking, haze, tint }, set ] = useControls(topFolder, () => nest(subFolders, {
        show: { value: true, label: 'Show' },
        /* height is not set here, the water decides it */
        place: { value: placeDefault, step: 0.05, label: 'Position (x, z)' },
        heading: { value: headingDefault, min: 0, max: 360, step: 1, label: 'Bow points (0 N, 90 E, 180 S, 270 W)' },
        size: { value: sizeDefault, min: 0.05, max: 5, step: 0.01, label: 'Length' },
        sink: { value: 0.04, min: -0.2, max: 0.5, step: 0.005, label: 'Sits this deep in the water' },
        rocking: { value: 0.6, min: 0, max: 1.5, step: 0.01, label: 'Rocking with the waves' },
        haze: { value: 1, min: 0, max: 1, step: 0.01, label: 'Fades into the horizon (1 = like the water)' },
        tint: { value: '#ffffff', label: 'Tint colour' },
    }), subFolders.length ? undefined : { collapsed: true })

    /* the geometry and texture belong to the loaded model and are reused as they are */
    const { geometry } = nodes[model]
    const { map } = nodes[model].material

    const material = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({ map, roughness: 0.6, metalness: 0, side: THREE.DoubleSide })

        material.userData.uniforms = {
            uWaterLevel: { value: waterLevel },
            uSink: { value: 0 },
            uRocking: { value: 0 },
            uHaze: { value: 0 },
            uHull: { value: new THREE.Vector2(halfLength, models[model].halfWidth) },
        }

        material.onBeforeCompile = (shader) => {
            /* the wave and horizon uniforms are the ocean's own objects, so they are always current */
            Object.assign(shader.uniforms, waveUniforms, horizonFade, material.userData.uniforms)

            shader.vertexShader = shader.vertexShader
                .replace('void main() {', `${floatShader}\nvoid main() {\n    computeFloat();`)
                .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n    objectNormal = floatTilt * objectNormal;')
                .replace('#include <begin_vertex>', '#include <begin_vertex>\n    transformed = floatTilt * transformed + floatOffset;')
                .replace('#include <project_vertex>', '#include <project_vertex>\n    vViewDistance = length(mvPosition.xyz);')

            shader.fragmentShader = shader.fragmentShader
                .replace('void main() {', `${hazeUniforms}\nvoid main() {`)
                .replace('#include <dithering_fragment>', `${hazeShader}\n    #include <dithering_fragment>`)
        }

        /* every boat compiles to the same shader, this keeps it apart from other standard materials in three's program cache */
        material.customProgramCacheKey = () => 'floating'

        return material
    }, [ map, model ])

    /* made by hand rather than in JSX, so it has to be freed by hand */
    useEffect(() => () => material.dispose(), [ material ])

    useEffect(() => {
        material.color.set(tint)
        material.userData.uniforms.uSink.value = sink
        material.userData.uniforms.uRocking.value = rocking
        material.userData.uniforms.uHaze.value = haze
    }, [ material, tint, sink, rocking, haze ])

    /* the model's bow is +Z, turned here to face the compass heading */
    compassToDirection(heading, 0, pointing)
    const yaw = Math.atan2(pointing.x, pointing.z)

    const [ x, z ] = place

    if(!show) return null

    const boat = (
        <DragFrame
            label={label}
            position={[ x, waterLevel, z ]}
            onMove={([ movedX, , movedZ ]) => set({ place: [ movedX, movedZ ] })}
            frameSize={[ size, size, size ]}
        >
            {/* never culled: the shader moves it, so three.js does not know exactly where it ends up */}
            <mesh ref={mesh} geometry={geometry} material={material} rotation-y={yaw} scale={size} frustumCulled={false} />
        </DragFrame>
    )

    return (
        <>
            { drift ? <Drift path={path} {...drift}>{ boat }</Drift> : boat }
            { shadow && <BoatShadow path={path} boat={mesh} geometry={geometry} height={models[model].height} yaw={yaw} size={size} /> }
        </>
    )
}
