import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Loader2, CheckCircle2 } from 'lucide-react';
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
  const handMarkerRef = useRef<THREE.Mesh | null>(null);
  const handHaloRef = useRef<THREE.Mesh | null>(null);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const fingerRef = useRef(finger);
  fingerRef.current = finger;

  const motionRef = useRef(motion);
  motionRef.current = motion;

  const isAlarmRef = useRef(isAlarmActive);
  isAlarmRef.current = isAlarmActive;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera framed so head, chest, and hands fill the view with zero wasted space
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.06, 3.7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Balanced Clinical Lighting: soft ambient + medical cyan/emerald highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.5);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 1.2);
    fillLight.position.set(0, 3, -4);
    scene.add(fillLight);

    // Master Anatomy Group - Centered and stable (No rolling)
    const anatomyGroup = new THREE.Group();
    anatomyGroup.position.set(0, 0, 0);
    anatomyGroup.rotation.set(0.02, 0, 0);
    anatomyGroupRef.current = anatomyGroup;
    scene.add(anatomyGroup);

    // 1. SENSOR 1: BLUE DOT ON THE HAND (MAX30102 - Optical Finger Pulse)
    // Placed precisely on the hand/fingertip of the model
    const handGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const handMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 }); // Luminous Cyan/Blue
    const handMesh = new THREE.Mesh(handGeo, handMat);
    handMesh.position.set(-0.62, -0.34, 0.18);
    handMarkerRef.current = handMesh;
    anatomyGroup.add(handMesh);

    const handHaloGeo = new THREE.RingGeometry(0.08, 0.14, 24);
    const handHaloMat = new THREE.MeshBasicMaterial({ 
      color: 0x38bdf8, // Pulsing Azure/Blue Halo
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.85 
    });
    const handHalo = new THREE.Mesh(handHaloGeo, handHaloMat);
    handHalo.position.set(-0.62, -0.34, 0.19);
    handHaloRef.current = handHalo;
    anatomyGroup.add(handHalo);

    // 2. SENSOR 2: RED/ROSE DOT ON THE STERNUM (MPU6050 - Thoracic Fall/Shock)
    // Placed precisely on the sternum of the model
    const sternumGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const sternumMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e }); // Rose/Red
    const sternumMesh = new THREE.Mesh(sternumGeo, sternumMat);
    sternumMesh.position.set(0, 0.28, 0.35);
    sternumMarkerRef.current = sternumMesh;
    anatomyGroup.add(sternumMesh);

    const sternumHaloGeo = new THREE.RingGeometry(0.09, 0.15, 24);
    const sternumHaloMat = new THREE.MeshBasicMaterial({ 
      color: 0xfb7185, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.8 
    });
    const sternumHalo = new THREE.Mesh(sternumHaloGeo, sternumHaloMat);
    sternumHalo.position.set(0, 0.28, 0.36);
    sternumHaloRef.current = sternumHalo;
    anatomyGroup.add(sternumHalo);

    let isCancelled = false;

    getOrLoadAnatomyModel()
      .then((masterGltf) => {
        if (isCancelled || !anatomyGroupRef.current) return;
        setIsLoading(false);

        const { model } = createModelInstance(masterGltf);

        // Strip raw-meat polypaint vertex colors and apply sleek holographic cyan medical shader
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) {
              mesh.geometry.deleteAttribute('color');
              mesh.geometry.deleteAttribute('COLOR_0');
            }
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8, // Luminous medical cyan
              emissive: 0x0369a1, // Subsurface biological cyan glow
              emissiveIntensity: 0.35,
              roughness: 0.25,
              metalness: 0.2,
              transparent: true,
              opacity: 0.88,
            });
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

    // Render & Animation Loop (Fixed stable posture, no rolling)
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const currentBpm = bpmRef.current;
      const currentFinger = fingerRef.current;
      const currentMotion = motionRef.current;

      // Animate Blue Hand Marker (MAX30102) Halo in sync with cardiac rhythm
      if (handHaloRef.current) {
        if (currentFinger && currentBpm > 0) {
          const cardiacPeriod = 60 / currentBpm;
          const pulsePhase = (elapsed % cardiacPeriod) / cardiacPeriod;
          const pulseScale = 1.0 + Math.sin(pulsePhase * Math.PI) * 0.45;
          handHaloRef.current.scale.set(pulseScale, pulseScale, 1);
          handHaloRef.current.visible = true;
        } else {
          handHaloRef.current.visible = true;
          handHaloRef.current.scale.set(1.0, 1.0, 1);
        }
      }

      // Animate Sternum MPU6050 Halo
      if (sternumHaloRef.current) {
        const sternumScale = 1.0 + Math.sin(elapsed * 4) * 0.22;
        sternumHaloRef.current.scale.set(sternumScale, sternumScale, 1);
        if (currentMotion >= 2.5) {
          (sternumHaloRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
        } else {
          (sternumHaloRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xfb7185);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

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
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-[#040814] to-[#02050c] border border-cyan-500/20 shadow-inner flex items-center justify-center select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full pointer-events-none" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-2">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-[10px] font-mono text-cyan-300 tracking-wider">CHARGEMENT ANATOMIE 3D...</span>
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
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>3D CARTOGRAPHIE</span>
        </span>

        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>2 NŒUDS I2C</span>
        </span>
      </div>
    </div>
  );
};
