#include waves.glsl;

varying float vElevation;
varying vec3 vWorldPosition;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Elevation
    float elevation = waveElevation(modelPosition.xz - uWaveOrigin);

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
    vWorldPosition = modelPosition.xyz;
}