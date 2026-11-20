import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Wind, Loader2, RotateCw } from 'lucide-react';
import { 
  getOrLoadLungsModel, 
  createModelInstance, 
  isLungsModelCached 
} from '../../utils/modelCache';

interface Lungs3DCanvasProps {
  resp: number;
  finger: boolean;
  isAlarmActive?: boolean;
}

export const Lungs3DCanvas: React.FC<Lungs3DCanvasProps> = ({
  resp,
  finger,
  isAlarmActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(() => !isLungsModelCached());
  const [hasError, setHasError] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'INSP' | 'EXP'>('EXP');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lungsGroupRef = useRef<THREE.Group | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const respRef = useRef(resp);
  respRef.current = resp;

  const isAlarmRef = useRef(isAlarmActive);
  isAlarmRef.current = isAlarmActive;

  const fingerRef = useRef(finger);
  fingerRef.current = finger;

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const userRotationRef = useRef({ x: 0.05, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Studio Lighting for Biological Tissue
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.6);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0284c7, 2.0);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(0x38bdf8, 1.8, 6);
    coreLight.position.set(0, 0, 0.5);
    coreLightRef.current = coreLight;
    scene.add(coreLight);

    // Lungs Group container
    const lungsGroup = new THREE.Group();
    lungsGroupRef.current = lungsGroup;
    scene.add(lungsGroup);

    let isCancelled = false;

    getOrLoadLungsModel()
      .then((masterGltf) => {
        if (isCancelled || !lungsGroupRef.current) return;
        setIsLoading(false);

        const { model } = createModelInstance(masterGltf);

        // Enhance material appearance for holographic medical feel
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.35;
              mat.metalness = 0.15;
            }
          }
        });

        lungsGroup.add(model);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to load lungs 3D model:', err);
        setIsLoading(false);
        setHasError(true);
      });

    // Render & Dynamic Respiration Animation Loop
    const clock = new THREE.Clock();
    let lastPhaseUpdate = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentResp = respRef.current;
      const currentAlarm = isAlarmRef.current;

      if (lungsGroupRef.current) {
        // Apply user drag rotation + gentle idle breathing sway
        if (!isDraggingRef.current) {
          userRotationRef.current.y += delta * 0.2;
        }
        lungsGroupRef.current.rotation.y = userRotationRef.current.y;
        lungsGroupRef.current.rotation.x = userRotationRef.current.x;

        // Dynamic volumetric breathing expansion/contraction
        if (currentResp > 0) {
          const cycleDuration = 60 / currentResp; // seconds per breath
          const t = (elapsed % cycleDuration) / cycleDuration; // 0.0 to 1.0

          let breathFactor = 0;
          let currentPhase: 'INSP' | 'EXP' = 'EXP';

          if (t < 0.4) {
            // Inspiration (40% of cycle, active expansion)
            breathFactor = Math.sin((t / 0.4) * (Math.PI / 2));
            currentPhase = 'INSP';
          } else {
            // Expiration (60% of cycle, passive recoil)
            breathFactor = Math.cos(((t - 0.4) / 0.6) * (Math.PI / 2));
            currentPhase = 'EXP';
          }

          // Throttle React state update to avoid re-renders
          if (elapsed - lastPhaseUpdate > 0.2) {
            lastPhaseUpdate = elapsed;
            setBreathPhase(currentPhase);
          }

          const scaleFactor = 1.0 + breathFactor * 0.13;
          lungsGroupRef.current.scale.set(
            scaleFactor,
            scaleFactor * 1.04,
            scaleFactor * 1.08
          );

          if (coreLightRef.current) {
            coreLightRef.current.intensity = 1.5 + breathFactor * 1.8;
          }
        } else {
          lungsGroupRef.current.scale.set(1, 1, 1);
        }
      }

      if (coreLightRef.current && currentAlarm) {
        coreLightRef.current.color.setHex(0xf43f5e);
      } else if (coreLightRef.current) {
        coreLightRef.current.color.setHex(0x38bdf8);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse drag handlers for 3D rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      userRotationRef.current.y += dx * 0.01;
      userRotationRef.current.x = Math.max(-0.4, Math.min(0.4, userRotationRef.current.x + dy * 0.01));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isCancelled = true;
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-[#040814] to-[#02050c] border border-cyan-500/20 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing select-none group">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-[10px] font-mono text-cyan-300 tracking-wider">CHARGEMENT POUMONS 3D...</span>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-400">
          Visualisation 3D non disponible
        </div>
      )}

      {/* Top HUD Badges */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono">
        <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold flex items-center gap-1 shadow-sm">
          <Wind className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>3D VOLUMÉTRIQUE</span>
        </span>

        <span className={`px-2 py-0.5 rounded-md border font-bold transition-all ${
          breathPhase === 'INSP' 
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20' 
            : 'bg-slate-900/80 text-slate-400 border-slate-700'
        }`}>
          {breathPhase === 'INSP' ? 'INSPIRATION' : 'EXPIRATION'}
        </span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="text-[9px] font-mono text-slate-300/80 bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <RotateCw className="w-2.5 h-2.5" />
          <span>Glisser pour pivoter en 3D</span>
        </span>
      </div>
    </div>
  );
};
