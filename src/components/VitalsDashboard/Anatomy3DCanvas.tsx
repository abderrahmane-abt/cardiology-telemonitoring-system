import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Loader2, RotateCw, CheckCircle2 } from 'lucide-react';
import { 
  getOrLoadAnatomyModel, 
  createModelInstance, 
  isAnatomyModelCached 
} from '../../utils/modelCache';

interface Anatomy3DCanvasProps {
  bpm: number;
  finger: boolean;
  motion: number;
  isAlarmActive?: boolean;
}

export const Anatomy3DCanvas: React.FC<Anatomy3DCanvasProps> = ({
  bpm,
  finger,
  motion,
  isAlarmActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(() => !isAnatomyModelCached());
  const [hasError, setHasError] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const anatomyGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // 3D sensor markers
  const sternumMarkerRef = useRef<THREE.Mesh | null>(null);
  const sternumHaloRef = useRef<THREE.Mesh | null>(null);
  const fingerMarkerRef = useRef<THREE.Mesh | null>(null);
  const fingerHaloRef = useRef<THREE.Mesh | null>(null);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const fingerRef = useRef(finger);
  fingerRef.current = finger;

  const motionRef = useRef(motion);
  motionRef.current = motion;

  const isAlarmRef = useRef(isAlarmActive);
  isAlarmRef.current = isAlarmActive;

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const userRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Studio Lighting for High-Tech Holographic Anatomy
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.8);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    const backLight = new THREE.DirectionalLight(0x6366f1, 1.5);
    backLight.position.set(0, 4, -4);
    scene.add(backLight);

    // Master Anatomy Group
    const anatomyGroup = new THREE.Group();
    anatomyGroupRef.current = anatomyGroup;
    scene.add(anatomyGroup);

    // Create 3D Sensor Node Markers
    // 1. Sternum Marker (MPU6050)
    const sternumGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const sternumMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const sternumMesh = new THREE.Mesh(sternumGeo, sternumMat);
    sternumMesh.position.set(0, 0.45, 0.35);
    sternumMarkerRef.current = sternumMesh;
    anatomyGroup.add(sternumMesh);

    const sternumHaloGeo = new THREE.RingGeometry(0.09, 0.14, 24);
    const sternumHaloMat = new THREE.MeshBasicMaterial({ 
      color: 0x38bdf8, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.7 
    });
    const sternumHalo = new THREE.Mesh(sternumHaloGeo, sternumHaloMat);
    sternumHalo.position.set(0, 0.45, 0.36);
    sternumHaloRef.current = sternumHalo;
    anatomyGroup.add(sternumHalo);

    // 2. Left Finger Marker (MAX30102)
    const fingerGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const fingerMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const fingerMesh = new THREE.Mesh(fingerGeo, fingerMat);
    fingerMesh.position.set(-0.85, -0.35, 0.1);
    fingerMarkerRef.current = fingerMesh;
    anatomyGroup.add(fingerMesh);

    const fingerHaloGeo = new THREE.RingGeometry(0.08, 0.13, 24);
    const fingerHaloMat = new THREE.MeshBasicMaterial({ 
      color: 0xfb7185, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.7 
    });
    const fingerHalo = new THREE.Mesh(fingerHaloGeo, fingerHaloMat);
    fingerHalo.position.set(-0.85, -0.35, 0.11);
    fingerHaloRef.current = fingerHalo;
    anatomyGroup.add(fingerHalo);

    let isCancelled = false;

    getOrLoadAnatomyModel()
      .then((masterGltf) => {
        if (isCancelled || !anatomyGroupRef.current) return;
        setIsLoading(false);

        const { model } = createModelInstance(masterGltf);

        // Adjust materials for translucent medical cyber-contour
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.4;
              mat.metalness = 0.2;
            }
          }
        });

        anatomyGroup.add(model);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to load anatomy 3D model:', err);
        setIsLoading(false);
        setHasError(true);
      });

    // Render & Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentBpm = bpmRef.current;
      const currentFinger = fingerRef.current;
      const currentMotion = motionRef.current;

      if (anatomyGroupRef.current) {
        // Continuous turntable rotation unless user is dragging
        if (!isDraggingRef.current) {
          userRotationRef.current.y += delta * 0.22;
        }
        anatomyGroupRef.current.rotation.y = userRotationRef.current.y;
        anatomyGroupRef.current.rotation.x = userRotationRef.current.x;

        // Animate Sternum MPU6050 Halo
        if (sternumHaloRef.current) {
          const sternumScale = 1.0 + Math.sin(elapsed * 4) * 0.25;
          sternumHaloRef.current.scale.set(sternumScale, sternumScale, 1);
          if (currentMotion >= 2.5) {
            (sternumHaloRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
          } else {
            (sternumHaloRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
          }
        }

        // Animate Finger MAX30102 Halo in sync with cardiac rhythm
        if (fingerHaloRef.current) {
          if (currentFinger && currentBpm > 0) {
            const cardiacPeriod = 60 / currentBpm;
            const pulsePhase = (elapsed % cardiacPeriod) / cardiacPeriod;
            const pulseScale = 1.0 + Math.sin(pulsePhase * Math.PI) * 0.5;
            fingerHaloRef.current.scale.set(pulseScale, pulseScale, 1);
            fingerHaloRef.current.visible = true;
          } else {
            fingerHaloRef.current.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse drag handlers for 360 degree rotation
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
      userRotationRef.current.x = Math.max(-0.35, Math.min(0.35, userRotationRef.current.x + dy * 0.01));
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
    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-[#040814] to-[#02050c] border border-emerald-500/20 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing select-none group">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-[10px] font-mono text-emerald-300 tracking-wider">CHARGEMENT ANATOMIE 3D...</span>
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
        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1 shadow-sm">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>3D CARTOGRAPHIE</span>
        </span>

        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>2 NŒUDS I2C</span>
        </span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="text-[9px] font-mono text-slate-300/80 bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <RotateCw className="w-2.5 h-2.5" />
          <span>Glisser pour pivoter en 3D à 360°</span>
        </span>
      </div>
    </div>
  );
};
