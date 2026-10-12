import { levaStore, useControls } from 'leva'
import { useEffect } from 'react'
/* The preset the site opens with. Point this at another file in presets/ to change it */
import defaultPreset from '../presets/nice.json'
import { cloudNamesIn, isCloudSetting, setCloudNames } from './clouds'
import { forgetStoppedMotion } from './travel'

/* Leva panel is only shown when the dev server is started with `yarn start` (vite --mode controls) */
export const controlsEnabled = import.meta.env.MODE === 'controls'

/*
 * Writes a '#rrggbb' string from a leva colour picker straight into a THREE.Color.
 * Shader uniform colours here are used as-is (no colour space conversion), which Color.set() would apply.
 */
export function setRawColor(color, hex) {
    const value = parseInt(hex.replace('#', ''), 16)
    color.r = ((value >> 16) & 255) / 255
    color.g = ((value >> 8) & 255) / 255
    color.b = (value & 255) / 255
}

/* Toggles shared by every DragFrame, the same schema in several components maps to one set of leva inputs */
export function useObjectHelpers() {
    return useControls('Object helpers', {
        showFrames: { value: false, label: 'Show frames around objects' },
        dragObjects: { value: false, label: 'Show drag handles (move in 3D)' },
        tiltObjects: { value: false, label: 'Show tilt handles (rotate titles)' },
    })
}

/*
 * The preset file the scene is working from: the default preset imported above to begin with, then whichever file was
 * last loaded or exported. Reset buttons go back to its values, so a design can be tweaked, reset and
 * tweaked again without losing the saved starting point.
 */
let activePreset = defaultPreset

export function setActivePreset(settings) {
    activePreset = settings
}

/* What the active preset file holds for a setting, or the value written in code when the file has none */
export function savedValue(path, fallback) {
    return path in activePreset ? activePreset[path] : fallback
}

/*
 * Writes saved settings (keyed by leva path, the shape Presets exports) into the panel store, which every
 * component reads from whether or not the panel is shown. Returns how many saved settings no longer exist
 * and were skipped.
 */
export function applySettings(settings) {
    /* before anything else: clouds the file adds mount after this and take their starting values from it */
    setActivePreset(settings)
    setCloudNames(cloudNamesIn(settings))

    const current = levaStore.getData()
    const known = {}
    let skipped = 0
    for(const [ path, value ] of Object.entries(settings)) {
        if(path in current) known[path] = value
        /* settings of a cloud that is about to mount are not in the panel yet, but they are not outdated */
        else if(!isCloudSetting(path)) skipped++
    }
    levaStore.set(known, false)
    forgetStoppedMotion()
    return skipped
}

/*
 * Drops every panel value under a folder, e.g. 'Clouds.Cloud 1.'. Leva holds on to the values of unmounted
 * inputs so they survive a remount, which is wrong for something deleted for good. Call it once the item's
 * components have unmounted.
 */
export function forgetSettings(prefix) {
    levaStore.useStore.setState(({ data }) => {
        for(const path of Object.keys(data)) {
            if(path.startsWith(prefix)) delete data[path]
        }
        return { data }
    })
}

/* The clouds the scene opens with, known before the first render so they mount straight away */
setCloudNames(cloudNamesIn(defaultPreset))

/*
 * Starts the scene from the default preset imported above, in every mode including the built site. Export over that file
 * to change what the site opens with, or point the import at another preset.
 * Call it from a component above everything with controls: a parent's effect runs after its children's, so
 * by then every setting is registered and can be overwritten.
 */
export function useDefaultPreset() {
    useEffect(() => {
        applySettings(defaultPreset)
    }, [])
}
