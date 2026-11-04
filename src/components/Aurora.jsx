import vertexShader from '../shaders/aurora/vertex.glsl'
import fragmentShader from '../shaders/aurora/fragment.glsl'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { compassToDirection } from '../compass'
import { setRawColor } from '../controls'

/* Inside the sky sphere (100) and the camera's far plane, out past the stars so they show through it */
const auroraDistance = 97

/* The same starting colours as the shaders.com Aurora */
const colorDefaults = { a: '#a533f8', b: '#22ee88', c: '#1694e8' }

/* Rows and columns of the patch. Enough that it follows the curve of the dome */
const segments = 32

const direction = new THREE.Vector3()

/*
 * A curved patch of the sky dome, the part of the sky the aurora is painted on. UVs run 0 - 1 left to right
 * and bottom to top, so the shader works the same whatever size and place the patch has.
 *   heading - compass degrees of its middle, 0 straight ahead and + to the right
 *   width   - degrees it spans left to right
 *   bottom  - degrees above the horizon of its lowest edge
 *   tall    - degrees it spans upward from there
 */
function createPatchGeometry(heading, width, bottom, tall) {
    const positions = []
    const uvs = []
    const indices = []

    for(let row = 0; row <= segments; row++) {
        const v = row / segments
        for(let column = 0; column <= segments; column++) {
            const u = column / segments
            compassToDirection(heading + (u - 0.5) * width, bottom + v * tall, direction)
                .multiplyScalar(auroraDistance)
            positions.push(direction.x, direction.y, direction.z)
            uvs.push(u, v)
        }
    }

    const across = segments + 1
    for(let row = 0; row < segments; row++) {
        for(let column = 0; column < segments; column++) {
            const a = row * across + column
            const b = a + 1
            const c = a + across
            const d = c + 1
            indices.push(a, c, b, b, c, d)
        }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    return geometry
}

const AuroraMaterial = shaderMaterial(
    /* Uniforms */
    {
        uTime: 0,
        uIntensity: 1,
        uCurtains: 4,
        uWaviness: 0.5,
        uRayDensity: 0.2,
        uHeight: 1.2,
        uBalance: 0.5,
        uSeed: 0,

        /* width / height of the patch, so the shader can keep its noise square */
        uAspect: 1,
        /* how far in from each edge the patch fades out, 0 - 0.5 */
        uFeather: 0.25,

        uColorA: new THREE.Color(colorDefaults.a),
        uColorB: new THREE.Color(colorDefaults.b),
        uColorC: new THREE.Color(colorDefaults.c),
    },
    vertexShader,
    fragmentShader
)

extend({ AuroraMaterial })

/*
 * Northern lights in the top right of the view: layered curtains with vertical rays that sway and shimmer.
 * Modelled on the shaders.com Aurora (https://shaders.com/docs/components/aurora), and its panel settings use
 * the same 0 - 100 scales so values can be copied across. Written in GLSL on the sky dome rather than using that
 * component, because it draws on its own WebGPU canvas over the page: it would cover the titles and clouds, and
 * browsers without WebGPU would show nothing.
 */
export default function Aurora() {
    const auroraMat = useRef(null)

    const {
        show, heading, width, bottom, tall, feather,
        colorA, colorB, colorC, balance,
        intensity, curtains, speed, waviness, rayDensity, height, seed,
    } = useControls('Aurora', {
        show: { value: true, label: 'Show' },
        'Placement': folder({
            /* the right edge of the default view is about 37° on a wide screen and the top edge about 18° up */
            heading: { value: 24, min: -180, max: 180, step: 0.5, label: 'Middle (° right of straight ahead)' },
            width: { value: 40, min: 5, max: 180, step: 0.5, label: 'Width (°)' },
            bottom: { value: 4, min: -5, max: 60, step: 0.5, label: 'Lowest edge (° above horizon)' },
            tall: { value: 26, min: 2, max: 80, step: 0.5, label: 'Height of the patch (°)' },
            feather: { value: 0.25, min: 0.01, max: 0.5, step: 0.01, label: 'Soft edges (0 - 0.5)' },
        }, { collapsed: true }),
        'Colours': folder({
            colorA: { value: colorDefaults.a, label: 'Base, along the bottom edge' },
            colorB: { value: colorDefaults.b, label: 'Core, where it is brightest' },
            colorC: { value: colorDefaults.c, label: 'Tips, where the rays fade out' },
            balance: { value: 50, min: 0, max: 100, step: 1, label: 'Balance (where the core sits)' },
        }, { collapsed: true }),
        'Curtains': folder({
            intensity: { value: 80, min: 0, max: 100, step: 1, label: 'Intensity' },
            curtains: { value: 4, min: 1, max: 4, step: 1, label: 'Number of curtains' },
            speed: { value: 5, min: -10, max: 10, step: 0.1, label: 'Speed' },
            waviness: { value: 50, min: 0, max: 200, step: 1, label: 'Waviness' },
            rayDensity: { value: 20, min: 0, max: 100, step: 1, label: 'Ray detail' },
            height: { value: 120, min: 10, max: 200, step: 1, label: 'How tall the curtains reach' },
            seed: { value: 0, min: 0, max: 100, step: 1, label: 'Seed (variation)' },
        }, { collapsed: true }),
    }, { collapsed: true })

    const geometry = useMemo(() => createPatchGeometry(heading, width, bottom, tall), [ heading, width, bottom, tall ])

    /* made by hand rather than in JSX, so the old buffers have to be freed whenever the patch is rebuilt */
    useEffect(() => () => geometry.dispose(), [ geometry ])

    useLayoutEffect(() => {
        setRawColor(auroraMat.current.uColorA, colorA)
        setRawColor(auroraMat.current.uColorB, colorB)
        setRawColor(auroraMat.current.uColorC, colorC)
    }, [ colorA, colorB, colorC ])

    /* kept as its own clock so changing the speed carries on from where the curtains are, rather than jumping */
    const time = useRef(0)
    useFrame((_, delta) => {
        time.current += delta * speed * 0.2
        auroraMat.current.uTime = time.current
    })

    return (
        /* drawn early like the stars, so the see-through clouds go over it */
        <mesh geometry={geometry} visible={show} renderOrder={-1} frustumCulled={false}>
            <auroraMaterial
                ref={auroraMat}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                uAspect={width / tall}
                uFeather={feather}
                uIntensity={intensity * 0.007}
                uCurtains={curtains}
                uWaviness={waviness * 0.01}
                uRayDensity={rayDensity * 0.01}
                uHeight={height * 0.01}
                uBalance={balance * 0.01}
                uSeed={seed}
            />
        </mesh>
    )
}
