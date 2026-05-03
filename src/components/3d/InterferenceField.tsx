import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getInterferenceEmitters, INTERFERENCE_EMITTER_COUNT } from "../../lib/frequency-map";

interface InterferenceFieldProps {
  hue?: number;
  speed?: number;
  complexity?: number;
  frequency?: number;
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  #define EMITTER_COUNT ${INTERFERENCE_EMITTER_COUNT}

  uniform float uTime;
  uniform float uSpeed;
  uniform float uComplexity;
  uniform float uFrequency;
  uniform float uHue;
  uniform vec3 uEmitterPositions[EMITTER_COUNT];
  uniform float uEmitterAmplitudes[EMITTER_COUNT];
  uniform float uEmitterFalloffs[EMITTER_COUNT];
  uniform float uEmitterFrequencies[EMITTER_COUNT];

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  vec3 spectralMap(float x) {
    vec3 voidBlue = vec3(0.01, 0.03, 0.08);
    vec3 navy = vec3(0.03, 0.11, 0.30);
    vec3 electricBlue = vec3(0.08, 0.55, 0.96);
    vec3 cyan = vec3(0.24, 0.94, 0.98);
    vec3 ice = vec3(0.86, 0.98, 1.00);

    if (x < 0.18) return mix(voidBlue, navy, x / 0.18);
    if (x < 0.46) return mix(navy, electricBlue, (x - 0.18) / 0.28);
    if (x < 0.72) return mix(electricBlue, cyan, (x - 0.46) / 0.26);
    return mix(cyan, ice, (x - 0.72) / 0.28);
  }

  vec3 applyHueAccent(vec3 color, float hue) {
    float accent = clamp((sin(radians(hue)) + 1.0) * 0.5, 0.0, 1.0);
    vec3 teal = vec3(0.06, 0.95, 0.83);
    vec3 violet = vec3(0.62, 0.38, 1.0);
    vec3 accentColor = mix(violet, teal, accent);
    return mix(color, accentColor, 0.08);
  }

  void main() {
    vec3 rayDir = normalize(vWorldPosition - cameraPosition);
    float intensity = 0.0;
    float coherence = 0.0;

    for (int sampleIndex = 0; sampleIndex < 4; sampleIndex++) {
      float depth = 4.0 + float(sampleIndex) * (2.2 + uComplexity * 0.8);
      vec3 samplePoint = rayDir * depth;

      for (int i = 0; i < EMITTER_COUNT; i++) {
        vec3 delta = samplePoint - uEmitterPositions[i];
        float dist = length(delta);
        float falloff = exp(-uEmitterFalloffs[i] * dist * dist * 0.07);
        float wave = sin(uTime * uEmitterFrequencies[i] - dist * (0.85 + float(i) * 0.035));
        float contribution = uEmitterAmplitudes[i] * (0.5 + 0.5 * wave) * falloff;
        intensity += contribution;
        coherence += uEmitterAmplitudes[i] * abs(cos(uTime * uEmitterFrequencies[i] - dist * 0.55)) * falloff;
      }
    }

    intensity /= 4.0;
    coherence /= 4.0;

    float centerGlow = exp(-pow(length(rayDir.xy) * 1.55, 2.0));
    float vignette = smoothstep(1.12, 0.15, length(vUv - 0.5));
    float shellMask = smoothstep(0.04, 0.82, intensity * 0.74 + centerGlow * 0.18);
    float highlight = pow(clamp(coherence, 0.0, 1.0), 4.1) * 0.48;
    float normalized = clamp(intensity * 0.62 + centerGlow * 0.12 + highlight * 0.26, 0.0, 1.0);

    vec3 color = spectralMap(normalized);
    color = applyHueAccent(color, uHue);
    color += vec3(0.92, 0.98, 1.0) * highlight * (0.22 + centerGlow * 0.14);

    float alpha = clamp(shellMask * vignette * 0.28 + centerGlow * 0.06, 0.0, 0.34);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function InterferenceField({
  hue = 170,
  speed = 1.0,
  complexity = 1.0,
  frequency = 1.0,
}: InterferenceFieldProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uComplexity: { value: complexity },
          uFrequency: { value: frequency },
          uHue: { value: hue },
          uEmitterPositions: { value: Array.from({ length: INTERFERENCE_EMITTER_COUNT }, () => new THREE.Vector3()) },
          uEmitterAmplitudes: { value: new Float32Array(INTERFERENCE_EMITTER_COUNT) },
          uEmitterFalloffs: { value: new Float32Array(INTERFERENCE_EMITTER_COUNT) },
          uEmitterFrequencies: { value: new Float32Array(INTERFERENCE_EMITTER_COUNT) },
        },
        vertexShader,
        fragmentShader,
      }),
    []
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const emitters = getInterferenceEmitters(time * Math.max(speed, 0.4), frequency, complexity);
    const positions = material.uniforms.uEmitterPositions.value as THREE.Vector3[];
    const amplitudes = material.uniforms.uEmitterAmplitudes.value as Float32Array;
    const falloffs = material.uniforms.uEmitterFalloffs.value as Float32Array;
    const frequencies = material.uniforms.uEmitterFrequencies.value as Float32Array;

    material.uniforms.uTime.value = time * (0.55 + speed * 0.25);
    material.uniforms.uSpeed.value = speed;
    material.uniforms.uComplexity.value = complexity;
    material.uniforms.uFrequency.value = frequency;
    material.uniforms.uHue.value = hue;

    emitters.forEach((emitter, index) => {
      positions[index].set(...emitter.position);
      amplitudes[index] = emitter.amplitude;
      falloffs[index] = emitter.falloff;
      frequencies[index] = emitter.visualFrequency;
    });
  });

  return (
    <mesh>
      <sphereGeometry args={[24, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
