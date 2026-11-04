varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // Varyings: x runs left to right across the patch, y from its lowest edge to its highest
    vUv = uv;
}
