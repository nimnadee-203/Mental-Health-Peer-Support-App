// Web shim: no-op Sound class for web platform
class Sound {
  constructor(filename, basePath, callback) {
    if (callback) setTimeout(() => callback(null), 0);
  }
  play(callback) { if (callback) callback(true); return this; }
  stop(callback) { if (callback) callback(); return this; }
  pause(callback) { if (callback) callback(); return this; }
  release() {}
  setVolume() { return this; }
  setCurrentTime() { return this; }
  getCurrentTime(callback) { if (callback) callback(0, false); }
  setNumberOfLoops() { return this; }
  getDuration() { return 0; }
  isLoaded() { return false; }
}

Sound.setCategory = () => {};
Sound.LIBRARY = '';
Sound.DOCUMENT = '';
Sound.MAIN_BUNDLE = '';

export default Sound;

