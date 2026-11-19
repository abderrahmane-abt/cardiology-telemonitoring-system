import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Loader2 } from 'lucide-react';
import type { VitalSigns } from '../../types/medical';
import { UI_STYLES } from '../../types/themeStyles';
import type { UIStyleId } from '../../types/themeStyles';
import { 
  getOrLoadHeartModel, 
  createHeartInstance, 
  isHeartModelCached 
} from '../../utils/modelCache';

interface Heart3DCanvasProps {
  vitals: VitalSigns;
  isAlarmActive: boolean;
  theme?: 'light' | 'dark';
  currentStyle?: UIStyleId;
  hideOverlayCards?: boolean;
}

export const Heart3DCanvas: React.FC<Heart3DCanvasProps> = ({
  vitals,
  isAlarmActive,
  currentStyle = 'MEDICARE_LIGHT',
  hideOverlayCards = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(() => !isHeartModelCached());
  const [loadError, setLoadError] = useState<string | null>(null);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.MEDICARE_LIGHT;
  const isLight = styleConfig.themeMode === 'light';

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const bpm = vitals.finger && vitals.bpm > 0 ? vitals.bpm : 0;

  // Mutable refs to prevent rebuilding scene on state changes
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const isAlarmRef = useRef(isAlarmActive);
  isAlarmRef.current = isAlarmActive;

  // MOUNT ONCE: Persistent Scene, Camera, Renderer and GLB Loader ONLY
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0.05, 4.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf43f5e, 1.5);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(0xff1e38, 2.5, 7);
    coreLight.position.set(0, 0, 0.2);
    coreLightRef.current = coreLight;
    scene.add(coreLight);

    // Heart Group container
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // Stabilized Anatomical Orientation (Fixed View - No rotation)
    heartGroup.position.set(0, -0.05, 0);
    heartGroup.rotation.y = 0.25;
    heartGroup.rotation.z = -0.12;
    heartGroup.rotation.x = 0.08;

    // --- HIGH SPEED CACHED GLTF MODEL LOADER (Cache API + Memory Singleton) ---
    let isCancelled = false;
    let mixer: THREE.AnimationMixer | null = null;

    getOrLoadHeartModel()
      .then((masterGltf) => {
        if (isCancelled || !heartGroupRef.current) return;
        setIsLoadingModel(false);

        const { model, animations } = createHeartInstance(masterGltf);
        heartGroup.add(model);

        // Bind Skeletal animation clip
        if (animations && animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const clip = animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to load cached 3D heart model:', err);
        setIsLoadingModel(false);
        setLoadError('Modèle 3D introuvable dans public/models/heart.glb');
      });

    // Animation Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentBpm = bpmRef.current;
      const currentAlarm = isAlarmRef.current;

      // Update native skeletal animation speed in sync with live BPM
      if (mixer) {
        if (currentBpm > 0) {
          mixer.timeScale = currentBpm / 60;
          mixer.update(delta);
        } else {
          mixer.timeScale = 0;
        }
      }

      // Alarm glow effect
      if (coreLightRef.current) {
        const alarmBoost = currentAlarm ? 3.0 : 1.0;
        coreLightRef.current.intensity = 2.2 * alarmBoost;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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

    // Cleanup on unmount
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
    <div className={`relative w-full h-full min-h-[340px] flex items-center justify-center rounded-3xl overflow-hidden transition-all duration-300 ${
      hideOverlayCards ? '' : `${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`
    }`}>
      {/* Dynamic Ambient Radial Glow behind the Heart */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: styleConfig.heart3D.ambientGlowStyle
        }}
      />

      {/* Loading Indicator while GLB downloads */}
      {isLoadingModel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-xs z-20 pointer-events-none">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
          <span className="text-xs font-mono font-bold text-slate-300">
            Chargement du modèle anatomique 3D GLB...
          </span>
        </div>
      )}

      {/* Error Notice if GLB is missing */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 p-4 text-center">
          <span className="text-xs text-rose-400 font-mono font-bold">{loadError}</span>
        </div>
      )}

      {/* Header, Anatomical Leader Lines & Telemetry Badges only if not hidden by parent layout */}
      {!hideOverlayCards && (
        <>
          <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs"
                style={{
                  backgroundColor: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor: isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                  color: styleConfig.accentPrimary
                }}
              >
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${styleConfig.mainText}`}>
                  Surveillance Cardiaque 3D GLB
                </h3>
                <p className={`text-[11px] font-mono ${styleConfig.subText}`}>
                  {vitals.finger ? `Animation Native • Synchro MAX30102 (${bpm} BPM)` : 'En attente de détection doigt...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                Vue Fixe
              </span>
            </div>
          </div>

          {/* SVG Anatomical Callout Leader Lines & Arrow Pointers */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
            viewBox="0 0 400 340"
            preserveAspectRatio="none"
          >
            {/* Top-Left: Blood Pressure -> Crosse Aortique */}
            <g>
              <polyline 
                points="110,65 150,65 186,115" 
                fill="none" 
                stroke={isLight ? '#2563eb' : '#00f2fe'} 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <circle cx="110" cy="65" r="2.5" fill={isLight ? '#2563eb' : '#00f2fe'} />
              <circle cx="186" cy="115" r="7" fill="none" stroke={isLight ? '#2563eb' : '#00f2fe'} strokeWidth="1" opacity="0.6" className="animate-ping" />
              <circle cx="186" cy="115" r="3.5" fill={isLight ? '#ffffff' : '#04060a'} stroke={isLight ? '#2563eb' : '#00f2fe'} strokeWidth="1.5" />
            </g>

            {/* Top-Right: Tronc Pulmonaire */}
            <g>
              <polyline 
                points="290,65 250,65 224,115" 
                fill="none" 
                stroke={isLight ? '#059669' : '#10b981'} 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <circle cx="290" cy="65" r="2.5" fill={isLight ? '#059669' : '#10b981'} />
              <circle cx="224" cy="115" r="7" fill="none" stroke={isLight ? '#059669' : '#10b981'} strokeWidth="1" opacity="0.6" className="animate-ping" />
              <circle cx="224" cy="115" r="3.5" fill={isLight ? '#ffffff' : '#04060a'} stroke={isLight ? '#059669' : '#10b981'} strokeWidth="1.5" />
            </g>

            {/* Bottom-Left: Paroi Myocardique */}
            <g>
              <polyline 
                points="110,285 145,285 170,215" 
                fill="none" 
                stroke={isLight ? '#6366f1' : '#38bdf8'} 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <circle cx="110" cy="285" r="2.5" fill={isLight ? '#6366f1' : '#38bdf8'} />
              <circle cx="170" cy="215" r="7" fill="none" stroke={isLight ? '#6366f1' : '#38bdf8'} strokeWidth="1" opacity="0.6" className="animate-ping" />
              <circle cx="170" cy="215" r="3.5" fill={isLight ? '#ffffff' : '#04060a'} stroke={isLight ? '#6366f1' : '#38bdf8'} strokeWidth="1.5" />
            </g>

            {/* Bottom-Right: Apex Cardiaque */}
            <g>
              <polyline 
                points="290,285 250,285 220,240" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <circle cx="290" cy="285" r="2.5" fill="#f43f5e" />
              <circle cx="220" cy="240" r="7" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
              <circle cx="220" cy="240" r="3.5" fill={isLight ? '#ffffff' : '#04060a'} stroke="#f43f5e" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Standalone Badges */}
          <div className="absolute top-12 left-4 z-20 pointer-events-auto bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-md">
            <div className="text-[9px] text-slate-400 font-mono">Pression Artérielle</div>
            <div className="text-xs font-mono font-bold text-white">118/76 mmHg</div>
          </div>

          <div className="absolute top-12 right-4 z-20 pointer-events-auto bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-md text-right">
            <div className="text-[9px] text-slate-400 font-mono">Débit Cardiaque</div>
            <div className="text-xs font-mono font-bold text-emerald-400">5.6 L/min</div>
          </div>

          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-md">
            <div className="text-[9px] text-slate-400 font-mono">Myocarde</div>
            <div className="text-xs font-mono font-bold text-sky-400">FE: 65%</div>
          </div>

          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-md text-right">
            <div className="text-[9px] text-slate-400 font-mono">Apex Cardiaque</div>
            <div className="text-xs font-mono font-bold text-rose-400">{bpm} BPM</div>
          </div>
        </>
      )}

      {/* Three.js Canvas Container (Pointer events disabled: non-touchable, fixed orientation) */}
      <div 
        ref={containerRef} 
        className="w-full h-full pointer-events-none select-none flex items-center justify-center relative z-0"
      />
    </div>
  );
};
