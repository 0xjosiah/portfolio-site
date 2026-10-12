import { useSyncExternalStore } from 'react'

/*
 * Which clouds are in the scene, as an ordered list of names: any number of them, including none.
 * Only the list lives here. Each cloud's own settings are panel inputs under 'Clouds.<name>', so they are
 * saved and loaded with presets like every other setting.
 */

/* Preset key the list is saved under. Not a panel input: Presets writes it and applySettings reads it */
export const cloudListPath = 'Clouds.list'

/* Folders inside 'Clouds' that are not a cloud, so no cloud can take their names */
export const sharedFolder = 'All clouds'
export const addFolder = 'Add a cloud'

/* The original three, placed either side of the sun so it stays in view. Used by presets saved before clouds could be added and removed */
const builtInClouds = {
    'Cloud left of sun': { seed: 1, position: [ -31.25, 5.9, -26.75 ], bounds: [ 9, 1.5, 3 ], segments: 30, volume: 8, color: '#ffc2a8' },
    'Cloud right of sun': { seed: 7, position: [ -7.25, 4.9, -39.75 ], bounds: [ 8, 1.5, 3 ], segments: 30, volume: 7, color: '#ffb59c' },
    'Cloud above sun': { seed: 13, position: [ -20.25, 10.9, -35.75 ], bounds: [ 11, 1.2, 3 ], segments: 30, volume: 6, color: '#e9a3c0' },
}

/* A number from 0 to 999 that is always the same for the same name */
function hash(text) {
    let value = 0
    for(const character of text) value = (value * 31 + character.codePointAt(0)) % 1000
    return value
}

/*
 * Values a cloud starts with when the active preset has none for it. A new cloud's shape and where it first
 * appears come from its name, so it looks the same on every load and two new ones do not land on top of each other.
 */
export function cloudDefaults(name) {
    if(name in builtInClouds) return builtInClouds[name]

    const seed = hash(name)
    return { seed, position: [ -30 + seed % 21, 6 + seed % 5, -32 ], bounds: [ 9, 1.5, 3 ], segments: 30, volume: 7, color: '#ffb59c' }
}

let names = []
const listeners = new Set()

function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function setCloudNames(next) {
    names = next
    listeners.forEach((listener) => listener())
}

/* Re-renders the calling component whenever a cloud is added or removed */
export function useCloudNames() {
    return useSyncExternalStore(subscribe, () => names)
}

export function getCloudNames() {
    return names
}

/* True for the saved list itself and for any setting of a cloud currently in the scene */
export function isCloudSetting(path) {
    return path === cloudListPath || names.some((name) => path.startsWith(`Clouds.${name}.`))
}

/*
 * The clouds a preset file holds. Files saved before the list existed have none written down, so theirs are
 * worked out from the cloud settings they contain, falling back to the original three.
 */
export function cloudNamesIn(settings) {
    if(Array.isArray(settings[cloudListPath])) return [ ...new Set(settings[cloudListPath]) ]

    const found = Object.keys(settings)
        .map((path) => path.match(/^Clouds\.([^.]+)\.position$/)?.[1])
        .filter((name) => name && name !== sharedFolder && name !== addFolder)

    return found.length ? found : Object.keys(builtInClouds)
}

/* Adds a cloud and returns the name it ended up with. Leave the name empty to get 'Cloud 1', 'Cloud 2', ... */
export function addCloud(typed) {
    let name = typed.trim()

    if(!name) {
        let number = 1
        while(names.includes(`Cloud ${number}`)) number++
        name = `Cloud ${number}`
    }

    /* names are panel folder names, and the panel splits its paths on full stops */
    if(name.includes('.')) throw new Error('Names cannot contain a full stop')
    if(names.includes(name) || name === sharedFolder || name === addFolder) throw new Error(`'${name}' is already taken`)

    setCloudNames([ ...names, name ])
    return name
}

export function removeCloud(name) {
    setCloudNames(names.filter((other) => other !== name))
}
