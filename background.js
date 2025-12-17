// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Time Sync installed");
  // Set default settings saat instalasi
  chrome.storage.local.get(["ntpServer", "syncInterval"], (result) => {
    if (!result.ntpServer) {
      chrome.storage.local.set({
        ntpServer: "pool.ntp.org",
        syncInterval: 60,
      });
    }
  });
});
