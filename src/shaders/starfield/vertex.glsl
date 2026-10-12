uniform float uTime;
uniform float uBlink;

attribute float size;

// 0 - 1, different for every star so they do not all pulse together
attribute float aPhase;

varying vec3 vColor;

void main() {
    vColor = color;

    // Same maths as drei's starfield, w of 0.5 included: it draws each star at twice its distance, which is what
    // gives that look its sizes and its spread across the view
    vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);

    // drei pulses every star on one shared clock. Here each has its own rhythm and starting point
    float pulse = sin(uTime * (0.5 + aPhase) + aPhase * 6.2831853);

    gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + pulse * uBlink);
    gl_Position = projectionMatrix * mvPosition;
}
