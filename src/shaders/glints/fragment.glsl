uniform float uRays;

varying vec3 vColor;
varying float vAlpha;

void main() {
    // -1 to 1 across the point
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float falloff = 1.0 - min(length(uv), 1.0);

    // Bright point in the middle
    float strength = pow(falloff, 3.0);

    // Four thin rays along the axes, which is what makes it read as a star rather than a dot
    float rays = smoothstep(0.06, 0.0, abs(uv.x * uv.y)) * falloff * falloff;
    strength = min(strength + rays * uRays, 1.0);

    gl_FragColor = vec4(vColor, strength * vAlpha);
}
