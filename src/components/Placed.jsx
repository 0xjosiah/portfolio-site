import { folder, useControls } from 'leva'
import { savedValue } from '../controls'
import DragFrame from './DragFrame'
import Drift from './Drift'

/*
 * One item in the panel that can be placed and then drifts: a 'Starting position' field in its own folder,
 * 'Tilt' and 'Size' fields, a frame plus drag and tilt handles (Object helpers), the motion controls, and a reset back to
 * the active preset file.
 *   folderName - top panel folder, e.g. 'Titles & sign'
 *   name       - this item's folder inside it, also its frame label
 *   position   - starting position written in code, used when the preset file has none
 *   rotation   - tilt in degrees around x, y, z written in code, used when the preset file has none
 *   offset     - optional [ x, y, z ] added on top of the panel position without showing in it,
 *                for adjustments the code makes by itself (e.g. screen width)
 *   lead       - how far upstream it starts, in screen widths, written in code and adjustable in the panel.
 *                0 means it rests exactly at its starting position.
 *   screen     - one screen width in world units, what lead is multiplied by
 * loop and motion are passed on to Drift. Children are drawn at the position, so they should sit at 0, 0, 0.
 */
export default function Placed({ folderName, name, position, rotation = [ 0, 0, 0 ], offset = [ 0, 0, 0 ], lead = 0, screen = 0, frameSize, children, ...drift }) {
    const [ { position: livePosition, rotation: liveRotation, size, lead: liveLead }, set ] = useControls(folderName, () => ({
        [name]: folder({
            position: { value: position, step: 0.05, label: 'Starting position (x, y, z)' },
            rotation: { value: rotation, step: 1, label: 'Tilt (° around x, y, z)' },
            size: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'Size (x original)' },
            lead: { value: lead, min: 0, max: 4, step: 0.05, label: 'Starts upstream by (x screen widths)' },
        }, { collapsed: true }),
    }))

    /* the reset button also undoes any moving, tilting or resizing, back to how the active preset file has it */
    const restorePosition = () => set({
        position: savedValue(`${folderName}.${name}.position`, position),
        rotation: savedValue(`${folderName}.${name}.rotation`, rotation),
        size: savedValue(`${folderName}.${name}.size`, 1),
    })

    return (
        <Drift path={[ folderName, name ]} lead={liveLead * screen} onReset={restorePosition} {...drift}>
            <DragFrame
                label={name}
                position={livePosition.map((value, axis) => value + offset[axis])}
                onMove={(moved) => set({ position: moved.map((value, axis) => Math.round((value - offset[axis]) * 100) / 100) })}
                rotation={liveRotation}
                onRotate={(rotation) => set({ rotation })}
                frameSize={frameSize}
            >
                {/* grows and shrinks from the position, the same point the tilt turns about */}
                <group scale={size}>{ children }</group>
            </DragFrame>
        </Drift>
    )
}
