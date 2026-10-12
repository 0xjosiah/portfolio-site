#include ../ocean/waves.glsl;

uniform float uWaterLevel;
uniform vec2 uFlow;
uniform vec2 uNorth;
uniform vec2 uEast;

// x: nearest, y: furthest distance from the camera, z: reach either side of the view, w: distance faded out over
uniform vec4 uArea;

uniform float uSize;
uniform float uSizeVariation;
uniform float uPixelRatio;
uniform float uBrightness;
uniform float uTwinkle;
uniform float uTwinkleSpeed;
uniform float uLift;
uniform vec3 uColorA;
uniform vec3 uColorB;

// x: size, y: colour mix, z: twinkle timing. Each 0 - 1
attribute vec3 aRandom;

varying vec3 vColor;
varying float vAlpha;

void main() {
    float depth = uArea.y - uArea.x;
    float width = uArea.z * 2.0;

    // position.x runs 0 - 1 across the area and position.z 0 - 1 from near to far. Sparkles are carried along with
    // the water and come back in on the opposite side when they leave the area
    float across = mod(position.x * width + dot(uFlow, uEast), width) - uArea.z;
    float away = uArea.x + mod(position.z * depth + dot(uFlow, uNorth), depth);

    // The camera is the world origin, so the area is measured straight out from it
    vec4 modelPosition = vec4(0.0, uWaterLevel, 0.0, 1.0);
    modelPosition.xz = uNorth * away + uEast * across;

    // Sits on the waves, raised a touch so the water does not cut the sparkle in half
    modelPosition.y += waveElevation(modelPosition.xz - uWaveOrigin) + uLift;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Nearer sparkles are larger. uSize is the size in pixels 3 units away, capped so the closest do not balloon
    gl_PointSize = uSize * mix(1.0, aRandom.x, uSizeVariation) * uPixelRatio * min(3.0 / -viewPosition.z, 3.0);

    // Fades out at the far end, and briefly at the near end, so nothing pops in or out where it wraps round
    float fade = (1.0 - smoothstep(uArea.y - uArea.w, uArea.y, away)) * smoothstep(uArea.x, uArea.x + 0.3, away);

    // Sharper than the stars' twinkle: mostly dark with short flashes, the way light catches moving water
    float pulse = sin(uTime * uTwinkleSpeed * (0.5 + aRandom.z) + aRandom.z * 6.2831853) * 0.5 + 0.5;
    float flash = mix(1.0, pow(pulse, 4.0), uTwinkle);

    // Varyings
    vColor = mix(uColorA, uColorB, aRandom.y);
    vAlpha = uBrightness * fade * flash;
}
