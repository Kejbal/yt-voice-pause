document.addEventListener("DOMContentLoaded", () => {
    const sensitivityInput = document.getElementById("sensitivity");
    const frequencyInput = document.getElementById("frequency");
    const rewindInput = document.getElementById("rewind");
    const saveButton = document.getElementById("save");
  
    // Load saved settings
    browser.storage.sync.get(["sensitivity", "frequency", "rewind"]).then((result) => {
      sensitivityInput.value = result.sensitivity || 15; // Default value is 15
      frequencyInput.value = result.frequency || 200; // Default value is 200 Hz
      rewindInput.value = result.rewind || 1; // Default value is 1 seconds
    });
  
    // Save settings
    saveButton.addEventListener("click", () => {
      const sensitivity = parseInt(sensitivityInput.value, 10);
      const frequency = parseInt(frequencyInput.value, 10);
      const rewind = parseInt(rewindInput.value, 10);
  
      browser.storage.sync.set({ sensitivity, frequency, rewind }).then(() => {
        alert("Settings saved!");
      });
    });
  });