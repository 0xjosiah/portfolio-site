/*
 * What the 3D scene tells the light rays drawn over it (components/Rays.jsx). The scene and the page are
 * separate React trees, so this lives outside both.
 */

/* Where the rays come from on screen: 0 to 1 across and down the window. Written every frame by RaySource */
export const raySource = { x: 0.5, y: 0.5 }

/*
 * The see-through middle of the '0' as it appears on screen: its four corners in pixels, going top left, top right,
 * bottom right, bottom left, and whether it can be seen at all. Written every frame by LensFrame
 */
export const lensFrame = { corners: [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ], visible: false }

/*
 * How the 'eye' in the '0' comes open, shared by the lens and the light so they move as one: it opens, flutters
 * most of the way shut, then opens for good, like blinking awake.
 *   amounts - how open it is at each step, 0 shut to 1 wide open. It starts from however open it already is
 *   times   - when each step lands, as a fraction of the duration
 */
export const blinkOpen = {
    amounts: [ 1, 0.15, 1 ],
    transition: { duration: 0.6, times: [ 0, 0.3, 0.5, 1 ], ease: 'easeInOut' },
}

/* And how it shuts again, timed with the card fading out, see PageScaffold */
export const blinkShut = { duration: 0.8, ease: 'circOut' }
