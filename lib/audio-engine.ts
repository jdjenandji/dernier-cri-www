/**
 * AudioCrossfadeEngine
 *
 * Manages audio playback with smooth crossfading between two audio elements
 * using Web Audio API's GainNode for precise volume control.
 */

export class AudioCrossfadeEngine {
  private audioContext: AudioContext | null = null;
  private audioElements: [HTMLAudioElement, HTMLAudioElement];
  private gainNodes: [GainNode | null, GainNode | null] = [null, null];
  private sourceNodes: [MediaElementAudioSourceNode | null, MediaElementAudioSourceNode | null] = [null, null];
  private activeIndex: 0 | 1 = 0;
  private isInitialized = false;
  private _isMuted = false;
  private _volume = 1;

  constructor() {
    // Create two audio elements for alternating playback
    this.audioElements = [
      this.createAudioElement(),
      this.createAudioElement(),
    ];
  }

  private createAudioElement(): HTMLAudioElement {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    return audio;
  }

  /**
   * Initialize the Web Audio API context and nodes
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create source nodes from audio elements
      this.sourceNodes[0] = this.audioContext.createMediaElementSource(this.audioElements[0]);
      this.sourceNodes[1] = this.audioContext.createMediaElementSource(this.audioElements[1]);

      // Create gain nodes for volume control
      this.gainNodes[0] = this.audioContext.createGain();
      this.gainNodes[1] = this.audioContext.createGain();

      // Connect the audio graph: source -> gain -> destination
      this.sourceNodes[0].connect(this.gainNodes[0]);
      this.sourceNodes[1].connect(this.gainNodes[1]);
      this.gainNodes[0].connect(this.audioContext.destination);
      this.gainNodes[1].connect(this.audioContext.destination);

      // Set initial volumes (active starts at 1, inactive at 0)
      this.gainNodes[0].gain.value = 1;
      this.gainNodes[1].gain.value = 0;

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
      throw error;
    }
  }

  /**
   * Load and play a stream on the currently active audio element
   */
  async playStream(streamUrl: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const audio = this.audioElements[this.activeIndex];
    const gainNode = this.gainNodes[this.activeIndex];

    if (!gainNode || !this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    try {
      // Load the stream
      audio.src = streamUrl;
      audio.load();

      // Set volume to full
      gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);

      // Play the stream
      await audio.play();
    } catch (error) {
      console.error("Failed to play stream:", error);
      throw error;
    }
  }

  /**
   * Switch to a new stream instantly (no crossfade)
   */
  async crossfadeTo(streamUrl: string, _duration: number = 0): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    const currentIndex = this.activeIndex;
    const nextIndex: 0 | 1 = currentIndex === 0 ? 1 : 0;

    const currentAudio = this.audioElements[currentIndex];
    const nextAudio = this.audioElements[nextIndex];
    const currentGain = this.gainNodes[currentIndex];
    const nextGain = this.gainNodes[nextIndex];

    if (!currentGain || !nextGain) {
      throw new Error("Gain nodes not initialized");
    }

    try {
      // Stop current stream immediately
      currentAudio.pause();
      currentGain.gain.value = 0;

      // Load and play the new stream
      nextAudio.src = streamUrl;
      nextAudio.muted = this._isMuted;
      nextAudio.load();
      
      // Set volume to full (or 0 if muted)
      nextGain.gain.value = this._isMuted ? 0 : this._volume;
      
      await nextAudio.play();

      // Cleanup old stream
      currentAudio.src = "";

      // Switch active index
      this.activeIndex = nextIndex;
    } catch (error) {
      console.error("Failed to switch station:", error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.audioElements[this.activeIndex].pause();
  }

  /**
   * Resume playback
   */
  async resume(): Promise<void> {
    try {
      await this.audioElements[this.activeIndex].play();
    } catch (error) {
      console.error("Failed to resume playback:", error);
      throw error;
    }
  }

  /**
   * Get the current playback state
   */
  isPlaying(): boolean {
    return !this.audioElements[this.activeIndex].paused;
  }

  /**
   * Preload a stream in the inactive audio element
   */
  preload(streamUrl: string): void {
    const nextIndex: 0 | 1 = this.activeIndex === 0 ? 1 : 0;
    const nextAudio = this.audioElements[nextIndex];
    nextAudio.src = streamUrl;
    nextAudio.load();
  }

  /**
   * Mute audio - uses both HTML element muted property and gain node for reliability
   */
  mute(): void {
    this._isMuted = true;
    // Mute both audio elements directly (most reliable on mobile)
    this.audioElements[0].muted = true;
    this.audioElements[1].muted = true;
    // Also set gain to 0 as backup
    this.applyVolume(0);
  }

  /**
   * Unmute audio
   */
  unmute(): void {
    this._isMuted = false;
    // Unmute both audio elements
    this.audioElements[0].muted = false;
    this.audioElements[1].muted = false;
    // Restore gain
    this.applyVolume(this._volume);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    if (this._isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this._isMuted;
  }

  /**
   * Check if muted
   */
  get isMuted(): boolean {
    return this._isMuted;
  }

  /**
   * Apply volume to active gain node
   */
  private applyVolume(value: number): void {
    const gainNode = this.gainNodes[this.activeIndex];
    if (gainNode && this.audioContext) {
      try {
        gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
      } catch (e) {
        // Fallback if audio context is suspended
        gainNode.gain.value = value;
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.audioElements.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.isInitialized = false;
  }

  /**
   * Add event listener to active audio element
   */
  addEventListener(event: string, handler: EventListener): void {
    this.audioElements[this.activeIndex].addEventListener(event, handler);
  }

  /**
   * Remove event listener from active audio element
   */
  removeEventListener(event: string, handler: EventListener): void {
    this.audioElements[this.activeIndex].removeEventListener(event, handler);
  }
}
