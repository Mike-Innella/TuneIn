// queueManager.js
// Handles sequential playback of tracks with trimming support
// Integrates with ytController and session timer

import * as ytController from '../player/ytController';

export function createQueueManager({ onQueueEnd, getSessionRemainingSec }) {
  let queue = [];
  let currentIndex = 0;
  let activeTimer = null;
  let isDestroyed = false;

  function loadTrack(item) {
    if (!ytController.isReady() || isDestroyed) {
      console.warn('[QueueManager] Cannot load track - player not ready or destroyed');
      return;
    }

    if (!item || !item.id) {
      console.warn('[QueueManager] Invalid track item:', item);
      return;
    }

    console.log(`[QueueManager] Loading track ${currentIndex + 1}/${queue.length}:`, item.title || item.id);

    // Compute endSeconds: if trimTo exists, use it; else full duration
    const startSeconds = item.startAt || 0;
    const endSeconds = item.trimTo ? item.trimTo : item.durationSec;

    // Load video with trimming parameters
    try {
      if (ytController.loadVideoWithOptions && item.trimTo) {
        // Use the new loadVideoWithOptions for trimming
        ytController.loadVideoWithOptions({
          videoId: item.id,
          startSeconds: startSeconds,
          endSeconds: endSeconds,
          suggestedQuality: 'small'
        });
      } else {
        // Fallback to basic load for full tracks
        ytController.load(item.id);
      }
    } catch (error) {
      console.warn('[QueueManager] Error loading track with trimming, falling back to basic load:', error);
      ytController.load(item.id);
    }
  }

  function playNext() {
    if (isDestroyed || currentIndex >= queue.length) {
      console.log('[QueueManager] Queue completed or destroyed');
      onQueueEnd?.();
      return;
    }

    const item = queue[currentIndex];
    loadTrack(item);

    // Safety: also stop at session end regardless of player state
    clearInterval(activeTimer);
    activeTimer = setInterval(() => {
      if (isDestroyed) {
        clearInterval(activeTimer);
        return;
      }

      const remaining = getSessionRemainingSec();
      if (remaining <= 0) {
        console.log('[QueueManager] Session timer ended, stopping playback');
        clearInterval(activeTimer);
        try {
          ytController.stop();
        } catch (e) {
          console.warn('[QueueManager] Error stopping player:', e);
        }
        onQueueEnd?.();
      }
    }, 1000);
  }

  function onPlayerStateChange(event) {
    if (isDestroyed) return;

    // 0 = ENDED
    if (event.data === 0) {
      console.log('[QueueManager] Track ended, advancing to next');
      currentIndex += 1;
      playNext();
    }
  }

  function startQueue(newQueue) {
    if (isDestroyed) return;

    console.log('[QueueManager] Starting queue with', newQueue.length, 'tracks');
    queue = [...newQueue];
    currentIndex = 0;
    playNext();
  }

  function getCurrentTrack() {
    return queue[currentIndex] || null;
  }

  function getQueueInfo() {
    return {
      current: currentIndex,
      total: queue.length,
      remaining: queue.length - currentIndex,
      queue: [...queue]
    };
  }

  function destroy() {
    console.log('[QueueManager] Destroying queue manager');
    isDestroyed = true;
    clearInterval(activeTimer);
    activeTimer = null;
    queue = [];
    currentIndex = 0;
  }

  return {
    startQueue,
    onPlayerStateChange,
    getCurrentTrack,
    getQueueInfo,
    destroy
  };
}

// Global queue manager instance - will be initialized when needed
let globalQueueManager = null;

export function getGlobalQueueManager() {
  return globalQueueManager;
}

export function initializeGlobalQueueManager(options) {
  if (globalQueueManager) {
    globalQueueManager.destroy();
  }

  globalQueueManager = createQueueManager(options);
  return globalQueueManager;
}

export function destroyGlobalQueueManager() {
  if (globalQueueManager) {
    globalQueueManager.destroy();
    globalQueueManager = null;
  }
}