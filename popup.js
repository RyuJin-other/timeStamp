// State Management
const state = {
  ntpServer: "pool.ntp.org",
  syncInterval: 60,
  serverTime: null,
  lastSync: null,
  timeOffset: null,
  isAutoSync: false,
  countdown: 0,
  isSyncing: false,
};

let clockInterval;
let countdownInterval;

// DOM Elements
const elements = {
  serverTime: document.getElementById("serverTime"),
  pcTime: document.getElementById("pcTime"),
  status: document.getElementById("status"),
  syncBtn: document.getElementById("syncBtn"),
  syncBtnText: document.getElementById("syncBtnText"),
  autoBtn: document.getElementById("autoBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  modalOverlay: document.getElementById("modalOverlay"),
  closeModal: document.getElementById("closeModal"),
  ntpInput: document.getElementById("ntpInput"),
  intervalInput: document.getElementById("intervalInput"),
  saveStatus: document.getElementById("saveStatus"),
};

// Load settings from chrome.storage (Chrome & Edge compatible)
function loadSettings() {
  const browserAPI =
    typeof chrome !== "undefined"
      ? chrome
      : typeof browser !== "undefined"
      ? browser
      : null;

  if (browserAPI && browserAPI.storage) {
    browserAPI.storage.local.get(["ntpServer", "syncInterval"], (result) => {
      state.ntpServer = result.ntpServer || "pool.ntp.org";
      state.syncInterval = result.syncInterval || 60;
      elements.ntpInput.value = state.ntpServer;
      elements.intervalInput.value = state.syncInterval;
    });
  } else {
    // Fallback for testing outside extension
    elements.ntpInput.value = state.ntpServer;
    elements.intervalInput.value = state.syncInterval;
  }
}

// Save settings to chrome.storage (Chrome & Edge compatible)
function saveSettings() {
  const settings = {
    ntpServer: state.ntpServer,
    syncInterval: state.syncInterval,
  };

  const browserAPI =
    typeof chrome !== "undefined"
      ? chrome
      : typeof browser !== "undefined"
      ? browser
      : null;

  if (browserAPI && browserAPI.storage) {
    browserAPI.storage.local.set(settings);
  }

  showSaveStatus();
}

function showSaveStatus() {
  elements.saveStatus.textContent = "✓ Saved";
  setTimeout(() => {
    elements.saveStatus.textContent = "";
  }, 1000);
}

// Format time
function formatTime(date) {
  if (!date) return "--:--:-- | Not synchronized yet";

  const options = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleString("en-US", options).replace(",", " |");
}

function formatTimeUTC(date) {
  if (!date) return "--:--:-- | Not synchronized yet";
  const options = {
    timeZone: "UTC",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options).replace(",", " |");
}

// Update clock
function updateClock() {
  const now = new Date();
  elements.pcTime.textContent = formatTime(now);

  if (state.timeOffset !== null && state.lastSync !== null) {
    const elapsed = (now - state.lastSync) / 1000;
    const serverTime = new Date(
      state.lastSync.getTime() + (elapsed + state.timeOffset) * 1000
    );
    elements.serverTime.textContent = formatTimeUTC(serverTime);
  }

  if (state.isAutoSync && state.countdown > 0) {
    state.countdown--;
    const mins = Math.floor(state.countdown / 60);
    const secs = state.countdown % 60;
    elements.autoBtn.textContent =
      mins > 0 ? `Auto (${mins}m ${secs}s)` : `Auto (${secs}s)`;

    if (state.countdown === 0) {
      syncNow(true);
      state.countdown = state.syncInterval;
    }
  }
}

// Set status
function setStatus(text, color) {
  elements.status.textContent = text;
  elements.status.style.color = color;
}

// Sync with time server
async function syncNow(silent = false) {
  if (!silent) {
    state.isSyncing = true;
    elements.syncBtn.disabled = true;
    elements.syncBtnText.textContent = "Syncing...";
    elements.syncBtn.querySelector(".icon").classList.add("spinner");
    setStatus("● Connecting to server...", "#ffc107");
  }

  try {
    let serverDateTime = null;
    let usedMethod = "";

    // Method 1: WorldTimeAPI
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
          "https://worldtimeapi.org/api/timezone/Etc/UTC",
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          serverDateTime = new Date(data.unixtime * 1000);
          usedMethod = "WorldTimeAPI";
        }
      } catch (e) {
        console.log("WorldTimeAPI failed");
      }
    }

    // Method 2: NIST (via HTTP Header) - MODIFIKASI BARU
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        // Fetching www.nist.gov untuk mengambil Date header resmi NIST
        const response = await fetch("https://www.nist.gov", {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          serverDateTime = new Date(dateHeader);
          usedMethod = "NIST (nist.gov)";
        }
      } catch (e) {
        console.log("NIST failed:", e.message);
      }
    }

    // Method 3: TimeAPI.io
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
          "https://timeapi.io/api/time/current/zone?timeZone=UTC",
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          serverDateTime = new Date(data.dateTime + "Z");
          usedMethod = "TimeAPI.io";
        }
      } catch (e) {
        console.log("TimeAPI.io failed");
      }
    }

    // Method 4: HTTP Header from Google (Fallback)
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch("https://www.google.com", {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          serverDateTime = new Date(dateHeader);
          usedMethod = "Google Header";
        }
      } catch (e) {
        console.log("HTTP Header failed");
      }
    }

    // ... sisa kode syncNow sama seperti sebelumnya ...
    if (serverDateTime) {
      const localDateTime = new Date();
      const offset = (serverDateTime - localDateTime) / 1000;
      state.timeOffset = offset;
      state.lastSync = localDateTime;
      const diff = Math.abs(offset);
      if (diff < 1) {
        setStatus(
          '● Synced perfectly',
          "#00af7bff"
        );
      } else {
        setStatus(
          `● Time diff: ${diff.toFixed(3)}s via ${usedMethod}`,
          "#ff9800"
        );
      }
    } else {
      throw new Error("All servers failed");
    }
  } catch (error) {
    setStatus("● Sync failed", "#f44336");
    console.error(error);
  } finally {
    if (!silent) {
      state.isSyncing = false;
      elements.syncBtn.disabled = false;
      elements.syncBtnText.textContent = "Sync Now";
      elements.syncBtn.querySelector(".icon").classList.remove("spinner");
    }
  }
}

// Toggle auto sync
function toggleAutoSync() {
  if (!state.isAutoSync) {
    state.isAutoSync = true;
    state.countdown = state.syncInterval;
    elements.autoBtn.classList.remove("btn-outline");
    elements.autoBtn.classList.add("btn-success");
    syncNow(true);
  } else {
    state.isAutoSync = false;
    state.countdown = 0;
    elements.autoBtn.classList.remove("btn-success");
    elements.autoBtn.classList.add("btn-outline");
    elements.autoBtn.textContent = "Auto Sync";
  }
}

// Event Listeners
elements.syncBtn.addEventListener("click", () => syncNow(false));
elements.autoBtn.addEventListener("click", toggleAutoSync);
elements.settingsBtn.addEventListener("click", () => {
  elements.modalOverlay.classList.add("active");
});
elements.closeModal.addEventListener("click", () => {
  elements.modalOverlay.classList.remove("active");
});
elements.modalOverlay.addEventListener("click", (e) => {
  if (e.target === elements.modalOverlay) {
    elements.modalOverlay.classList.remove("active");
  }
});

// Detach button - Open in separate window (Chrome & Edge compatible)
document.getElementById("detachBtn").addEventListener("click", () => {
  // Check if browser API is available (works for both Chrome and Edge)
  const browserAPI =
    typeof chrome !== "undefined"
      ? chrome
      : typeof browser !== "undefined"
      ? browser
      : null;

  if (browserAPI && browserAPI.windows) {
    browserAPI.windows.create(
      {
        url: browserAPI.runtime.getURL("window.html"),
        type: "popup",
        width: 400,
        height: 320,
        left: 100,
        top: 100,
        focused: true,
      },
      (newWindow) => {
        console.log("Window created:", newWindow);
        // Close the popup after opening detached window
        setTimeout(() => {
          if (window.close) {
            window.close();
          }
        }, 100);
      }
    );
  } else {
    // Fallback for testing outside extension or unsupported browser
    const newWin = window.open(
      "window.html",
      "TimeSyncWindow",
      "width=400,height=320,left=100,top=100"
    );
    if (!newWin) {
      alert("Please allow popups for this extension");
    }
  }
});

// Settings input handlers
elements.ntpInput.addEventListener("input", (e) => {
  state.ntpServer = e.target.value;
  saveSettings();
});

elements.intervalInput.addEventListener("input", (e) => {
  const value = parseInt(e.target.value) || 60;
  state.syncInterval = Math.max(10, value);
  saveSettings();
});

// Quick select buttons
document.querySelectorAll(".quick-select-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const server = e.currentTarget.getAttribute("data-server");
    state.ntpServer = server;
    elements.ntpInput.value = server;
    saveSettings();
    // Show visual feedback
    setStatus(`● Syncing with reference to ${server}...`, "#ffc107");
    // Always re-sync when server changes
    setTimeout(() => syncNow(true), 500);
  });
});

// Initialize
loadSettings();
clockInterval = setInterval(updateClock, 1000);
updateClock();
