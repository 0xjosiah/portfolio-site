import { button, levaStore, useControls } from 'leva'
import { useEffect, useState } from 'react'
import { addFolder, cloudListPath, getCloudNames } from '../clouds'
import { applySettings, setActivePreset } from '../controls'

/* Served by the scenePresets plugin in vite.config.js, which reads and writes the ./presets folder */
const endpoint = '/__presets'

/* Panel tooling rather than scene settings, left out of saved files */
const excludedFolders = [ 'Presets.', 'Debug.', 'Object helpers.', `Clouds.${addFolder}.` ]

/* Every scene setting in the panel, keyed by its leva path e.g. 'Ocean.Water colour.depthColor' */
function collectSettings() {
    const settings = {}
    for(const [ path, input ] of Object.entries(levaStore.getData())) {
        if(excludedFolders.some((folder) => path.startsWith(folder)) || !('value' in input)) continue
        settings[path] = input.value
    }

    /* which clouds exist is not a panel input, without it a file could not hold an empty sky */
    settings[cloudListPath] = getCloudNames()
    return settings
}

async function request(path = '', options) {
    const response = await fetch(`${endpoint}/${path}`, options)
    const body = await response.json()
    if(!response.ok) throw new Error(body.error)
    return body
}

/* Renders nothing, only adds the 'Presets' folder to the leva panel. Mounted in controls mode only (yarn start) */
export default function Presets() {
    const [ saved, setSaved ] = useState([])

    const refreshSaved = () => request().then(setSaved)

    const [ , setExport ] = useControls('Presets', () => ({
        fileName: { value: 'my-sunset', label: 'File name to export as' },
        'Export all settings to presets/': button(async (get) => {
            /* tidy whatever was typed into something safe to use as a file name */
            const name = get('Presets.fileName').trim().replace(/\.json$/i, '').replace(/[^A-Za-z0-9_-]+/g, '-')
            if(!name) return setExport({ status: 'Type a file name first' })

            try {
                const settings = collectSettings()
                const { saved } = await request(name, { method: 'POST', body: JSON.stringify(settings) })

                /* the file just written is now the one the reset buttons go back to */
                setActivePreset(settings)
                await refreshSaved()
                setExport({ status: `Saved ${saved}` })
            } catch(error) {
                setExport({ status: `Export failed: ${error.message}` })
            }
        }),
        status: { value: 'Nothing exported or loaded yet', editable: false, label: 'Last action' },
    }))

    /* Rebuilt whenever the list of saved files changes so new exports show up straight away */
    useControls('Presets', {
        load: {
            value: '',
            options: { 'Choose a saved preset…': '', ...Object.fromEntries(saved.map((name) => [ name, name ])) },
            label: 'Load saved preset',
            onChange: async (name) => {
                if(!name) return

                try {
                    const skipped = applySettings(await request(name))
                    setExport({ status: `Loaded presets/${name}.json` + (skipped ? ` (${skipped} outdated settings skipped)` : '') })
                } catch(error) {
                    setExport({ status: `Load failed: ${error.message}` })
                }
            },
        },
    }, [ saved ])

    useEffect(() => {
        refreshSaved().catch((error) => setExport({ status: `Could not list presets: ${error.message}` }))
    }, [])

    return null
}
