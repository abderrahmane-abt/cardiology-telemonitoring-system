import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const CACHE_NAME = 'cardiopulse-3d-model-cache-v2';
const MODEL_URL = '/models/heart.glb';

let memoryGltf: GLTF | null = null;
let activeLoadingPromise: Promise<GLTF> | null = null;

/**
 * Returns true if the 3D heart model is already parsed and stored in active memory.
 */
export function isHeartModelCached(): boolean {
  return memoryGltf !== null;
}

/**
 * Fetches the GLB file using the browser's persistent CacheStorage API,
 * parses it once, normalizes its scale/center, and caches it in memory.
 */
export async function getOrLoadHeartModel(): Promise<GLTF> {
  if (memoryGltf) {
    return memoryGltf;
  }

  if (activeLoadingPromise) {
    return activeLoadingPromise;
  }

  activeLoadingPromise = (async () => {
    try {
      let arrayBuffer: ArrayBuffer | null = null;

      // Tier 1: Browser Persistent Cache API (Instant on page refresh & offline)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const matched = await cache.match(MODEL_URL);
          if (matched && matched.ok) {
            arrayBuffer = await matched.arrayBuffer();
          } else {
            const response = await fetch(MODEL_URL, { cache: 'force-cache' });
            if (response.ok) {
              await cache.put(MODEL_URL, response.clone());
              arrayBuffer = await response.arrayBuffer();
            }
          }
        } catch (cacheErr) {
          console.warn('[Cache API] Fallback to standard fetch:', cacheErr);
        }
      }

      // Tier 2: Standard HTTP Fetch Fallback
      if (!arrayBuffer) {
        const response = await fetch(MODEL_URL, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Échec du téléchargement du modèle 3D: HTTP ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      // Tier 3: Parse binary ArrayBuffer with Three.js GLTFLoader
      const gltfLoader = new GLTFLoader();
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        gltfLoader.parse(
          arrayBuffer!,
          '',
          (parsed) => resolve(parsed),
          (err) => reject(err)
        );
      });

      // Normalize scale and center once on the master model
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.6 / (maxDim || 1);
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale - 0.05;
      model.position.z = -center.z * scale;

      memoryGltf = gltf;
      return gltf;
    } finally {
      activeLoadingPromise = null;
    }
  })();

  return activeLoadingPromise;
}

/**
 * Creates an isolated clone of the model and its animations
 * for instant mounting in any Three.js scene.
 */
export function createHeartInstance(gltf: GLTF): { 
  model: THREE.Group; 
  animations: THREE.AnimationClip[] 
} {
  const clonedScene = SkeletonUtils.clone(gltf.scene) as THREE.Group;
  return {
    model: clonedScene,
    animations: gltf.animations || []
  };
}

/**
 * Pre-warm the cache immediately in the background so it is ready
 * before the user even reaches the 3D monitoring view.
 */
export function prewarmHeartModelCache(): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      getOrLoadHeartModel().catch(() => {});
    });
  } else {
    setTimeout(() => {
      getOrLoadHeartModel().catch(() => {});
    }, 50);
  }
}

// Auto-start pre-warm on script evaluation
prewarmHeartModelCache();
