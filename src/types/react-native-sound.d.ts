declare module 'react-native-sound' {
  class Sound {
    static setCategory(value: string, mixWithOthers?: boolean): void;
    constructor(filename: string, basePath?: string, onError?: (error: any) => void);
    play(onEnd?: (success: boolean) => void): this;
    pause(cb?: () => void): this;
    stop(cb?: () => void): this;
    release(): void;
    setNumberOfLoops(loops: number): this;
    setVolume(value: number): this;
  }
  export = Sound;
}
