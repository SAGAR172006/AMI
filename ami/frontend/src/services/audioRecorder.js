/**
 * Converts any browser audio Blob (WebM, Opus, MP4, etc.) to standard 16-bit PCM WAV (audio/wav).
 * Required because speech-to-text engines like Gnani Prisma reject audio/webm format.
 */
export async function audioBlobToWav(audioBlob) {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = 1; // mono is ideal for STT
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const numSamples = channelData.length;

    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true);              // BlockAlign
    view.setUint16(34, 16, true);                           // BitsPerSample

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // PCM samples (16-bit signed integer)
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    try {
      audioCtx.close();
    } catch {}

    return new Blob([view], { type: 'audio/wav' });
  } catch (err) {
    console.warn('[audioBlobToWav] In-browser WAV conversion failed, falling back to original blob:', err);
    return audioBlob;
  }
}

/**
 * Robust in-browser Audio Recorder using MediaRecorder API.
 * Captures audio and outputs standard WAV format for Gnani Prisma STT.
 */
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.startTime = null;
    this.silenceTimer = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.rafId = null;
  }

  /**
   * Starts recording from the microphone
   * @param {Object} options
   * @param {Function} options.onTick - Callback receiving elapsed seconds
   * @param {Function} options.onSilence - Callback triggered on prolonged silence (optional)
   */
  async start({ onTick, onSilence } = {}) {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser environment.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied. Please allow microphone access in browser settings.');
      }
      throw new Error(`Microphone access error: ${err.message || 'Device not ready'}`);
    }

    this.audioChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Slice chunks every 250ms
    this.startTime = Date.now();

    // Elapsed timer loop
    if (onTick) {
      this.timerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
        onTick(elapsedSec);
      }, 500);
    }

    // Optional silence detection via Web Audio Analyser
    if (onSilence && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        let consecutiveSilenceFrames = 0;
        const silenceThreshold = 6; // Volume floor
        const framesBeforeSilenceStop = 180; // ~3 seconds of silence at 60fps

        const checkAudioLevel = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          // Only consider silence after at least 3 seconds of speaking
          const elapsed = (Date.now() - this.startTime) / 1000;
          if (elapsed > 3.5) {
            if (avg < silenceThreshold) {
              consecutiveSilenceFrames++;
              if (consecutiveSilenceFrames > framesBeforeSilenceStop) {
                onSilence();
                return;
              }
            } else {
              consecutiveSilenceFrames = 0;
            }
          }

          this.rafId = requestAnimationFrame(checkAudioLevel);
        };

        this.rafId = requestAnimationFrame(checkAudioLevel);
      } catch (e) {
        console.warn('[AudioRecorder] Silence detector setup skipped:', e);
      }
    }
  }

  /**
   * Stops recording and returns the compiled audio Blob and duration
   * @returns {Promise<{ blob: Blob, duration: number, mimeType: string }>}
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder is not active.'));
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.audioContext) {
        this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }

      const duration = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0;

      this.mediaRecorder.onstop = async () => {
        const rawMimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const rawBlob = new Blob(this.audioChunks, { type: rawMimeType });

        // Clean up audio tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        // Convert raw WebM/Opus to standard 16-bit PCM WAV for Gnani STT
        const wavBlob = await audioBlobToWav(rawBlob);
        resolve({ blob: wavBlob, duration, mimeType: wavBlob.type || 'audio/wav' });
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Aborts current recording without saving
   */
  cancel() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.audioContext) this.audioContext.close().catch(() => {});
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
