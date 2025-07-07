if (window.ytVoicePauseLoaded) {
  console.log("YT Voice Pause already loaded, skipping...");
} else {
  window.ytVoicePauseLoaded = true;

  (async function () {
    const video = document.querySelector("video");
    console.log("Run Youtube Voice Pause Script");

    if (!video) {
      console.error("No video found on the page.");
      return;
    } else {
      console.log("Video found on the page.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      // Retrieve sensitivity, frequency, and rewind settings
      const settings = await browser.storage.sync.get(["sensitivity", "frequency", "rewind"]);
      const sensitivity = settings.sensitivity || 15; // Default value is 20
      const frequency = settings.frequency || 200; // Default value is 200 Hz
      const rewind = settings.rewind || 1; // Default value is 1 seconds

      // Add a band-pass filter to focus on human voice frequencies
      const filter = audioContext.createBiquadFilter();
      filter.type = "bandpass"; // Band-pass filter
      filter.frequency.value = 170; // Center frequency (typical for human voice)
      filter.Q = 1; // Quality factor (controls bandwidth)

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyser.fftSize = 256;
      microphone.connect(filter); // Connect microphone to the filter
      filter.connect(analyser); // Connect filter to the analyser

      let isSpeaking = false;
      let silenceTimeout;
      let pauseTime = null;

      function detectVoice() {
        analyser.getByteFrequencyData(dataArray);
        // Calculate RMS (Root Mean Square) for a more stable volume measurement
        const rms = Math.sqrt(
          dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length
        );
        //console.log(rms, sensitivity, frequency, rewind);
        if (rms > sensitivity) {
          if (!isSpeaking) {
            isSpeaking = true;
            if (!video.paused) {
              video.pause();
              pauseTime = video.currentTime; // Save pause time
              console.log("Video paused (sound detected)");
            }
          }
          clearTimeout(silenceTimeout); // Cancel any pending resume
        } else {
          if (isSpeaking) {
            isSpeaking = false;
            clearTimeout(silenceTimeout); // Cancel previous timeout if any
            silenceTimeout = setTimeout(() => {
              if (!isSpeaking) {
                // Use saved pause time for precise rewind
                video.currentTime = Math.max(0, (pauseTime || video.currentTime) - rewind);
                video.play();
                console.log(`Video resumed (rewound by ${rewind} seconds)`);
                pauseTime = null; // Reset pauseTime after resume
              }
            }, 1800);
          }
        }

        requestAnimationFrame(detectVoice);
      }

      detectVoice();
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  })();
}
