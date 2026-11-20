import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const CACHE_NAME = 'cardiopulse-3d-model-cache-v3';

const baseUrl = (import.meta.env.BASE_URL || './').endsWith('/')
  ? (import.meta.env.BASE_URL || './')
  : `${import.meta.env.BASE_URL || './'}/`;

export const HEART_MODEL_URL = `${baseUrl}models/heart.glb`;
export const LUNGS_MODEL_URL = `${baseUrl}models/lungs.glb`;
export const ANATOMY_MODEL_URL = `${baseUrl}models/anatomy.glb`;

const memoryCache = new Map<string, GLTF>();
const loadingPromises = new Map<string, Promise<GLTF>>();

/**
 * Checks if a specific model URL is already parsed and stored in active memory.
 */
export function isModelCached(url: string): boolean {
  return memoryCache.has(url);
}

export function isHeartModelCached(): boolean {
  return isModelCached(HEART_MODEL_URL);
}

export function isLungsModelCached(): boolean {
  return isModelCached(LUNGS_MODEL_URL);
}

export function isAnatomyModelCached(): boolean {
  return isModelCached(ANATOMY_MODEL_URL);
}

/**
 * Universal cached GLB loader:
 * 1. Checks memory singleton
 * 2. Checks browser persistent CacheStorage API
 * 3. Fallback to standard fetch
 * 4. Normalizes scale and centers model at (0, 0, 0)
 */
export async function getOrLoadModel(
  url: string,
  targetScale: number = 2.6,
  offsetY: number = 0
): Promise<GLTF> {
  if (memoryCache.has(url)) {
    return memoryCache.get(url)!;
  }

  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const promise = (async () => {
    try {
      let arrayBuffer: ArrayBuffer | null = null;

      // Tier 1: Browser Persistent Cache API
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const matched = await cache.match(url);
          if (matched && matched.ok) {
            arrayBuffer = await matched.arrayBuffer();
          } else {
            const response = await fetch(url, { cache: 'force-cache' });
            if (response.ok) {
              await cache.put(url, response.clone());
              arrayBuffer = await response.arrayBuffer();
            }
          }
        } catch (cacheErr) {
          console.warn(`[Cache API] Fallback to standard fetch for ${url}:`, cacheErr);
        }
      }

      // Tier 2: Standard HTTP Fetch Fallback
      if (!arrayBuffer) {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Échec du téléchargement du modèle 3D (${url}): HTTP ${response.status}`);
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
      const scale = targetScale / (maxDim || 1);
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale + offsetY;
      model.position.z = -center.z * scale;

      memoryCache.set(url, gltf);
      return gltf;
    } finally {
      loadingPromises.delete(url);
    }
  })();

  loadingPromises.set(url, promise);
  return promise;
}

/**
 * Model-specific loader helpers
 */
export function getOrLoadHeartModel(): Promise<GLTF> {
  return getOrLoadModel(HEART_MODEL_URL, 2.6, -0.05);
}

export function getOrLoadLungsModel(): Promise<GLTF> {
  // Scaled down with comfortable margin for volumetric breathing expansion
  return getOrLoadModel(LUNGS_MODEL_URL, 2.1, 0.0);
}

export function getOrLoadAnatomyModel(): Promise<GLTF> {
  // Optimal medical framing: Head, chest, and both hands/arms visible with zero wasted thigh space
  return getOrLoadModel(ANATOMY_MODEL_URL, 4.2, -0.38);
}

/**
 * Creates an isolated clone of the model and its animations
 * for instant mounting in any Three.js scene.
 */
export function createModelInstance(gltf: GLTF): { 
  model: THREE.Group; 
  animations: THREE.AnimationClip[] 
} {
  const clonedScene = SkeletonUtils.clone(gltf.scene) as THREE.Group;
  return {
    model: clonedScene,
    animations: gltf.animations || []
  };
}

export const createHeartInstance = createModelInstance;

/**
 * Pre-warm all 3D model caches in background
 */
export function prewarmModelCaches(): void {
  if (typeof window === 'undefined') return;

  const prewarm = () => {
    getOrLoadHeartModel().catch(() => {});
    getOrLoadLungsModel().catch(() => {});
    getOrLoadAnatomyModel().catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prewarm);
  } else {
    setTimeout(prewarm, 100);
  }
}

// Auto-start pre-warm on script evaluation
prewarmModelCaches();
