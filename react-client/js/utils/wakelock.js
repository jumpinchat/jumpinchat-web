export const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    let wakeLock;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log({ wakeLock }, 'wake lock set');
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        return null;
      }
    }

    wakeLock.addEventListener('release', () => {
      console.log('screen wake lock release');
    });

    return wakeLock;
  }

  return null;
};

export const releaseWakeLock = async () => {
  if ('wakeLock' in navigator) {
    await navigator.wakeLock.release();
  }
};
