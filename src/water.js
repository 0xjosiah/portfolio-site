import * as THREE from 'three'
import { sceneCentre } from './camera'
import { palette } from './sunset'

/* Height the water rests at, waves rise and fall around it */
export const waterLevel = sceneCentre[1]

/*
 * The shape of the water right now, as shader uniforms: the same values the ocean is drawn with. The ocean
 * writes them, anything that has to sit on the surface (the sailboat) hands these same objects to its own
 * shader, so it follows the waves without anything being copied across each frame.
 */
/*
 * How the water fades into the horizon, again as the ocean's own values, so that something floating far away
 * can fade by the same amount as the water it sits on.
 */
export const horizonFade = {
    uFogNear: { value: 9 },
    uFogFar: { value: 20 },
    uHorizonColor: { value: palette.horizon },
}

/* How many floating things can have a shadow at once. The ocean's shader has exactly this many written into it */
export const maxFloatShadows = 4

/*
 * The shadows of whatever is floating, which the ocean paints on itself: one texture lookup per pixel of water
 * inside a shadow, no extra geometry or draw call. Each floating thing claims one of these, writes it, and
 * the ocean reads them all. They are whole uniform objects so the ocean's material can hold the very same ones.
 *   mask - the floating thing's outline as seen from the sun, white on black. Its top is the far end of the shadow
 *   area - (x, z) the shadow starts from, then how far it reaches away from the sun and how wide the mask's
 *          frame is, all in world units
 *   look - (darkness 0 - 1, blur). Darkness 0 means no shadow
 */
export const floatShadows = Array.from({ length: maxFloatShadows }, () => ({
    mask: { value: null },
    area: { value: new THREE.Vector4(0, 0, 1, 1) },
    look: { value: new THREE.Vector2(0, 0) },
    taken: false,
}))

/* Hands out a shadow nobody is using, or null when all of them are taken */
export function claimFloatShadow() {
    const shadow = floatShadows.find((shadow) => !shadow.taken) ?? null
    if(shadow) shadow.taken = true
    return shadow
}

/* Gives a shadow back and switches it off, so the ocean stops painting it */
export function releaseFloatShadow(shadow) {
    if(!shadow) return
    shadow.taken = false
    shadow.look.value.x = 0
    shadow.mask.value = null
}

/*
 * The part of a model its shadow mask shows, in model units: this far either side of its centre and from just
 * below its base upward. How far up depends on how tall the model is. A point `reference` high throws its shadow
 * exactly as far as the shadow length asks for, taller things reach further.
 */
export const shadowFrame = { halfWidth: 0.55, bottom: -0.05, reference: 0.85 }

export const waveUniforms = {
    uTime: { value: 0 },
    uWaveOrigin: { value: new THREE.Vector2( sceneCentre[0], sceneCentre[2] ) },
    uBigWavesElevation: { value: 0 },
    uBigWavesFrequency: { value: new THREE.Vector2() },
    uBigWavesSpeed: { value: 0 },
    uSmallWavesElevation: { value: 0 },
    uSmallWavesFrequency: { value: 0 },
    uSmallWavesSpeed: { value: 0 },
    uSmallWavesIterations: { value: 0 },
}
