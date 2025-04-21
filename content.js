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
    const sensitivity = settings.sensitivity || 2; // Default value is 2
    const frequency = settings.frequency || 200; // Default value is 200 Hz
    const rewind = settings.rewind || 2; // Default value is 2 seconds

    // Add a high-pass filter
    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass"; // High-pass filter
    filter.frequency.value = frequency; // Set filter frequency

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    analyser.fftSize = 256;
    microphone.connect(filter); // Connect microphone to the filter
    filter.connect(analyser); // Connect filter to the analyser

    let isSpeaking = false;
    let silenceTimeout;

    function detectVoice() {
      analyser.getByteFrequencyData(dataArray);
      let volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      if (volume > sensitivity) {
        if (!isSpeaking) {
          isSpeaking = true;
          if (!video.paused) {
            video.pause();
            console.log("Video paused (sound detected)");
          }
        }
        clearTimeout(silenceTimeout);
      } else {
        if (isSpeaking) {
          isSpeaking = false;
          silenceTimeout = setTimeout(() => {
            if (!isSpeaking) {
              // Rewind video before resuming playback
              video.currentTime = Math.max(0, video.currentTime - rewind);
              video.play();
              console.log(`Video resumed (rewound by ${rewind} seconds)`);
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