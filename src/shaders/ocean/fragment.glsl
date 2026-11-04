uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uHorizonColor;
uniform float uShininess;
uniform float uGlitterStrength;
uniform vec3 uGlitterColor2;
uniform float uShininess2;
uniform float uGlitterStrength2;
uniform float uGlitterSpread2;
uniform float uFogNear;
uniform float uFogFar;

// One set per floating thing that can have a shadow, see floatShadows in water.js
uniform sampler2D uShadowMask0;
uniform sampler2D uShadowMask1;
uniform sampler2D uShadowMask2;
uniform sampler2D uShadowMask3;
uniform vec4 uShadowArea0;
uniform vec4 uShadowArea1;
uniform vec4 uShadowArea2;
uniform vec4 uShadowArea3;
uniform vec2 uShadowLook0;
uniform vec2 uShadowLook1;
uniform vec2 uShadowLook2;
uniform vec2 uShadowLook3;

// The sailed boat's trail, see wakeUniforms in water.js
uniform float uTime;
uniform sampler2D uWakeField;
uniform vec4 uWakeArea;
uniform vec4 uWakeLook;
uniform vec3 uWakeFoam;
uniform vec3 uWakeAway;
uniform vec3 uWakeToward;
uniform vec3 uWakeLeft;
uniform vec3 uWakeRight;

varying float vElevation;
varying vec3 vWorldPosition;

// Smooth random 0 - 1 across the water, for breaking the foam into flecks
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

// The wake at this bit of water: flow in xy (world x, z), foam in z. Nothing outside the wake's patch
vec3 wakeAt(vec2 world) {
    vec2 uv = (world - uWakeArea.xy) / uWakeArea.z;
    if(uWakeArea.w <= 0.0 || uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return vec3(0.0);
    return texture2D(uWakeField, uv).rgb;
}

// How much one floating thing darkens this bit of water, 0 - 1: its outline as the sun sees it, laid on the water
// and stretched away from the sun. Costs a texture lookup only inside the shadow's own rectangle
float floatShadow(sampler2D mask, vec4 area, vec2 look, vec2 axis) {
    if(look.x <= 0.0) return 0.0;

    vec2 fromFloat = vWorldPosition.xz - area.xy;

    // Across the mask is across the shadow, up the mask is further from the sun
    vec2 uv = vec2(
        dot(fromFloat, vec2(-axis.y, axis.x)) / area.w + 0.5,
        dot(fromFloat, axis) / area.z
    );

    if(uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return 0.0;

    // The blur is the mask's smaller copies (mipmaps), which costs nothing extra. Fainter toward the far end
    return texture2D(mask, uv, look.y).r * (1.0 - 0.5 * uv.y) * look.x;
}

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Sun glitter, normal comes from the displaced surface
    vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
    normal *= sign(normal.y);

    // The boat's wake roughens the water it churned, so the light catches the trail as well as the foam showing
    vec3 wake = wakeAt(vWorldPosition.xz);
    float foam = 0.0;
    if(wake.z > 0.002) {
        float texelStep = uWakeArea.z / 256.0; // the wake is 256 texels across, see Wake.jsx
        vec2 slope = vec2(
            wakeAt(vWorldPosition.xz + vec2(texelStep, 0.0)).z - wakeAt(vWorldPosition.xz - vec2(texelStep, 0.0)).z,
            wakeAt(vWorldPosition.xz + vec2(0.0, texelStep)).z - wakeAt(vWorldPosition.xz - vec2(0.0, texelStep)).z
        );
        vec2 churn = vec2(
            valueNoise(vWorldPosition.xz * 9.0 + uTime * 0.8),
            valueNoise(vWorldPosition.xz * 9.0 - uTime * 0.8 + 17.0)
        ) - 0.5;
        normal.xz += (slope * 2.0 + churn * wake.z) * uWakeLook.z;
        normal = normalize(normal);

        // Foam as lace rather than a smooth smear: thick right by the hull, thinning to streaks and flecks as it
        // fades. The pattern is stretched along the way the water flows, so it swirls out with the wake
        float density = 1.0 - exp(- wake.z * uWakeLook.x);
        vec2 streaked = vWorldPosition.xz - wake.xy * 0.6;
        float lace = valueNoise(streaked * 14.0 + uTime * 0.4) * 0.65 + valueNoise(vWorldPosition.xz * 38.0 - uTime * 0.6) * 0.35;
        float laced = smoothstep(lace - 0.12, lace + 0.12, density * 0.95);
        foam = mix(density, laced, uWakeLook.w) * 0.9;
    }

    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 reflection = reflect(viewDirection, normal);
    float sunReflection = max(dot(reflection, uSunDirection), 0.0);
    color += uSunColor * pow(sunReflection, uShininess) * uGlitterStrength;

    // Second glitter layer. Its light source is the sun stretched sideways along the horizon: at spread 0 it is
    // the sun itself, at 1 a band of light at the sun's height all the way round, so the whole width of water glints
    vec2 sunHeading = normalize(uSunDirection.xz);
    vec2 reflectionHeading = normalize(reflection.xz + vec2(0.00001));
    vec2 bandHeading = normalize(mix(sunHeading, reflectionHeading, uGlitterSpread2) + vec2(0.00001));
    vec3 bandDirection = vec3(bandHeading.x * length(uSunDirection.xz), uSunDirection.y, bandHeading.y * length(uSunDirection.xz));
    float bandReflection = max(dot(reflection, bandDirection), 0.0);
    color += uGlitterColor2 * pow(bandReflection, uShininess2) * uGlitterStrength2;

    // The wake's foam. Like ChromaFlow, its colour can follow the way the water is flowing: away from the camera,
    // toward it, or across the screen to the left or right
    if(wake.z > 0.002) {
        vec2 outward = normalize(vWorldPosition.xz - cameraPosition.xz + vec2(0.00001));
        vec2 rightward = vec2(- outward.y, outward.x);
        float away = dot(wake.xy, outward);
        float across = dot(wake.xy, rightward);
        vec4 weights = vec4(max(away, 0.0), max(- away, 0.0), max(- across, 0.0), max(across, 0.0));
        float total = weights.x + weights.y + weights.z + weights.w;
        vec3 flowColor = total > 0.0001
            ? (uWakeAway * weights.x + uWakeToward * weights.y + uWakeLeft * weights.z + uWakeRight * weights.w) / total
            : uWakeFoam;
        // colour shows most where the water is still moving, the settled foam left behind is plain
        float moving = clamp(total * 2.0, 0.0, 1.0);
        vec3 trailColor = mix(uWakeFoam, flowColor, uWakeLook.y * moving);

        color = mix(color, trailColor, foam);
    }

    // Shadows of whatever is floating. Painted after the glitter so the shaded water does not sparkle
    vec2 shadowAxis = -normalize(uSunDirection.xz + vec2(0.00001));
    color *= 1.0 - floatShadow(uShadowMask0, uShadowArea0, uShadowLook0, shadowAxis);
    color *= 1.0 - floatShadow(uShadowMask1, uShadowArea1, uShadowLook1, shadowAxis);
    color *= 1.0 - floatShadow(uShadowMask2, uShadowArea2, uShadowLook2, shadowAxis);
    color *= 1.0 - floatShadow(uShadowMask3, uShadowArea3, uShadowLook3, shadowAxis);

    // Fade into the horizon so the edge of the plane is never seen
    float fog = smoothstep(uFogNear, uFogFar, distance(cameraPosition, vWorldPosition));
    color = mix(color, uHorizonColor, fog);

    gl_FragColor = vec4(color, 1.0);
}
