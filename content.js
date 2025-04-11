(async function () {
  const video = document.querySelector("video");
  console.log("Run Youtube Voice Pause Script");

  if (!video) {
    console.error("Nie znaleziono wideo na stronie.");
    return;
  } else {
    console.log("Znaleziono wideo na stronie.");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    let isSpeaking = false;
    let silenceTimeout;

    function detectVoice() {
      analyser.getByteFrequencyData(dataArray);
      let volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      if (volume > 2) {
        if (!isSpeaking) {
          isSpeaking = true;
          if (!video.paused) {
            video.pause();
            console.log("Film wstrzymany (wykryto dźwięk)");
          }
        }
        clearTimeout(silenceTimeout);
      } else {
        if (isSpeaking) {
          isSpeaking = false;
          silenceTimeout = setTimeout(() => {
            if (!isSpeaking) {
              video.play();
              console.log("Film wznowiony (cisza przez 1.8 sekundy)");
            }
          }, 1800);
        }
      }

      requestAnimationFrame(detectVoice);
    }

    detectVoice();
  } catch (error) {
    console.error("Błąd dostępu do mikrofonu:", error);
  }
})();
