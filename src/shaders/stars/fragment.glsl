varying vec3 vColor;
varying float vAlpha;

void main() {
    // Bright point in the middle falling off to nothing at the edge of the square, no texture needed
    float strength = 1.0 - min(distance(gl_PointCoord, vec2(0.5)) * 2.0, 1.0);
    strength = pow(strength, 3.0);

    gl_FragColor = vec4(vColor, strength * vAlpha);
}
