uniform float uTime;
uniform float uSize;
uniform float uSizeVariation;
uniform float uPixelRatio;
uniform float uBrightness;
uniform float uTwinkle;
uniform float uTwinkleSpeed;
uniform float uFadeStart;
uniform float uFadeEnd;
uniform vec3 uColorA;
uniform vec3 uColorB;

// x: size, y: colour mix, z: twinkle timing. Each 0 - 1
attribute vec3 aRandom;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Stars sit on the sky dome, all the same distance away, so there is no shrinking with distance
    gl_PointSize = uSize * mix(1.0, aRandom.x, uSizeVariation) * uPixelRatio;

    // Fades in with height, so the lowest stars melt into the sunset rather than stopping at a line
    float height = normalize(modelPosition.xyz - cameraPosition).y;
    float fade = smoothstep(uFadeStart, uFadeEnd, height);

    // Each star dims and recovers on its own rhythm
    float pulse = sin(uTime * uTwinkleSpeed * (0.5 + aRandom.z) + aRandom.z * 6.2831853) * 0.5 + 0.5;

    // Varyings
    vColor = mix(uColorA, uColorB, aRandom.y);
    vAlpha = uBrightness * fade * (1.0 - uTwinkle * pulse);
}
