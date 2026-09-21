// public/workers/timerWorker.js
// Dedicated Web Worker to prevent timer throttling when browser tab is in background

let timerId = null;
let remainingSeconds = 0;
let isRunning = false;

self.onmessage = function (e) {
  const { action, duration } = e.data;

  if (action === 'START') {
    if (timerId) clearInterval(timerId);
    remainingSeconds = duration;
    isRunning = true;

    self.postMessage({ type: 'TICK', remainingSeconds });

    timerId = setInterval(() => {
      if (!isRunning) return;

      remainingSeconds -= 1;
      self.postMessage({ type: 'TICK', remainingSeconds });

      if (remainingSeconds <= 0) {
        clearInterval(timerId);
        timerId = null;
        isRunning = false;
        self.postMessage({ type: 'COMPLETED' });
      }
    }, 1000);
  } else if (action === 'PAUSE') {
    isRunning = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    self.postMessage({ type: 'PAUSED', remainingSeconds });
  } else if (action === 'RESUME') {
    if (remainingSeconds > 0 && !isRunning) {
      isRunning = true;
      timerId = setInterval(() => {
        if (!isRunning) return;

        remainingSeconds -= 1;
        self.postMessage({ type: 'TICK', remainingSeconds });

        if (remainingSeconds <= 0) {
          clearInterval(timerId);
          timerId = null;
          isRunning = false;
          self.postMessage({ type: 'COMPLETED' });
        }
      }, 1000);
    }
  } else if (action === 'STOP') {
    isRunning = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    remainingSeconds = 0;
    self.postMessage({ type: 'STOPPED' });
  }
};
