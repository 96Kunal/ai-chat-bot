import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

interface ParticleSwarmBackgroundProps {
  isInteractive?: boolean;
}

export const ParticleSwarmBackground: React.FC<ParticleSwarmBackgroundProps> = ({
  isInteractive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [opacityLevel, setOpacityLevel] = useState<number>(0.22); // subtle, high-contrast ambient backdrop

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // CONFIG
    const COUNT = window.innerWidth < 768 ? 5000 : 9000;
    const SPEED_MULT = 1;
    const AUTO_SPIN = true;

    // SCENE & CAMERA
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 110);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Pure transparent clear
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = AUTO_SPIN;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = isFullscreen;
    controls.enablePan = isFullscreen;

    // POST PROCESSING (BLOOM)
    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      renderPass.clearAlpha = 0;
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.3,
        0.4,
        0.85
      );
      bloomPass.strength = 1.4;
      bloomPass.radius = 0.4;
      bloomPass.threshold = 0.05;
      composer.addPass(bloomPass);
    } catch (e) {
      console.warn('Bloom pass fallback', e);
    }

    // SWARM OBJECTS & SHADER
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const target = new THREE.Vector3();

    const geometry = new THREE.SphereGeometry(0.35, 12, 12);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vColor;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vColor = instanceColor;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vColor;
        void main() {
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float metallic = dot(vNormal, viewDir) * 0.5 + 0.5;
          metallic = pow(metallic, 3.0);
          vec3 col = mix(vec3(0.1), vColor, 0.65) * metallic + vec3(0.18);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      transparent: true,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // DATA ARRAYS
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      positions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120
        )
      );
      color.setHex(0x4285f4);
      instancedMesh.setColorAt(i, color);
    }

    // PARAMS
    const speed = 0.35;
    const chaos = 16.0;
    const coreSize = 12.0;

    // ANIMATION LOOP
    const startTime = performance.now();
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const time = ((performance.now() - startTime) * 0.001) * SPEED_MULT;

      if (material.uniforms && material.uniforms.uTime) {
        material.uniforms.uTime.value = time;
      }

      controls.update();

      // SWARM CONVERGENCE LOGIC
      for (let i = 0; i < COUNT; i++) {
        // 1. Progression towards core
        const norm = i / COUNT;
        const progress = (norm + time * speed * 0.2) % 1.0;
        const easeProgress = Math.pow(progress, 1.5);

        // 2. Fibonacci sphere distribution
        const goldenRatio = (1.0 + Math.sqrt(5.0)) / 2.0;
        const theta = (2.0 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1.0 - 2.0 * norm);

        // 3. Radius
        const currentRadius = coreSize + 140.0 * (1.0 - easeProgress);

        // 4. Instability noise
        const instability = Math.pow(1.0 - progress, 2.0);
        const wobbleX = Math.sin(time * 2.0 + norm * 100.0) * chaos * instability;
        const wobbleY = Math.cos(time * 1.5 + norm * 200.0) * chaos * instability;
        const wobbleZ = Math.sin(time * 3.0 - norm * 300.0) * chaos * instability;

        // 5. Assemble position
        const sinPhi = Math.sin(phi);
        const x = currentRadius * sinPhi * Math.cos(theta) + wobbleX;
        const y = currentRadius * sinPhi * Math.sin(theta) + wobbleY;
        const z = currentRadius * Math.cos(phi) + wobbleZ;

        target.set(x, y, z);

        // 6. Color mapping: Outer = Cool Blue (~0.58), Core = Crimson / Violet (~0.95)
        const hue = 0.58 + 0.38 * progress;
        const saturation = 0.85 + 0.15 * progress;
        const corePulse = progress > 0.95 ? Math.sin(time * 10.0) * 0.35 : 0.0;
        const lightness = 0.25 + 0.55 * progress + corePulse;

        color.setHSL(hue % 1.0, saturation, Math.max(0.0, Math.min(1.0, lightness)));

        // Lerp update
        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isFullscreen]);

  return (
    <>
      {/* 3D Canvas Container - strictly behind all UI */}
      <div
        ref={containerRef}
        className={`fixed inset-0 transition-opacity duration-700 pointer-events-none ${
          isFullscreen
            ? 'pointer-events-auto z-50 bg-[#131314]'
            : 'z-0'
        }`}
        style={{ opacity: isFullscreen ? 1 : opacityLevel }}
      />

      {/* Floating Animation Controls in bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-[#1e1f20]/95 backdrop-blur-md border border-[#333538] shadow-2xl text-xs">
        <button
          onClick={() => setOpacityLevel((prev) => (prev > 0 ? 0 : 0.22))}
          className={`p-2 rounded-full transition-colors ${
            opacityLevel > 0
              ? 'text-[#4285f4] hover:bg-[#282a2c]'
              : 'text-[#8e918f] hover:text-[#e3e3e3] hover:bg-[#282a2c]'
          }`}
          title={opacityLevel > 0 ? 'Hide particle swarm' : 'Show particle swarm'}
        >
          {opacityLevel > 0 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-full text-[#e3e3e3] hover:bg-[#282a2c] transition-colors flex items-center gap-1"
          title={isFullscreen ? 'Exit 3D particle mode' : 'Interactive 3D particle view'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#ea4335]" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[10px] font-medium pr-1">
            {isFullscreen ? 'Close 3D View' : '3D Swarm'}
          </span>
        </button>
      </div>
    </>
  );
};
