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

varying float vElevation;
varying vec3 vWorldPosition;

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
