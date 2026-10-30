/**
 * LocalStorage cleanup helper to prevent browser storage quota exceeded errors
 * during extended recording sessions with high-frequency telemetry & temporary blobs.
 */

export interface StorageQuotaReport {
  usedBytes: number;
  usedMb: number;
  thresholdMb: number;
  isOverThreshold: boolean;
  itemCount: number;
  tempItemsCount: number;
}

export interface CleanupResult {
  freedBytes: number;
  freedMb: number;
  clearedKeys: string[];
  remainingUsageMb: number;
}

export const DEFAULT_STORAGE_THRESHOLD_MB = 10; // 10 Megabytes threshold for aggressive browser quota safety

/**
 * Measure currently occupied localStorage bytes
 */
export function getStorageUsage(): StorageQuotaReport {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      usedBytes: 0,
      usedMb: 0,
      thresholdMb: DEFAULT_STORAGE_THRESHOLD_MB,
      isOverThreshold: false,
      itemCount: 0,
      tempItemsCount: 0,
    };
  }

  let totalBytes = 0;
  let tempCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key) || '';
      totalBytes += (key.length + val.length) * 2; // UTF-16 characters: 2 bytes per char
      if (
        key.includes('temp') ||
        key.includes('chunk') ||
        key.includes('telemetry_dump') ||
        key.includes('cached_blob') ||
        key.startsWith('kbt_temp_')
      ) {
        tempCount++;
      }
    }
  }

  const usedMb = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;

  return {
    usedBytes: totalBytes,
    usedMb,
    thresholdMb: DEFAULT_STORAGE_THRESHOLD_MB,
    isOverThreshold: usedMb > DEFAULT_STORAGE_THRESHOLD_MB,
    itemCount: localStorage.length,
    tempItemsCount: tempCount,
  };
}

/**
 * Clean up old temp recording blobs, debug dumps, and excess historical telemetry
 * when storage usage exceeds the threshold
 */
export function cleanupStorageThreshold(thresholdMb = DEFAULT_STORAGE_THRESHOLD_MB): CleanupResult {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { freedBytes: 0, freedMb: 0, clearedKeys: [], remainingUsageMb: 0 };
  }

  const initialUsage = getStorageUsage();
  const clearedKeys: string[] = [];
  let freedBytes = 0;

  // Pattern 1: Targeted temporary keys
  const tempKeyPatterns = [
    'kbt_temp_',
    'temp_recording',
    'recording_chunk_',
    'telemetry_history_dump',
    'canvas_preview_cache',
    'temp_audio_buffer',
  ];

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;

    const isTemp = tempKeyPatterns.some((pattern) => key.includes(pattern));
    if (isTemp) {
      const val = localStorage.getItem(key) || '';
      const bytes = (key.length + val.length) * 2;
      localStorage.removeItem(key);
      clearedKeys.push(key);
      freedBytes += bytes;
    }
  }

  // Pattern 2: If still over threshold, trim local archives to only keep last 10 entries
  const currentUsage = getStorageUsage();
  if (currentUsage.usedMb > thresholdMb) {
    try {
      const archivesRaw = localStorage.getItem('kbt_local_recording_archive_v1');
      if (archivesRaw) {
        const parsed = JSON.parse(archivesRaw);
        if (Array.isArray(parsed) && parsed.length > 10) {
          const trimmed = parsed.slice(0, 10);
          const oldLen = archivesRaw.length * 2;
          const newRaw = JSON.stringify(trimmed);
          const newLen = newRaw.length * 2;
          localStorage.setItem('kbt_local_recording_archive_v1', newRaw);
          freedBytes += Math.max(0, oldLen - newLen);
          clearedKeys.push('kbt_local_recording_archive_v1 (trimmed to 10)');
        }
      }
    } catch (e) {
      console.warn('Error trimming local archive entries:', e);
    }
  }

  const remaining = getStorageUsage();

  return {
    freedBytes,
    freedMb: Math.round((freedBytes / (1024 * 1024)) * 100) / 100,
    clearedKeys,
    remainingUsageMb: remaining.usedMb,
  };
}
