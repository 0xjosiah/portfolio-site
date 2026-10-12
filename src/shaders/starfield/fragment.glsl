uniform float uFade;

varying vec3 vColor;

void main() {
    float opacity = 1.0;

    // Soft round disc rather than a hard square
    if(uFade == 1.0) {
        float d = distance(gl_PointCoord, vec2(0.5, 0.5));
        opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
    }

    gl_FragColor = vec4(vColor, opacity);

    #include <tonemapping_fragment>
    #include <encodings_fragment>
}
