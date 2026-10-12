uniform vec3 uSunDirection;
uniform vec3 uZenithColor;
uniform vec3 uMidColor;
uniform vec3 uHorizonColor;
uniform vec3 uSunColor;
uniform vec3 uSunDiscColor;
uniform float uSunSize;
uniform float uGlowStrength;
uniform float uHazeStrength;
uniform float uHazeFalloff;
uniform vec2 uHorizonBlend;
uniform vec2 uMidBlend;

varying vec3 vWorldPosition;

void main() {
    vec3 direction = normalize(vWorldPosition - cameraPosition);
    float height = direction.y;
    float sunAmount = max(dot(direction, uSunDirection), 0.0);

    // Gradient, horizon -> mid -> zenith. Each blend is a (start, end) pair of heights
    vec3 color = mix(uHorizonColor, uMidColor, smoothstep(uHorizonBlend.x, uHorizonBlend.y, height));
    color = mix(color, uZenithColor, smoothstep(uMidBlend.x, uMidBlend.y, height));

    // Haze band hugging the horizon
    color = mix(color, uHorizonColor, exp(-abs(height) * uHazeFalloff) * uHazeStrength);

    // Sun glow, wide bloom + tight halo
    color += uSunColor * pow(sunAmount, 6.0) * 0.3 * uGlowStrength;
    color += uSunColor * pow(sunAmount, 90.0) * 0.55 * uGlowStrength;

    // Sun disc
    float disc = smoothstep(cos(uSunSize), cos(uSunSize * 0.8), dot(direction, uSunDirection));
    color = mix(color, uSunDiscColor, disc);

    // Below the horizon, matches the colour the ocean fades to
    color = mix(color, uHorizonColor, 1.0 - smoothstep(-0.06, 0.0, height));

    gl_FragColor = vec4(color, 1.0);
}
