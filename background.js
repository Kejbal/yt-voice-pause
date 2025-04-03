browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("youtube.com/watch")) {
    browser.tabs.executeScript(tabId, { file: "content.js" });
  }
});
