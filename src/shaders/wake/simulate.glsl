// One step of the boat's wake: a small patch of water around the sailed boat, kept as a texture.
// Each texel holds how the water there is flowing (rg, world x and z, units per second) and how much foam it
// carries (b). Every frame the patch is carried along by its own flow, spreads a little, fades, and the boat
// stirs fresh foam and outward flow in around its hull. The flow carrying the foam outward is what opens the
// trail into a V behind the boat, the way ChromaFlow's colours keep moving the way the cursor pushed them.

uniform sampler2D uPrevious;
uniform vec2 uShift;          // where this frame's texels were last frame, in texture units (the patch follows the boat and the water drifts)
uniform float uTexel;         // one texel, in texture units
uniform float uAreaSize;      // the patch's width in world units
uniform vec2 uAreaOrigin;     // world x, z of the patch's corner
uniform float uDt;

uniform vec2 uBoat;           // world x, z of the boat
uniform vec2 uBow;            // which way the bow points, world x, z
uniform vec2 uHull;           // half the hull's length and width, world units
uniform float uSpeed;         // how fast the boat is going, 0 at rest and 1 at cruising speed

uniform float uFoamRate;      // how quickly foam builds up beside the hull
uniform float uPush;          // how hard the hull pushes water out to the sides, units per second at cruising speed
uniform float uFoamLife;      // seconds for foam to fade to about a third
uniform float uFlowLife;      // seconds for the outward flow to settle
uniform float uSpread;        // how quickly the foam softens and spreads

varying vec2 vUv;

vec4 previousAt(vec2 uv) {
    if(uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return vec4(0.0);
    return texture2D(uPrevious, uv);
}

void main() {
    vec2 here = vUv + uShift;

    // Carried along by its own flow: whatever is here now came from upstream
    vec2 flow = previousAt(here).rg;
    vec2 from = here - flow * uDt / uAreaSize;

    vec4 field = previousAt(from);

    // Softens into the water around it
    vec4 around = (
        previousAt(from + vec2(uTexel, 0.0)) +
        previousAt(from - vec2(uTexel, 0.0)) +
        previousAt(from + vec2(0.0, uTexel)) +
        previousAt(from - vec2(0.0, uTexel))
    ) * 0.25;
    field = mix(field, around, clamp(uSpread * uDt, 0.0, 1.0));

    field.rg *= exp(- uDt / max(uFlowLife, 0.01));
    field.b *= exp(- uDt / max(uFoamLife, 0.01));

    // The boat stirs the water around its hull. Measured along the bow and out to the side, in hull sizes
    vec2 world = uAreaOrigin + vUv * uAreaSize;
    vec2 fromBoat = world - uBoat;
    vec2 side = vec2(- uBow.y, uBow.x);
    float along = dot(fromBoat, uBow) / uHull.x;
    float across = dot(fromBoat, side) / uHull.y;

    // An oval a little wider than the hull, and a churned strip trailing off the stern
    float rim = length(vec2(along, across * 0.6));
    float stir = smoothstep(1.5, 0.9, rim);
    float wash = smoothstep(1.4, 0.0, abs(across) * 0.5) * smoothstep(0.0, -0.8, along) * smoothstep(-2.2, -1.0, along);
    stir = max(stir, wash * 0.35) * uSpeed;

    if(stir > 0.0) {
        // Out to whichever side it is on, and a little back the way the boat came from
        vec2 pushed = (side * sign(across) * uPush - uBow * 0.25) * uSpeed;
        field.rg = mix(field.rg, pushed, clamp(stir * uDt * 8.0, 0.0, 1.0));
        field.b = min(field.b + stir * uFoamRate * uDt, 1.0);
    }

    // Fades out toward the patch's edges so the trail never ends on a hard line
    vec2 edge = min(vUv, 1.0 - vUv);
    field *= smoothstep(0.0, 0.08, min(edge.x, edge.y));

    gl_FragColor = vec4(field.rgb, 1.0);
}
