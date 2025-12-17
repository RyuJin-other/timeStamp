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

// Load settings
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

    // Listen for changes from popup
    browserAPI.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (changes.ntpServer) state.ntpServer = changes.ntpServer.newValue;
        if (changes.syncInterval)
          state.syncInterval = changes.syncInterval.newValue;
      }
    });
  } else {
    elements.ntpInput.value = state.ntpServer;
    elements.intervalInput.value = state.syncInterval;
  }
}

// ... kode window.js sebelumnya (loadSettings, syncNow, dll) ...

// ==========================================
// FITUR PENGUNCI UKURAN WINDOW (RESIZE LOCK)
// ==========================================
const FIXED_WIDTH = 420;
const FIXED_HEIGHT = 210;

// 1. Paksa ukuran saat pertama kali load (untuk memastikan)
window.addEventListener("load", () => {
  window.resizeTo(FIXED_WIDTH, FIXED_HEIGHT);
});

// 2. Event Listener: Jika user mencoba resize, kembalikan ukurannya
window.addEventListener("resize", () => {
  // Cek apakah ukuran berubah dari yang seharusnya
  if (
    window.outerWidth !== FIXED_WIDTH ||
    window.outerHeight !== FIXED_HEIGHT
  ) {
    // Kembalikan paksa ke ukuran fix
    window.resizeTo(FIXED_WIDTH, FIXED_HEIGHT);
  }
});

// Initialize
loadSettings();
clockInterval = setInterval(updateClock, 1000);
updateClock();
setTimeout(() => syncNow(true), 500);

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

function updateClock() {
  const now = new Date();
  elements.pcTime.textContent = formatTime(now);

  if (state.timeOffset !== null && state.lastSync !== null) {
    const elapsed = (now - state.lastSync) / 1000;
    const serverTime = new Date(
      state.lastSync.getTime() + (elapsed + state.timeOffset) * 1000
    );
    elements.serverTime.textContent = formatTimeUTC(serverTime);
    // elements.serverTime.textContent = serverTime.toUTCString();
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

function setStatus(text, color) {
  elements.status.textContent = text;
  elements.status.style.color = color;
}

// Main Sync Function (Updated with NIST)
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

    // 1. WorldTimeAPI
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
          "https://worldtimeapi.org/api/timezone/Etc/UTC",
          { signal: controller.signal }
        );
        clearTimeout(id);
        if (response.ok) {
          const data = await response.json();
          serverDateTime = new Date(data.unixtime * 1000);
          usedMethod = "WorldTimeAPI";
        }
      } catch (e) {
        console.log("WorldTimeAPI failed");
      }
    }

    // 2. NIST (via HTTP Header on nist.gov) - MODIFIED: NEW FEATURE
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        // Fetching from nist.gov using HEAD method to get the Date header
        const response = await fetch("https://www.nist.gov/zone?timeZone=UTC", {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(id);
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          serverDateTime = new Date(dateHeader);
          usedMethod = "NIST (nist.gov)";
        }
      } catch (e) {
        console.log("NIST failed:", e.message);
      }
    }

    // 3. TimeAPI.io
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
          "https://timeapi.io/api/time/current/zone?timeZone=UTC",
          { signal: controller.signal }
        );
        clearTimeout(id);
        if (response.ok) {
          const data = await response.json();
          serverDateTime = new Date(data.dateTime + "Z");
          usedMethod = "TimeAPI.io";
        }
      } catch (e) {
        console.log("TimeAPI failed");
      }
    }

    // 4. Google (Fallback)
    if (!serverDateTime) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const response = await fetch("https://www.google.com", {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(id);
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          serverDateTime = new Date(dateHeader);
          usedMethod = "Google Header";
        }
      } catch (e) {
        console.log("Google failed");
      }
    }

    if (serverDateTime) {
      const localDateTime = new Date();
      const offset = (serverDateTime - localDateTime) / 1000;
      state.timeOffset = offset;
      state.lastSync = localDateTime;
      const diff = Math.abs(offset);

      if (diff < 1) {
        setStatus(`● Synced Perfectly`, "#00af7bff");
      } else {
        setStatus(
          `● Time diff: ${diff.toFixed(1)}s via ${usedMethod}`,
          "#ff9800"
        );
      }
    } else {
      throw new Error("All servers failed");
    }
  } catch (error) {
    setStatus("● Sync failed. Check internet connection.", "#f44336");
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
elements.settingsBtn.addEventListener("click", () =>
  elements.modalOverlay.classList.add("active")
);
elements.closeModal.addEventListener("click", () =>
  elements.modalOverlay.classList.remove("active")
);
elements.modalOverlay.addEventListener("click", (e) => {
  if (e.target === elements.modalOverlay)
    elements.modalOverlay.classList.remove("active");
});

// Settings Inputs
elements.ntpInput.addEventListener("input", (e) => {
  state.ntpServer = e.target.value;
  saveSettings();
});
elements.intervalInput.addEventListener("input", (e) => {
  state.syncInterval = Math.max(10, parseInt(e.target.value) || 60);
  saveSettings();
});
document.querySelectorAll(".quick-select-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const server = e.currentTarget.getAttribute("data-server");
    state.ntpServer = server;
    elements.ntpInput.value = server;
    saveSettings();
    setStatus(`● Syncing with reference to ${server}...`, "#ffc107");
    setTimeout(() => syncNow(true), 500);
  });
});

// Initialize
loadSettings();
clockInterval = setInterval(updateClock, 1000);
updateClock();
// Initial sync on window load
setTimeout(() => syncNow(true), 500);
