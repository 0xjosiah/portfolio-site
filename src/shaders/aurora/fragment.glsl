uniform float uTime;
uniform float uIntensity;
uniform float uCurtains;
uniform float uWaviness;
uniform float uRayDensity;
uniform float uHeight;
uniform float uBalance;
uniform float uSeed;
uniform float uAspect;
uniform float uFeather;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Smooth value noise, 0 - 1
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float value = 0.0;
    float amount = 0.5;
    for(int i = 0; i < 4; i++) {
        value += noise(p) * amount;
        p *= 2.03;
        amount *= 0.5;
    }
    return value;
}

// Base colour at the bottom edge, core colour where the light is strongest, tip colour where the rays run out
vec3 curtainColor(float rise) {
    float core = clamp(uBalance, 0.02, 0.98);
    return rise < core
        ? mix(uColorA, uColorB, rise / core)
        : mix(uColorB, uColorC, (rise - core) / (1.0 - core));
}

void main() {
    // Across is measured in the same units as up, so the noise isn't stretched by the patch's shape
    float across = vUv.x * uAspect;
    vec3 light = vec3(0.0);

    for(int i = 0; i < 4; i++) {
        float layer = float(i);
        if(layer >= uCurtains) break;

        float seed = uSeed * 17.31 + layer * 7.13;
        float time = uTime * (0.04 + layer * 0.013);

        // Where the curtain's bottom edge sits, swaying slowly from side to side
        float sway = (fbm(vec2(across * 1.3 + seed, time)) - 0.5) * uWaviness * 1.6;
        float bottom = 0.12 + layer * 0.07 + sway * 0.45;
        float above = vUv.y - bottom;

        // A crisp lower edge that fades out slowly upward, further-back curtains a little shorter
        float reach = max(uHeight * 0.45 * (1.0 - layer * 0.12), 0.01);
        float shape = smoothstep(-0.015, 0.02, above) * exp(-max(above, 0.0) / reach);

        // Vertical rays: fine noise across the curtain that follows its sway and shimmers over time
        float rayScale = mix(6.0, 70.0, uRayDensity);
        float rays = noise(vec2((across + sway * 0.6) * rayScale + seed, time * 6.0 + above * 0.4));
        rays = mix(1.0, 0.15 + 1.8 * rays * rays, clamp(uRayDensity * 2.5, 0.0, 1.0));

        // Brighter and dimmer stretches drifting along the curtain
        float glow = smoothstep(0.25, 0.75, fbm(vec2(across * 1.6 - time * 1.5 + seed * 2.0, layer)));

        float rise = clamp(above / max(reach * 2.2, 0.01), 0.0, 1.0);
        light += curtainColor(rise) * shape * rays * (0.3 + 0.9 * glow) * (1.0 - layer * 0.18);
    }

    // Soft edges all round, so the patch melts into the sky with no visible border
    float edge = smoothstep(0.0, uFeather, vUv.x) * smoothstep(0.0, uFeather, 1.0 - vUv.x)
        * smoothstep(0.0, uFeather * 0.5, vUv.y) * smoothstep(0.0, uFeather, 1.0 - vUv.y);

    // Added on top of the sky, so it only ever brightens what is behind it
    gl_FragColor = vec4(light * uIntensity * edge, 1.0);
}
