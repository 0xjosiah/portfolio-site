import { Html, PivotControls, TransformControls } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { controlsEnabled, useObjectHelpers } from '../controls'

const labelStyle = {
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#000000b0',
    font: '11px monospace',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
}

const tiltEuler = new THREE.Euler()

const toRadians = (degrees) => degrees.map(THREE.MathUtils.degToRad)

const labelPosition = new THREE.Vector3()
const cameraDirection = new THREE.Vector3()

function FrameLabel({ text, color, position }) {
    const anchor = useRef(null)
    const label = useRef(null)

    /* drei's Html only re-checks visibility when the camera moves, so a label behind a still camera would show mirrored on screen */
    useFrame(({ camera }) => {
        if(!label.current) return
        anchor.current.getWorldPosition(labelPosition).sub(camera.position)
        const behindCamera = labelPosition.dot(camera.getWorldDirection(cameraDirection)) < 0
        label.current.style.visibility = behindCamera ? 'hidden' : 'visible'
    })

    return (
        <group ref={anchor} position={position}>
            {/* zIndexRange keeps labels underneath the leva panel */}
            <Html ref={label} center zIndexRange={[ 10, 0 ]} style={{ ...labelStyle, color }}>
                { text }
            </Html>
        </group>
    )
}

/*
 * Positions its children and, when switched on from the leva panel (yarn start), draws a labelled
 * wireframe box around them and a drag gizmo. onMove gets the new [ x, y, z ] when a drag ends
 * so the panel's coordinates stay in sync. Leave onMove out for a frame that only marks something
 * and cannot be dragged.
 * rotation ([ x, y, z ] in degrees) tilts the children about the position. With onRotate as well, tilt
 * handles can be switched on from the panel and onRotate gets the new angles when a tilt ends.
 */
export default function DragFrame({ label, position, onMove, rotation, onRotate, frameSize = [ 1, 1, 1 ], color = '#00ffcc', children }) {
    const { showFrames, dragObjects, tiltObjects } = useObjectHelpers()
    const group = useRef(null)
    const scene = useThree((state) => state.scene)

    const [ width, height, depth ] = frameSize
    const edges = useMemo(() => {
        const box = new THREE.BoxGeometry(width, height, depth)
        const geometry = new THREE.EdgesGeometry(box)
        box.dispose()
        return geometry
    }, [ width, height, depth ])

    /* made by hand rather than in JSX, so it is not freed automatically when the size changes or the object is removed */
    useEffect(() => () => edges.dispose(), [ edges ])

    const commitPosition = () => {
        onMove(group.current.position.toArray().map((value) => Math.round(value * 100) / 100))
    }

    const [ tiltX, tiltY, tiltZ ] = rotation ?? [ 0, 0, 0 ]

    /* PivotControls keeps this matrix up to date while a handle is dragged, so it also holds the result when the drag ends */
    const tilt = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(tiltEuler.set(...toRadians([ tiltX, tiltY, tiltZ ]))), [ tiltX, tiltY, tiltZ ])

    const commitRotation = () => {
        tiltEuler.setFromRotationMatrix(tilt)
        onRotate([ tiltEuler.x, tiltEuler.y, tiltEuler.z ].map((value) => Math.round(THREE.MathUtils.radToDeg(value) * 10) / 10))
    }

    let content = children

    if(rotation) {
        /*
         * Always wrapped while the panel is available, switching wrappers would rebuild the children. The handles
         * themselves only exist while the tilt toggle is on, hidden ones would still catch clicks.
         */
        content = controlsEnabled && onRotate
            ? <PivotControls
                matrix={tilt}
                disableAxes
                disableSliders
                disableRotations={!tiltObjects}
                fixed
                scale={90}
                depthTest={false}
                onDragEnd={commitRotation}
            >
                { children }
            </PivotControls>
            : <group rotation={toRadians([ tiltX, tiltY, tiltZ ])}>{ children }</group>
    }

    return (
        <>
            <group ref={group} position={position}>
                { content }

                { controlsEnabled && showFrames &&
                    <>
                        <lineSegments geometry={edges}>
                            <lineBasicMaterial color={color} toneMapped={false} />
                        </lineSegments>
                        <FrameLabel text={label} color={color} position={[ 0, height * 0.5, 0 ]} />
                    </>
                }
            </group>

            {/*
              * Drawn at the scene root rather than here: the handle already places itself at the object's world position,
              * so sitting inside a parent that has moved (a Drift part way round its loop) would shift it a second time
              */}
            { controlsEnabled && dragObjects && onMove &&
                createPortal(<TransformControls object={group} mode='translate' onMouseUp={commitPosition} />, scene)
            }
        </>
    )
}
