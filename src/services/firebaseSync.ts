import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ProjectRecordingMetadata } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App & Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Test connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
  }
})();

// Auto ensure authenticated session (Anonymous or existing Google session)
let authInitialized = false;
export async function ensureAuthUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const userCred = await signInAnonymously(auth);
          resolve(userCred.user);
        } catch (e) {
          console.warn('Anonymous auth initialization warning:', e);
          resolve(null);
        }
      }
    });
  });
}

// Storage key for Cloud Sync preference
export const CLOUD_SYNC_STORAGE_KEY = 'kbt_cloud_sync_enabled_v1';
export const LOCAL_ARCHIVE_STORAGE_KEY = 'kbt_local_recording_archive_v1';

export function isCloudSyncEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(CLOUD_SYNC_STORAGE_KEY);
  return stored !== 'false'; // default true
}

export function setCloudSyncEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLOUD_SYNC_STORAGE_KEY, enabled ? 'true' : 'false');
  }
}

export interface ArchiveSessionItem {
  id: string;
  userId: string;
  projectTitle: string;
  projectDescription?: string;
  durationSeconds: number;
  formattedDuration: string;
  exportFormat: string;
  colorFilter: string;
  resolution: string;
  crop?: string;
  tags?: string[];
  language?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  isAutoSaved?: boolean;
}

/**
 * Sync active project state to Firestore
 */
export async function syncProjectToFirestore(
  projectId: string,
  metadata: Partial<ProjectRecordingMetadata> & { projectTitle: string; exportFormat: string; isAutoSaved?: boolean; thumbnailUrl?: string }
): Promise<void> {
  const sanitizedId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'default-project';
  const nowIso = new Date().toISOString();

  // Always save locally as fallback
  try {
    const localSessions = getLocalArchives();
    const existingIndex = localSessions.findIndex((s) => s.id === sanitizedId);
    const localItem: ArchiveSessionItem = {
      id: sanitizedId,
      userId: auth.currentUser?.uid || 'local-guest',
      projectTitle: metadata.projectTitle || 'Untitled Project',
      projectDescription: metadata.projectDescription || '',
      durationSeconds: metadata.durationSeconds || 0,
      formattedDuration: metadata.formattedDuration || '00:00',
      exportFormat: metadata.exportFormat || 'mp4',
      colorFilter: metadata.colorFilter || 'none',
      resolution: metadata.resolution ? `${metadata.resolution.width}x${metadata.resolution.height}` : '1920x1080',
      language: metadata.language || 'en',
      thumbnailUrl: metadata.thumbnailUrl || (existingIndex >= 0 ? localSessions[existingIndex].thumbnailUrl : undefined),
      createdAt: nowIso,
      updatedAt: nowIso,
      isAutoSaved: metadata.isAutoSaved || false,
    };
    if (existingIndex >= 0) {
      localSessions[existingIndex] = localItem;
    } else {
      localSessions.unshift(localItem);
    }
    localStorage.setItem(LOCAL_ARCHIVE_STORAGE_KEY, JSON.stringify(localSessions.slice(0, 50)));
  } catch (e) {
    console.warn('Local archive cache write warning:', e);
  }

  if (!isCloudSyncEnabled()) return;

  const user = await ensureAuthUser();
  if (!user) return;

  const path = `projects/${sanitizedId}`;
  try {
    const docData = {
      id: sanitizedId,
      userId: user.uid,
      projectTitle: (metadata.projectTitle || 'Untitled Project').slice(0, 200),
      projectDescription: (metadata.projectDescription || '').slice(0, 1000),
      durationSeconds: Number(metadata.durationSeconds || 0),
      formattedDuration: (metadata.formattedDuration || '00:00').slice(0, 30),
      language: (metadata.language || 'en').slice(0, 20),
      exportFormat: (metadata.exportFormat || 'mp4').slice(0, 20),
      aspectRatio: (metadata.aspectRatio || '16:9').slice(0, 20),
      colorFilter: (metadata.colorFilter || 'none').slice(0, 50),
      interactiveWorkflowStepsCount: Number(metadata.interactiveWorkflowStepsCount || 0),
      subtitleCuesCount: Number(metadata.subtitleCuesCount || 0),
      isAutoSaved: Boolean(metadata.isAutoSaved),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(doc(db, 'projects', sanitizedId), docData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Record a completed recording session to archive
 */
export async function archiveRecordingSession(
  recordingId: string,
  sessionData: {
    projectTitle: string;
    durationSeconds: number;
    formattedDuration: string;
    exportFormat: string;
    colorFilter: string;
    resolution: string;
    crop?: string;
    thumbnailUrl?: string;
  }
): Promise<void> {
  const sanitizedId = recordingId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || `rec-${Date.now()}`;
  const nowIso = new Date().toISOString();

  // Save to local archives
  try {
    const local = getLocalArchives();
    local.unshift({
      id: sanitizedId,
      userId: auth.currentUser?.uid || 'local-guest',
      projectTitle: sessionData.projectTitle,
      durationSeconds: sessionData.durationSeconds,
      formattedDuration: sessionData.formattedDuration,
      exportFormat: sessionData.exportFormat,
      colorFilter: sessionData.colorFilter,
      resolution: sessionData.resolution,
      crop: sessionData.crop,
      thumbnailUrl: sessionData.thumbnailUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    localStorage.setItem(LOCAL_ARCHIVE_STORAGE_KEY, JSON.stringify(local.slice(0, 50)));
  } catch (e) {
    console.warn('Local archive cache warning:', e);
  }

  if (!isCloudSyncEnabled()) return;

  const user = await ensureAuthUser();
  if (!user) return;

  const path = `recordings/${sanitizedId}`;
  try {
    const payload: Record<string, any> = {
      id: sanitizedId,
      userId: user.uid,
      projectTitle: sessionData.projectTitle.slice(0, 200),
      durationSeconds: sessionData.durationSeconds,
      formattedDuration: sessionData.formattedDuration.slice(0, 30),
      exportFormat: sessionData.exportFormat.slice(0, 20),
      colorFilter: sessionData.colorFilter.slice(0, 50),
      resolution: sessionData.resolution.slice(0, 50),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (sessionData.crop) {
      payload.crop = sessionData.crop.slice(0, 50);
    }
    if (sessionData.thumbnailUrl) {
      payload.thumbnailUrl = sessionData.thumbnailUrl;
    }
    await setDoc(doc(db, 'recordings', sanitizedId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Fetch past archived recording sessions
 */
export async function fetchArchivedSessions(): Promise<ArchiveSessionItem[]> {
  const localItems = getLocalArchives();

  if (!isCloudSyncEnabled()) {
    return localItems;
  }

  const user = await ensureAuthUser();
  if (!user) return localItems;

  const path = 'recordings';
  try {
    const q = query(collection(db, 'recordings'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const firestoreItems: ArchiveSessionItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      firestoreItems.push({
        id: docSnap.id,
        userId: data.userId,
        projectTitle: data.projectTitle || 'Untitled Recording',
        durationSeconds: data.durationSeconds || 0,
        formattedDuration: data.formattedDuration || '00:00',
        exportFormat: data.exportFormat || 'mp4',
        colorFilter: data.colorFilter || 'none',
        resolution: data.resolution || '1920x1080',
        crop: data.crop,
        thumbnailUrl: data.thumbnailUrl,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    if (firestoreItems.length > 0) {
      // Merge with local items deduplicated by id
      const combined = [...firestoreItems];
      localItems.forEach((loc) => {
        if (!combined.some((c) => c.id === loc.id)) {
          combined.push(loc);
        }
      });
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return combined;
    }

    return localItems;
  } catch (err) {
    console.warn('Failed to query Firestore recordings, falling back to local storage:', err);
    return localItems;
  }
}

/**
 * Delete an archived session
 */
export async function deleteArchivedSession(id: string): Promise<void> {
  const local = getLocalArchives().filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_ARCHIVE_STORAGE_KEY, JSON.stringify(local));

  if (!isCloudSyncEnabled()) return;
  const user = await ensureAuthUser();
  if (!user) return;

  const path = `recordings/${id}`;
  try {
    await deleteDoc(doc(db, 'recordings', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Update project title, description, and tags for an archived recording session
 */
export async function updateArchivedSession(
  id: string,
  updates: { projectTitle?: string; projectDescription?: string; tags?: string[] }
): Promise<void> {
  const local = getLocalArchives().map((item) => {
    if (item.id === id) {
      return {
        ...item,
        projectTitle: updates.projectTitle !== undefined ? updates.projectTitle : item.projectTitle,
        projectDescription: updates.projectDescription !== undefined ? updates.projectDescription : item.projectDescription,
        tags: updates.tags !== undefined ? updates.tags : item.tags,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  localStorage.setItem(LOCAL_ARCHIVE_STORAGE_KEY, JSON.stringify(local));

  if (!isCloudSyncEnabled()) return;
  const user = await ensureAuthUser();
  if (!user) return;

  const path = `recordings/${id}`;
  try {
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.projectTitle !== undefined) {
      payload.projectTitle = updates.projectTitle.slice(0, 200);
    }
    if (updates.projectDescription !== undefined) {
      payload.projectDescription = updates.projectDescription.slice(0, 1000);
    }
    if (updates.tags !== undefined) {
      payload.tags = updates.tags;
    }
    await setDoc(doc(db, 'recordings', id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function getLocalArchives(): ArchiveSessionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ARCHIVE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error parsing local archives:', e);
  }
  return [];
}

export interface CustomQualityPreset {
  id: string;
  userId?: string;
  name: string;
  quality: '1080p' | '720p';
  framerate: 30 | 60;
  bitrateKbps: number;
  format: 'mp4' | 'webm' | 'gif';
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export const QUALITY_PRESETS_STORAGE_KEY = 'kbt_quality_presets_v1';

export const DEFAULT_QUALITY_PRESETS: CustomQualityPreset[] = [
  {
    id: 'preset_1080p_60_high',
    name: '1080p 60fps High Bitrate',
    quality: '1080p',
    framerate: 60,
    bitrateKbps: 8000,
    format: 'mp4',
    description: 'Crisp 60fps high bitrate encode ideal for detailed coding walkthroughs and complex UI tutorials.',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'preset_720p_30_mobile',
    name: '720p 30fps Mobile Optimized',
    quality: '720p',
    framerate: 30,
    bitrateKbps: 2500,
    format: 'mp4',
    description: 'Lightweight bandwidth-friendly encode perfectly suited for mobile viewing and instant messaging.',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'preset_1080p_30_web',
    name: '1080p 30fps Web Standard',
    quality: '1080p',
    framerate: 30,
    bitrateKbps: 5000,
    format: 'mp4',
    description: 'Standard YouTube and web documentation preset balancing file size with sharp text legibility.',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'preset_720p_60_smooth',
    name: '720p 60fps Smooth Motion',
    quality: '720p',
    framerate: 60,
    bitrateKbps: 3800,
    format: 'webm',
    description: 'Fluid 60fps frame rate for animations and terminal scrolling at modest file size.',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
];

export function getLocalQualityPresets(): CustomQualityPreset[] {
  if (typeof window === 'undefined') return DEFAULT_QUALITY_PRESETS;
  try {
    const raw = localStorage.getItem(QUALITY_PRESETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local quality presets:', e);
  }
  return DEFAULT_QUALITY_PRESETS;
}

export async function fetchQualityPresets(): Promise<CustomQualityPreset[]> {
  const local = getLocalQualityPresets();
  if (!isCloudSyncEnabled()) return local;

  const user = await ensureAuthUser();
  if (!user) return local;

  const path = 'qualityPresets';
  try {
    const q = query(collection(db, 'qualityPresets'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const firestoreItems: CustomQualityPreset[] = [];
    snapshot.forEach((d) => {
      firestoreItems.push({ id: d.id, ...d.data() } as CustomQualityPreset);
    });

    if (firestoreItems.length > 0) {
      // Merge unique
      const combined = [...firestoreItems];
      local.forEach((loc) => {
        if (!combined.some((c) => c.id === loc.id)) {
          combined.push(loc);
        }
      });
      localStorage.setItem(QUALITY_PRESETS_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
    return local;
  } catch (err) {
    console.warn('Failed to query qualityPresets from Firestore, using local presets:', err);
    return local;
  }
}

export async function saveQualityPreset(preset: Omit<CustomQualityPreset, 'id' | 'createdAt'> & { id?: string }): Promise<CustomQualityPreset> {
  const sanitizedId = (preset.id || `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const nowIso = new Date().toISOString();
  const currentPresets = getLocalQualityPresets();
  const existingIdx = currentPresets.findIndex((p) => p.id === sanitizedId);

  const fullPreset: CustomQualityPreset = {
    id: sanitizedId,
    name: preset.name.slice(0, 100),
    quality: preset.quality,
    framerate: preset.framerate,
    bitrateKbps: preset.bitrateKbps,
    format: preset.format,
    description: preset.description ? preset.description.slice(0, 300) : undefined,
    createdAt: existingIdx >= 0 ? currentPresets[existingIdx].createdAt : nowIso,
    updatedAt: nowIso,
  };

  if (existingIdx >= 0) {
    currentPresets[existingIdx] = fullPreset;
  } else {
    currentPresets.push(fullPreset);
  }
  localStorage.setItem(QUALITY_PRESETS_STORAGE_KEY, JSON.stringify(currentPresets));

  if (!isCloudSyncEnabled()) return fullPreset;

  const user = await ensureAuthUser();
  if (!user) return fullPreset;

  const path = `qualityPresets/${sanitizedId}`;
  try {
    const payload = {
      ...fullPreset,
      userId: user.uid,
    };
    await setDoc(doc(db, 'qualityPresets', sanitizedId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  return fullPreset;
}

export async function deleteQualityPreset(id: string): Promise<void> {
  const currentPresets = getLocalQualityPresets().filter((p) => p.id !== id);
  localStorage.setItem(QUALITY_PRESETS_STORAGE_KEY, JSON.stringify(currentPresets));

  if (!isCloudSyncEnabled()) return;
  const user = await ensureAuthUser();
  if (!user) return;

  const path = `qualityPresets/${id}`;
  try {
    await deleteDoc(doc(db, 'qualityPresets', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

import { GlobalExportTemplate, GLOBAL_EXPORT_TEMPLATES } from '../data/structuredStudioData';

export const GLOBAL_TEMPLATES_STORAGE_KEY = 'kbt_global_export_templates_v1';

export function getLocalGlobalTemplates(): GlobalExportTemplate[] {
  if (typeof window === 'undefined') return GLOBAL_EXPORT_TEMPLATES;
  try {
    const raw = localStorage.getItem(GLOBAL_TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return GLOBAL_EXPORT_TEMPLATES;
}

export async function fetchGlobalTemplates(): Promise<GlobalExportTemplate[]> {
  const local = getLocalGlobalTemplates();
  if (!isCloudSyncEnabled()) return local;

  const user = await ensureAuthUser();
  if (!user) return local;

  const path = 'exportTemplates';
  try {
    const q = query(collection(db, 'exportTemplates'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const firestoreItems: GlobalExportTemplate[] = [];
    snapshot.forEach((d) => {
      firestoreItems.push({ id: d.id, ...d.data() } as GlobalExportTemplate);
    });

    if (firestoreItems.length > 0) {
      const combined = [...firestoreItems];
      local.forEach((loc) => {
        if (!combined.some((c) => c.id === loc.id)) {
          combined.push(loc);
        }
      });
      localStorage.setItem(GLOBAL_TEMPLATES_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
    return local;
  } catch (err) {
    console.warn('Failed to fetch exportTemplates from Firestore:', err);
    return local;
  }
}

export async function saveGlobalTemplate(template: GlobalExportTemplate): Promise<GlobalExportTemplate> {
  const current = getLocalGlobalTemplates();
  const existingIdx = current.findIndex((t) => t.id === template.id);
  if (existingIdx >= 0) {
    current[existingIdx] = template;
  } else {
    current.push(template);
  }
  localStorage.setItem(GLOBAL_TEMPLATES_STORAGE_KEY, JSON.stringify(current));

  if (!isCloudSyncEnabled()) return template;
  const user = await ensureAuthUser();
  if (!user) return template;

  const path = `exportTemplates/${template.id}`;
  try {
    await setDoc(doc(db, 'exportTemplates', template.id), { ...template, userId: user.uid }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
  return template;
}

export async function deleteGlobalTemplate(id: string): Promise<void> {
  const current = getLocalGlobalTemplates().filter((t) => t.id !== id);
  localStorage.setItem(GLOBAL_TEMPLATES_STORAGE_KEY, JSON.stringify(current));

  if (!isCloudSyncEnabled()) return;
  const user = await ensureAuthUser();
  if (!user) return;

  const path = `exportTemplates/${id}`;
  try {
    await deleteDoc(doc(db, 'exportTemplates', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
