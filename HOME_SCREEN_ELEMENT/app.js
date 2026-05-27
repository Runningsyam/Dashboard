// Global Dashboard State
const state = {
  // Volume HUD
  volume: 50,
  volumeTimer: null,

  // Screen Sleep State
  isSleep: false,
  clockTimer: null,

  // Music Player State
  isPlaying: false,
  playbackInterval: null,
  currentTrackIndex: 0,
  tracks: [
    {
      title: "All i ask",
      artist: "Adele Album 21",
      art: "./Album Art.png",
      progress: 35
    },
    {
      title: "Midnight Drive",
      artist: "Cyber Synthwave",
      art: "./Component 2.png",
      progress: 10
    },
    {
      title: "Autopilot Cruise",
      artist: "Electronic Horizon",
      art: "./Charging Icon Background.png",
      progress: 0
    }
  ],

  // Climate Control
  driverTemp: 19,
  passengerTemp: 19,
  fanSpeedIndex: 0, // 0 = Off, 1 = Low, 2 = Medium, 3 = High, 4 = Max
  fanSpeeds: ['0s', '4s', '2s', '0.8s', '0.4s'],

  // Autopilot
  autopilotActive: false,

  // Map Controls
  zoomLevel: 1.5,
  mapOffsetX: 0,
  mapOffsetY: 0,
  isDraggingMap: false,
  dragStartX: 0,
  dragStartY: 0,
  ecoMode: false,

  // Tire Pressure State (FL, FR, RL, RR)
  tirePressures: {
    fl: 25,
    fr: 25,
    rl: 25,
    rr: 25
  },

  // Wi-Fi settings state
  wifiEnabled: true,
  connectedWifi: "Samarahan_Highspeed_5G",
  selectedWifiToConnect: "",

  // Bluetooth settings state
  bluetoothEnabled: true,
  bluetoothDevices: [
    { name: "USER's iPhone", type: "phone", connected: true },
    { name: "Sony WH-1000XM4", type: "headphones", connected: false },
    { name: "My Apple Watch", type: "watch", connected: false },
    { name: "Office MacBook Pro", type: "laptop", connected: false },
    { name: "AirPods Pro", type: "headphones", connected: false }
  ],

  // Car Door status state (false = closed/locked, true = open)
  carDoors: {
    fl: false,
    fr: false,
    rl: false,
    rr: false,
    frunk: false,
    trunk: false
  },

  // EV Charge Limit (50% to 100%, default 80% for daily usage)
  chargeLimit: 80,
  batteryPct: 28,
  batteryCharging: false,
  profilePicture: null,

  // Map Navigation State
  navZoomLevel: 1.5,
  navMapOffsetX: 0,
  navMapOffsetY: 0,
  isDraggingNavMap: false,
  navDragStartX: 0,
  navDragStartY: 0,
  navActiveRouteIndex: 0,
  selectedDest: null,
  navSimulationTimer: null,
  navProgressStep: 0,
  isNavigating: false,
  navPointsArray: [],
  navRemainingTime: 0,
  navRemainingDist: 0
};

// Initialize Dashboard once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initMapDrag();
  initNavMapDrag();
  initNavClickHandlers();
  renderMapPins();
  updateTirePressureUI();
  updateGlobalBatteryUI(state.batteryPct);
  
  // Set initial charge limit
  adjustChargeLimit(state.chargeLimit);
  
  // Set initial fan speed css
  document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[state.fanSpeedIndex]);
  
  // Start the notification system
  initNotifications();
  renderNotificationPanelList();
  updateNotificationBadge();

  // Background battery drain loop (1% every 15 seconds if not charging and screen is not sleep)
  setInterval(() => {
    if (!state.batteryCharging && !state.isSleep && state.batteryPct > 3) {
      state.batteryPct--;
      updateGlobalBatteryUI(state.batteryPct);
    }
  }, 15000);
});

/* ==========================================================================
   1. SLEEP MODE / POWER ON-OFF
   ========================================================================== */
function toggleScreenSleep() {
  const overlay = document.getElementById("sleep-overlay");
  state.isSleep = !state.isSleep;
  
  if (state.isSleep) {
    overlay.classList.add("active");
    updateClockDisplay();
  } else {
    overlay.classList.remove("active");
  }
}

function updateClockDisplay() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  
  // Format leading zeros
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();
  
  const clockEl = document.getElementById("sleep-clock");
  const dateEl = document.getElementById("sleep-date");
  const topbarClock = document.getElementById("topbar-clock");
  
  if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
  if (dateEl) dateEl.textContent = `${dayName}, ${monthName} ${dateNum}`;
  if (topbarClock) topbarClock.textContent = `${hours}:${minutes}`;
}

function initClock() {
  updateClockDisplay();
  // Update time every second for active accuracy
  setInterval(updateClockDisplay, 1000);
}

/* ==========================================================================
   2. VOLUME CONTROLS (HUD OVERLAY)
   ========================================================================== */
function adjustVolume(change) {
  state.volume = Math.max(0, Math.min(100, state.volume + change));
  
  const hud = document.getElementById("volume-hud");
  const valText = document.getElementById("volume-hud-val");
  const fillBar = document.getElementById("volume-hud-bar");
  
  if (valText) valText.textContent = state.volume;
  if (fillBar) fillBar.style.width = `${state.volume}%`;
  
  // Sync settings sound volume slider if visible
  const settingsVol = document.getElementById("settings-sound-volume");
  const settingsVolVal = document.getElementById("settings-volume-val");
  if (settingsVol) settingsVol.value = state.volume;
  if (settingsVolVal) settingsVolVal.textContent = state.volume;
  
  // Activate volume HUD
  if (hud) hud.classList.add("active");
  
  // Clear existing timer and set a new one
  if (state.volumeTimer) clearTimeout(state.volumeTimer);
  
  state.volumeTimer = setTimeout(() => {
    if (hud) hud.classList.remove("active");
  }, 2000);
}

/* ==========================================================================
   3. MUSIC PLAYER INTERACTIONS
   ========================================================================== */
function updateMusicCardUI() {
  const track = state.tracks[state.currentTrackIndex];
  
  document.getElementById("song-title").textContent = track.title;
  document.getElementById("song-artist").textContent = track.artist;
  document.getElementById("album-art").src = track.art;
  document.getElementById("music-slider").value = track.progress;
  
  // Sync topbar music player
  const topbarInfo = document.getElementById("topbar-music-info");
  const topbarSlider = document.getElementById("topbar-music-slider");
  if (topbarInfo) {
    topbarInfo.textContent = `${track.title} • ${track.artist}`;
  }
  if (topbarSlider) {
    topbarSlider.value = track.progress;
  }
  
  // Update blurred background
  const blurBg = document.getElementById("music-blur-bg");
  if (blurBg) {
    blurBg.style.backgroundImage = `url("${track.art}")`;
  }
  
  // Update play/pause icon svg content
  const playPauseSvg = document.getElementById("play-pause-svg");
  if (playPauseSvg) {
    if (state.isPlaying) {
      // Show Pause icon
      playPauseSvg.innerHTML = `
        <rect x="6" y="4" width="4" height="16" rx="1"></rect>
        <rect x="14" y="4" width="4" height="16" rx="1"></rect>
      `;
    } else {
      // Show Play icon
      playPauseSvg.innerHTML = `
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      `;
    }
  }
  
  // If track art is playing, update classes
  const artImg = document.getElementById("album-art");
  if (state.isPlaying) {
    artImg.classList.add("playing");
  } else {
    artImg.classList.remove("playing");
  }
}

function togglePlayPause() {
  state.isPlaying = !state.isPlaying;
  const artImg = document.getElementById("album-art");
  
  if (state.isPlaying) {
    artImg.classList.add("playing");
    startPlaybackSimulation();
  } else {
    artImg.classList.remove("playing");
    stopPlaybackSimulation();
  }
  updateMusicCardUI();
}

function startPlaybackSimulation() {
  if (state.playbackInterval) clearInterval(state.playbackInterval);
  
  state.playbackInterval = setInterval(() => {
    const track = state.tracks[state.currentTrackIndex];
    track.progress = (track.progress + 0.5) % 100;
    document.getElementById("music-slider").value = track.progress;
    
    const topbarSlider = document.getElementById("topbar-music-slider");
    if (topbarSlider) {
      topbarSlider.value = track.progress;
    }
    
    // Auto loop track
    if (track.progress === 0) {
      nextSong();
    }
  }, 200);
}

function stopPlaybackSimulation() {
  if (state.playbackInterval) {
    clearInterval(state.playbackInterval);
    state.playbackInterval = null;
  }
}

function seekMusic(val) {
  state.tracks[state.currentTrackIndex].progress = parseFloat(val);
  const mainSlider = document.getElementById("music-slider");
  const topbarSlider = document.getElementById("topbar-music-slider");
  if (mainSlider) mainSlider.value = val;
  if (topbarSlider) topbarSlider.value = val;
}

function nextSong() {
  // Save current progress before resetting it
  state.tracks[state.currentTrackIndex].progress = 0;
  
  state.currentTrackIndex = (state.currentTrackIndex + 1) % state.tracks.length;
  updateMusicCardUI();
}

function prevSong() {
  state.tracks[state.currentTrackIndex].progress = 0;
  
  state.currentTrackIndex = (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length;
  updateMusicCardUI();
}

/* ==========================================================================
   4. CLIMATE SYSTEM
   ========================================================================== */
function adjustTemp(zone, change) {
  // Turn off climate auto mode if temperatures are adjusted manually
  const autoBtn = document.getElementById("btn-climate-auto");
  if (autoBtn && autoBtn.classList.contains("active")) {
    autoBtn.classList.remove("active");
    if (state.climateAutoInterval) {
      clearInterval(state.climateAutoInterval);
      state.climateAutoInterval = null;
    }
  }

  if (zone === 'driver') {
    state.driverTemp = Math.max(15, Math.min(30, state.driverTemp + change));
    document.getElementById("temp-driver").textContent = `${state.driverTemp} °c`;
  } else {
    state.passengerTemp = Math.max(15, Math.min(30, state.passengerTemp + change));
    document.getElementById("temp-passenger").textContent = `${state.passengerTemp} °c`;
  }
}

function cycleFanSpeed() {
  state.fanSpeedIndex = (state.fanSpeedIndex + 1) % state.fanSpeeds.length;
  
  // Set CSS property
  document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[state.fanSpeedIndex]);
  
  // Visual indicators
  const fanImg = document.getElementById("fan-blades-img");
  if (state.fanSpeedIndex === 0) {
    fanImg.style.opacity = "0.4";
  } else {
    fanImg.style.opacity = "1";
    
    // Pulsate background flash on change
    fanImg.parentNode.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
    setTimeout(() => {
      fanImg.parentNode.style.backgroundColor = "";
    }, 200);
  }
}

/* ==========================================================================
   5. MAP DRAGGING, ECO & ZOOM
   ========================================================================== */
function initMapDrag() {
  const mapBg = document.getElementById("map-bg");
  
  // Set default background position / scale
  updateMapTransform();
  
  mapBg.addEventListener("mousedown", (e) => {
    state.isDraggingMap = true;
    state.dragStartX = e.clientX - state.mapOffsetX;
    state.dragStartY = e.clientY - state.mapOffsetY;
    mapBg.style.transition = "none"; // Disable animation while dragging
  });
  
  window.addEventListener("mousemove", (e) => {
    if (!state.isDraggingMap) return;
    
    const newX = e.clientX - state.dragStartX;
    const newY = e.clientY - state.dragStartY;
    
    const mapCard = document.getElementById("map-card");
    const w = mapCard.clientWidth || 500;
    const h = mapCard.clientHeight || 300;
    
    const maxDragX = Math.max(0, (state.zoomLevel - 1) * w / 2);
    const maxDragY = Math.max(0, (state.zoomLevel - 1) * h / 2);
    
    state.mapOffsetX = Math.max(-maxDragX, Math.min(maxDragX, newX));
    state.mapOffsetY = Math.max(-maxDragY, Math.min(maxDragY, newY));
    
    updateMapTransform();
  });
  
  window.addEventListener("mouseup", () => {
    if (state.isDraggingMap) {
      state.isDraggingMap = false;
      mapBg.style.transition = "transform 0.3s ease-out";
    }
  });
}

function updateMapTransform() {
  const mapBg = document.getElementById("map-bg");
  mapBg.style.transform = `translate(${state.mapOffsetX}px, ${state.mapOffsetY}px) scale(${state.zoomLevel})`;
}

function zoomMap(direction) {
  state.zoomLevel = Math.max(1.3, Math.min(3.0, state.zoomLevel + (direction * 0.25)));
  document.getElementById("map-bg").style.transition = "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)";
  updateMapTransform();
}

function resetMapOrientation() {
  state.zoomLevel = 1.5;
  state.mapOffsetX = 0;
  state.mapOffsetY = 0;
  document.getElementById("map-bg").style.transition = "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
  updateMapTransform();
  
  // Animate eco badge button flash as a feedback
  const compass = document.querySelector(".map-btn img");
  compass.style.transform = "rotate(360deg)";
  setTimeout(() => {
    compass.style.transform = "";
  }, 500);
}

function toggleEcoMode() {
  state.ecoMode = !state.ecoMode;
  const ecoBadge = document.getElementById("eco-badge-btn");
  
  if (state.ecoMode) {
    ecoBadge.style.backgroundColor = "#00e676";
    ecoBadge.style.color = "white";
    ecoBadge.style.fontWeight = "bold";
    ecoBadge.style.boxShadow = "0 0 12px rgba(0,230,118,0.5)";
  } else {
    ecoBadge.style.backgroundColor = "";
    ecoBadge.style.color = "";
    ecoBadge.style.fontWeight = "";
    ecoBadge.style.boxShadow = "";
  }
}

function triggerMapSearch() {
  const query = prompt("Search for destination:", "Jalan Kota Samarahan");
  if (query) {
    document.getElementById("nav-street-text").textContent = query;
    document.getElementById("nav-distance-text").textContent = (Math.floor(Math.random() * 15) + 1) + "km";
    
    // Simulate navigation route recalculate animation
    const navPanel = document.getElementById("nav-panel");
    navPanel.style.transform = "scale(0.95)";
    setTimeout(() => {
      navPanel.style.transform = "scale(1)";
    }, 200);
  }
}

function simulateNavigation() {
  openNavigationModal();
}

/* ==========================================================================
   6. BATTERY & CHARGING STATES
   ========================================================================== */
let batteryCharging = false;
let batteryChargeInterval = null;

function updateChargingSpecs(pct) {
  const specsContainer = document.getElementById("battery-charging-specs");
  const subText = document.getElementById("battery-details-sub");
  
  if (!specsContainer || !subText) return;
  
  if (batteryCharging) {
    // 1. Calculate tapering charging power (kW)
    let rate;
    if (pct < 40) {
      rate = 250 - Math.round((pct / 40) * 30); // 250 to 220 kW
    } else if (pct < 70) {
      rate = 220 - Math.round(((pct - 40) / 30) * 100); // 220 to 120 kW
    } else if (pct < 85) {
      rate = 120 - Math.round(((pct - 70) / 15) * 70); // 120 to 50 kW
    } else {
      rate = Math.max(12, 50 - Math.round(((pct - 85) / 15) * 38)); // 50 to 12 kW
    }
    
    // 2. Calculate remaining time
    let timeText = "";
    if (pct < state.chargeLimit) {
      const mins = Math.max(1, Math.round((state.chargeLimit - pct) * (1.1 - (pct / 200))));
      timeText = `${mins}m to ${state.chargeLimit}%`;
    } else if (pct < 100) {
      const mins = Math.max(1, Math.round((100 - pct) * (1.8 + (pct - 80) * 0.08)));
      timeText = `${mins}m to full`;
    } else {
      timeText = "Fully Charged";
    }
    
    // 3. Update the specs container HTML
    specsContainer.innerHTML = `
      <span class="charging-rate">⚡ ${rate} kW</span>
      <span class="charging-time-left">${timeText}</span>
    `;
    
    // Show specs container
    specsContainer.style.display = "flex";
    
    // 4. Update battery details subtext with charging status and dynamic temp
    const temp = Math.min(42, 28 + Math.round((pct / 100) * 8));
    subText.innerHTML = `Supercharging • ${temp}°C`;
  } else {
    // Hide specs container
    specsContainer.style.display = "none";
    // Restore normal subtext
    subText.innerHTML = `Limit: ${state.chargeLimit}% • Temp: 28°C`;
  }
}

function toggleChargingState() {
  batteryCharging = !batteryCharging;
  const fill = document.getElementById("battery-fill");
  const card = document.getElementById("battery-card");
  
  card.classList.toggle("charging", batteryCharging);
  
  if (batteryCharging) {
    fill.classList.add("charging");
    
    // Update immediately on toggle
    updateChargingSpecs(state.batteryPct);
    
    // Start charging increment simulation
    batteryChargeInterval = setInterval(() => {
      const targetLimit = state.batteryPct < state.chargeLimit ? state.chargeLimit : 100;
      
      if (state.batteryPct < targetLimit) {
        state.batteryPct++;
        updateGlobalBatteryUI(state.batteryPct);
        updateChargingSpecs(state.batteryPct);
      } else {
        toggleChargingState(); // Reached target!
      }
    }, 1000);
  } else {
    fill.classList.remove("charging");
    clearInterval(batteryChargeInterval);
    batteryChargeInterval = null;
    
    updateChargingSpecs(state.batteryPct);
  }
}

function updateGlobalBatteryUI(pctVal) {
  // Update main dashboard percentage text
  const pctTextEl = document.getElementById("battery-pct-text");
  if (pctTextEl) {
    pctTextEl.innerHTML = `${pctVal}<span>%</span>`;
  }
  
  // Update sidebar battery badge
  const sidebarBatEl = document.getElementById("nav-bat-val");
  if (sidebarBatEl) {
    sidebarBatEl.textContent = `${pctVal}%`;
  }
  
  // Update remaining range
  const remainingEl = document.getElementById("battery-remaining-text");
  if (remainingEl) {
    remainingEl.textContent = `${Math.round(pctVal * 3.23)} km Remaining`;
  }
  
  // Update fill bar
  updateBatteryFill();
  
  // Handle battery under 30% warning and ev-charger card update
  const fill = document.getElementById("battery-fill");
  const subText = document.getElementById("battery-details-sub");
  const batteryCard = document.getElementById("battery-card");
  
  const chargerCard = document.querySelector(".ev-charger-card");
  const chargerBadge = document.querySelector(".charger-badge");
  const chargerStatus = document.querySelector(".charger-status-text");
  
  if (pctVal < 30) {
    if (fill) fill.classList.add("low");
    if (batteryCard) batteryCard.classList.add("low");
    if (subText) {
      if (typeof batteryCharging !== 'undefined' && batteryCharging) {
        updateChargingSpecs(pctVal);
      } else {
        subText.innerHTML = `<span style="color: #ff5252; font-weight: 700; animation: blink 1.2s infinite alternate;">⚠️ Low Battery - Please Charge!</span>`;
      }
    }
    
    // Low battery charger card warning state
    if (chargerCard) chargerCard.classList.add("low-battery");
    if (chargerBadge) {
      chargerBadge.textContent = "⚠️ LOW BATTERY";
    }
    if (chargerStatus) {
      chargerStatus.textContent = "Looking for nearby charging...";
    }
  } else {
    if (fill) fill.classList.remove("low");
    if (batteryCard) batteryCard.classList.remove("low");
    if (subText) {
      if (typeof batteryCharging !== 'undefined' && batteryCharging) {
        updateChargingSpecs(pctVal);
      } else {
        subText.innerHTML = `Limit: ${state.chargeLimit}% • Temp: 28°C`;
      }
    }
    
    // Normal charger card state
    if (chargerCard) chargerCard.classList.remove("low-battery");
    if (chargerBadge) {
      chargerBadge.textContent = "EV CHARGING";
    }
    if (chargerStatus) {
      chargerStatus.textContent = "Available Now";
    }
  }
  
  // Update sleep overlay battery indicator
  const sleepPctEl = document.getElementById("sleep-battery-pct");
  const sleepStatusEl = document.getElementById("sleep-battery-status-text");
  const sleepFillEl = document.getElementById("sleep-battery-fill");
  
  if (sleepPctEl) {
    sleepPctEl.textContent = `${pctVal}%`;
  }
  
  if (sleepFillEl) {
    sleepFillEl.style.width = `${pctVal}%`;
    
    // Manage sleep fill color classes
    if (pctVal < 30) {
      sleepFillEl.classList.add("low");
    } else {
      sleepFillEl.classList.remove("low");
    }
    
    if (typeof batteryCharging !== 'undefined' && batteryCharging) {
      sleepFillEl.classList.add("charging");
    } else {
      sleepFillEl.classList.remove("charging");
    }
  }
  
  if (sleepStatusEl) {
    if (typeof batteryCharging !== 'undefined' && batteryCharging) {
      if (pctVal < state.chargeLimit) {
        const mins = Math.max(1, Math.round((state.chargeLimit - pctVal) * (1.1 - (pctVal / 200))));
        sleepStatusEl.textContent = `Supercharging • ${mins}m to ${state.chargeLimit}%`;
      } else if (pctVal < 100) {
        const mins = Math.max(1, Math.round((100 - pctVal) * (1.8 + (pctVal - 80) * 0.08)));
        sleepStatusEl.textContent = `Supercharging • ${mins}m to full`;
      } else {
        sleepStatusEl.textContent = `Fully Charged`;
      }
    } else {
      if (pctVal < 30) {
        sleepStatusEl.innerHTML = `<span style="color: #ff5252; font-weight: 600;">⚠️ Low Battery - Plug in to Charge</span>`;
      } else {
        sleepStatusEl.textContent = `${Math.round(pctVal * 3.23)} km Remaining`;
      }
    }
  }
}

function updateBatteryFill() {
  const fill = document.getElementById("battery-fill");
  const pctText = parseInt(document.getElementById("battery-pct-text").textContent);
  if (fill && pctText) {
    fill.style.height = `${pctText}%`;
  }
}

function adjustChargeLimit(val) {
  state.chargeLimit = parseInt(val);
  
  // Update settings label and slider input value
  const label = document.getElementById("settings-charge-limit-value");
  if (label) label.textContent = `${val}%`;
  
  const slider = document.getElementById("charge-limit-slider");
  if (slider) slider.value = val;
  
  // Update battery limit line height
  const limitLine = document.querySelector(".battery-limit-line");
  if (limitLine) {
    limitLine.style.bottom = `${val}%`;
  }
  
  // Update battery details subtext
  const subText = document.getElementById("battery-details-sub");
  if (subText) {
    if (batteryCharging) {
      const pctVal = parseInt(document.getElementById("battery-pct-text").textContent);
      updateChargingSpecs(pctVal);
    } else {
      subText.innerHTML = `Limit: ${val}% • Temp: 28°C`;
    }
  }
}

/* ==========================================================================
   7. AUTOPILOT CONTROL
   ========================================================================== */
function toggleAutopilot() {
  state.autopilotActive = !state.autopilotActive;
  const btn = document.getElementById("autopilot-btn");
  
  if (state.autopilotActive) {
    btn.classList.add("active");
    
    // Flash autopilot toggle sound indicator visual
    const notification = document.createElement("div");
    notification.style.position = "absolute";
    notification.style.top = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "#1a73e8";
    notification.style.color = "white";
    notification.style.padding = "10px 24px";
    notification.style.borderRadius = "30px";
    notification.style.fontWeight = "bold";
    notification.style.zIndex = "100";
    notification.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
    notification.textContent = "Autopilot System Activated";
    notification.style.pointerEvents = "none";
    notification.style.transition = "opacity 0.5s";
    
    document.getElementById("dashboard").appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 500);
    }, 1500);
    
  } else {
    btn.classList.remove("active");
  }
}

/* ==========================================================================
   8. TIRE PRESSURE INTERACTIVITY
   ========================================================================== */
function updateTirePressureUI() {
  const tires = ['fl', 'fr', 'rl', 'rr'];
  
  tires.forEach(tire => {
    const psiVal = state.tirePressures[tire];
    const el = document.getElementById(`tp-${tire}`);
    const displayEl = document.getElementById(`tire-val-${tire}`);
    const settingsDisplayEl = document.getElementById(`tire-val-${tire}-settings`);
    
    if (el) el.textContent = `${psiVal} psi`;
    if (displayEl) displayEl.textContent = psiVal;
    if (settingsDisplayEl) settingsDisplayEl.textContent = psiVal;
    
    // Low pressure < 20 or Over pressure > 35 alert
    if (psiVal < 20 || psiVal > 35) {
      if (el) el.classList.add("warning");
    } else {
      if (el) el.classList.remove("warning");
    }
  });
}

function adjustTirePressure(tire) {
  // Focus settings and open My Vehicle tab
  toggleSettingsModal();
  setTimeout(() => {
    const tabBtn = document.querySelector(".settings-tab[onclick*='myvehicle']");
    if (tabBtn) tabBtn.click();
  }, 100);
}

function modifyTireVal(tire, change) {
  state.tirePressures[tire] = Math.max(10, Math.min(45, state.tirePressures[tire] + change));
  updateTirePressureUI();
}

/* ==========================================================================
   9. WEATHER SYSTEM
   ========================================================================== */
let isCelsius = true;

function toggleWeatherUnit() {
  isCelsius = !isCelsius;
  
  const tempEl = document.getElementById("weather-temp-text");
  const windEl = document.getElementById("weather-wind-text");
  
  if (isCelsius) {
    tempEl.innerHTML = `30<span class="weather-unit" id="weather-unit-text">°C</span>`;
    windEl.textContent = "36 km / h";
  } else {
    tempEl.innerHTML = `86<span class="weather-unit" id="weather-unit-text">°F</span>`;
    windEl.textContent = "22.4 mph";
  }
}

/* ==========================================================================
   10. APP GRID & VEHICLE SETTINGS MODALS
   ========================================================================== */
function toggleAppLauncherPage() {
  const page = document.getElementById("app-launcher-page");
  const launcherBtn = document.getElementById("app-launcher-btn");
  if (!page) return;
  
  const isActive = page.classList.contains("active");
  
  // Close all other overlays/modals
  closeAllModals();
  
  if (!isActive) {
    page.classList.add("active");
    if (launcherBtn) launcherBtn.classList.add("active");
  }
}

function toggleSettingsModal() {
  closeAllModals();
  const modal = document.getElementById("settings-modal");
  
  modal.classList.toggle("active");
}

function closeAllModals(closeNav = false) {
  const appLauncherPage = document.getElementById("app-launcher-page");
  if (appLauncherPage) appLauncherPage.classList.remove("active");
  const launcherBtn = document.getElementById("app-launcher-btn");
  if (launcherBtn) launcherBtn.classList.remove("active");

  const settingsModal = document.getElementById("settings-modal");
  if (settingsModal) settingsModal.classList.remove("active");
  const wifiModal = document.getElementById("wifi-modal");
  if (wifiModal) wifiModal.classList.remove("active");
  const bluetoothModal = document.getElementById("bluetooth-modal");
  if (bluetoothModal) bluetoothModal.classList.remove("active");
  
  if (closeNav) {
    const navModal = document.getElementById("navigation-modal");
    if (navModal) navModal.classList.remove("active");
  }
  
  document.getElementById("modal-backdrop").classList.remove("active");
  
  // Close Climate Overlay and reset active fan button
  const climateOverlay = document.getElementById("climate-overlay");
  if (climateOverlay) climateOverlay.classList.remove("active");
  const fanBtn = document.querySelector(".fan-icon-btn");
  if (fanBtn) fanBtn.classList.remove("active");

  // Close Notification Panel
  const notifPanel = document.getElementById("notification-panel");
  if (notifPanel) notifPanel.classList.remove("active");
}

function returnToHome() {
  closeAllModals(true);
  // Animate grid dashboard reset as verification
  const elements = document.querySelectorAll(".top-row section, .bottom-row section");
  elements.forEach((el, index) => {
    el.style.transform = "scale(0.95)";
    setTimeout(() => {
      el.style.transform = "";
    }, 150 + index * 50);
  });
}

function triggerBackButton() {
  // Simply go back by closing active overlays or resetting
  closeAllModals();
}

function openLauncherApp(appName) {
  closeAllModals(true);
  
  if (appName === 'Settings') {
    toggleSettingsModal();
  } else if (appName === 'Climate') {
    toggleClimateOverlay();
  } else if (appName === 'Charging') {
    routeToNearestCharger();
  } else if (appName === 'Navigation') {
    openNavigationModal();
  } else if (appName === 'Phone') {
    toggleBluetoothModal();
  } else {
    // Show a premium in-app visual feedback instead of raw alert
    const notification = document.createElement("div");
    notification.style.position = "absolute";
    notification.style.top = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "rgba(14, 18, 54, 0.95)";
    notification.style.border = "1px solid rgba(255, 255, 255, 0.12)";
    notification.style.color = "white";
    notification.style.padding = "12px 28px";
    notification.style.borderRadius = "30px";
    notification.style.fontWeight = "bold";
    notification.style.zIndex = "100";
    notification.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    notification.innerHTML = `Loading <strong>${appName}</strong> Application...`;
    notification.style.pointerEvents = "none";
    notification.style.transition = "opacity 0.5s";
    
    document.getElementById("dashboard").appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 500);
    }, 1500);
  }
}

/* Modal Inner Navigation Controls (New Fullscreen Sidebar) */
function switchSettingsTabNew(event, tabId) {
  // Deactivate all tabs
  const tabs = document.querySelectorAll(".settings-sidebar .settings-tab");
  tabs.forEach(tab => tab.classList.remove("active"));
  
  // Deactivate all panels
  const panels = document.querySelectorAll(".settings-panel");
  panels.forEach(panel => panel.classList.remove("active"));
  
  // Activate target tab (handle clicks on SVGs or text safely)
  const clickedTab = event.currentTarget || event.target.closest('.settings-tab');
  if (clickedTab) clickedTab.classList.add("active");
  
  // Activate target panel
  const targetPanel = document.getElementById(`settings-tab-${tabId}`);
  if (targetPanel) targetPanel.classList.add("active");
  
  // Synchronize driving tab eco toggle state
  if (tabId === 'driving') {
    const ecoCheckbox = document.getElementById("settings-eco-checkbox");
    if (ecoCheckbox) ecoCheckbox.checked = state.ecoMode;
  }
}

/* Interactive Car Door Hotspots */
function updateHotspotUI(part) {
  const btn = document.getElementById(`hotspot-door-${part}`) || document.getElementById(`hotspot-${part}`);
  if (!btn) return;
  
  const isOpen = state.carDoors[part];
  if (isOpen) {
    btn.classList.add("active-open");
    if (part === 'frunk') {
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 20l8-16 8 16H4z"></path></svg>`;
    } else if (part === 'trunk') {
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 20H4v-8l8-4 8 4v8z"></path></svg>`;
    } else {
      // Open / Unlocked padlock icon
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
    }
  } else {
    btn.classList.remove("active-open");
    if (part === 'frunk') {
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 20l8-16 8 16H4z"></path></svg>`;
    } else if (part === 'trunk') {
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 20H4v-8l8-4 8 4v8z"></path></svg>`;
    } else {
      // Closed / Locked padlock icon
      btn.innerHTML = `<svg class="hotspot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    }
  }
}

function toggleCarPart(part) {
  state.carDoors[part] = !state.carDoors[part];
  updateHotspotUI(part);
  
  // Visual feedback: scale the car image slightly when doors are open
  const carImg = document.getElementById("settings-car-image");
  if (carImg) {
    const anyOpen = Object.keys(state.carDoors).some(k => state.carDoors[k]);
    if (anyOpen) {
      carImg.style.transform = "scale(1.02)";
    } else {
      carImg.style.transform = "scale(1)";
    }
  }
  
  updateCarStatusIndicator();
}

function updateCarStatusIndicator() {
  const parts = ['fl', 'fr', 'rl', 'rr', 'frunk', 'trunk'];
  const openParts = parts.filter(p => state.carDoors[p]);
  const statusEl = document.getElementById("settings-car-status");
  
  if (statusEl) {
    if (openParts.length === 0) {
      statusEl.textContent = "Vehicle doors secured";
      statusEl.style.color = "";
      
      const lockAllBtn = document.getElementById("lock-all-btn");
      if (lockAllBtn) lockAllBtn.textContent = "Lock Doors";
    } else {
      const names = {
        fl: "FL Door",
        fr: "FR Door",
        rl: "RL Door",
        rr: "RR Door",
        frunk: "Frunk",
        trunk: "Trunk"
      };
      const namesText = openParts.map(p => names[p]).join(", ");
      statusEl.textContent = `${namesText} Open`;
      statusEl.style.color = "#d32f2f";
      
      const lockAllBtn = document.getElementById("lock-all-btn");
      if (lockAllBtn) lockAllBtn.textContent = "Close & Lock";
    }
  }
}

function toggleAllDoors() {
  const parts = ['fl', 'fr', 'rl', 'rr', 'frunk', 'trunk'];
  const anyOpen = parts.some(p => state.carDoors[p]);
  
  parts.forEach(p => {
    // If any open, close all. If all closed, open passenger doors (fl, fr, rl, rr)
    if (anyOpen) {
      state.carDoors[p] = false;
    } else {
      if (p !== 'frunk' && p !== 'trunk') {
        state.carDoors[p] = true;
      }
    }
    updateHotspotUI(p);
  });
  
  updateCarStatusIndicator();
}

/* Settings Options Selector Triggers */
function selectSteering(mode, btnEl) {
  deactivateSiblings(btnEl);
  btnEl.classList.add("active");
  console.log("Steering mode updated to:", mode);
}

function selectHeadlights(mode, btnEl) {
  deactivateSiblings(btnEl);
  btnEl.classList.add("active");
  console.log("Headlight state updated to:", mode);
  
  // Headlight visual glow feedback on settings car
  const carImg = document.getElementById("settings-car-image");
  if (carImg) {
    if (mode === "On" || mode === "Auto") {
      carImg.style.filter = "drop-shadow(0 0 15px rgba(255, 235, 59, 0.45))";
    } else {
      carImg.style.filter = "";
    }
  }
}

function selectSpeedLimit(mode, btnEl) {
  deactivateSiblings(btnEl);
  btnEl.classList.add("active");
  console.log("Speed Limit state updated to:", mode);
}

function deactivateSiblings(el) {
  const options = el.parentNode.querySelectorAll(".selector-option");
  options.forEach(opt => opt.classList.remove("active"));
}

function toggleAmbientLighting(checked) {
  console.log("Ambient Lighting:", checked ? "ON" : "OFF");
  const dashboard = document.getElementById("dashboard");
  if (checked) {
    dashboard.style.boxShadow = "0 25px 60px rgba(26, 115, 232, 0.4)";
  } else {
    dashboard.style.boxShadow = "0 25px 60px rgba(0,0,0,0.3)";
  }
}

function toggleAmbientLightingSettings(checked) {
  toggleAmbientLighting(checked);
  // Keep the other ambient light toggle in sync if it exists
  const toggle = document.getElementById("ambient-light-toggle");
  if (toggle) toggle.checked = checked;
}

function toggleEcoModeSettings(checked) {
  if (state.ecoMode !== checked) {
    toggleEcoMode();
  }
}

function toggleAutosteerConfig(checked) {
  console.log("Autosteer System Configured:", checked);
}

function toggleAutosteerSettings(checked) {
  toggleAutosteerConfig(checked);
  // Keep the autosteer configuration toggle in sync
  const toggle = document.getElementById("autosteer-toggle");
  if (toggle) toggle.checked = checked;
}

/* Premium Light/Dark Theme Switcher */
function setDashboardTheme(theme) {
  const dashboard = document.getElementById("dashboard");
  const autoPill = document.getElementById("display-theme-auto");
  const lightPill = document.getElementById("display-theme-light");
  const darkPill = document.getElementById("display-theme-dark");
  
  if (theme === 'dark') {
    dashboard.classList.add("dark-theme");
    if (darkPill) {
      deactivateSiblingsWithClass(darkPill, "pill-option");
      darkPill.classList.add("active");
    }
  } else {
    dashboard.classList.remove("dark-theme");
    if (lightPill) {
      deactivateSiblingsWithClass(lightPill, "pill-option");
      lightPill.classList.add("active");
    }
  }
  console.log("Theme switched to:", theme);
}

/* Mockup-Specific Interactive Controls (HCI Optimized) */
function selectSearchMode(mode, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  console.log("Search Mode:", mode);
}

function toggleProximityUnlock(checked) {
  console.log("Proximity Unlock toggle:", checked);
}

function toggleProximityLock(checked) {
  console.log("Proximity Lock toggle:", checked);
}

function triggerPowerOff() {
  toggleScreenSleep();
}

function selectDrivingMode(mode, btnEl) {
  deactivateSiblingsWithClass(btnEl, "mode-card");
  btnEl.classList.add("active");
  console.log("Driving Mode:", mode);
}

function selectEnergyRegen(mode, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  console.log("Energy Regen Mode:", mode);
}

function toggleFogLight() {
  const btn = document.getElementById("fog-light-btn");
  if (btn) {
    btn.classList.toggle("active");
    if (btn.classList.contains("active")) {
      btn.style.backgroundColor = "#1a73e8";
      btn.style.color = "#ffffff";
    } else {
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }
  }
}

function updateSliderLabel(labelId, val, options) {
  console.log(`Slider ${labelId} updated to value: ${options[val]}`);
}

function triggerReadingLights(status) {
  console.log("Reading lights:", status ? "ON" : "OFF");
  alert(`Reading lights turned ${status ? 'ON' : 'OFF'}`);
}

function selectThemePill(theme, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  if (theme !== 'auto') {
    setDashboardTheme(theme);
  }
}

function selectTempUnit(unit, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  console.log("Temp Unit:", unit);
}

function selectDistanceUnit(unit, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  console.log("Distance Unit:", unit);
}

function selectTimeUnit(unit, btnEl) {
  deactivateSiblingsWithClass(btnEl, "pill-option");
  btnEl.classList.add("active");
  console.log("Time Unit:", unit);
}

function deactivateSiblingsWithClass(el, className) {
  const options = el.parentNode.querySelectorAll(`.${className}`);
  options.forEach(opt => opt.classList.remove("active"));
}


function routeToNearestCharger() {
  // Open the fullscreen map navigation overlay
  openNavigationModal();
  
  // Trigger destination search and routing simulation
  setTimeout(() => {
    triggerDestinationNav("Shell Recharge Samarahan");
  }, 500);
  
  // Simulate slots checking animation on the home screen widget card
  const slotsText = document.getElementById("charger-slots-text");
  const bar = document.getElementById("charger-progress-bar");
  
  if (slotsText && bar) {
    slotsText.textContent = "Checking...";
    bar.style.strokeDashoffset = "201.06"; // Empty state
    
    setTimeout(() => {
      // Complete animation with 5/6 available slots (offset = 33.51)
      slotsText.textContent = "5/6";
      bar.style.strokeDashoffset = "33.51";
    }, 800);
  }

  console.log("Routing to nearest EV Charger...");
}

/* ==========================================================================
   11. WI-FI MODAL SYSTEM & CONNECTIVITY
   ========================================================================== */

// Wi-Fi network definitions
state.wifiNetworks = [
  { ssid: "Samarahan_Highspeed_5G", secure: true, connected: true, signal: 4 },
  { ssid: "Shell_Recharge_WiFi", secure: true, connected: false, signal: 4 },
  { ssid: "UNIMAS_Campus_Net", secure: true, connected: false, signal: 3 },
  { ssid: "Tesla_Supercharger_Free", secure: false, connected: false, signal: 4 },
  { ssid: "Guest_Network", secure: false, connected: false, signal: 2 }
];
state.connectingSsid = "";

function toggleWifiModal() {
  const modal = document.getElementById("wifi-modal");
  const backdrop = document.getElementById("modal-backdrop");
  
  if (modal && backdrop) {
    const wasActive = modal.classList.contains("active");
    closeAllModals();
    
    if (!wasActive) {
      modal.classList.add("active");
      backdrop.classList.add("active");
      renderWifiList();
    }
  }
}

function renderWifiList() {
  const connectedStatus = document.getElementById("wifi-connected-status");
  const connectedBox = document.getElementById("wifi-net-connected");
  const availableList = document.getElementById("wifi-available-list");
  const listWrapper = document.getElementById("wifi-networks-list");
  const disabledScreen = document.getElementById("wifi-disabled-screen");
  const wifiToggle = document.getElementById("wifi-toggle-checkbox");
  const topbarWifi = document.getElementById("topbar-wifi-icon");
  const topbarMsg = document.getElementById("topbar-center-msg");
  
  // Update toggle UI to match state
  if (wifiToggle) wifiToggle.checked = state.wifiEnabled;
  
  if (!state.wifiEnabled) {
    // Wi-Fi is disabled
    if (listWrapper) listWrapper.style.display = "none";
    if (disabledScreen) disabledScreen.style.display = "flex";
    if (connectedStatus) connectedStatus.textContent = "Wi-Fi is turned off";
    if (topbarWifi) {
      topbarWifi.classList.remove("active");
      topbarWifi.classList.add("inactive");
    }
    if (topbarMsg) topbarMsg.textContent = "Wi-Fi Off";
    return;
  }
  
  // Wi-Fi is enabled
  if (listWrapper) listWrapper.style.display = "block";
  if (disabledScreen) disabledScreen.style.display = "none";
  if (topbarWifi) {
    topbarWifi.classList.add("active");
    topbarWifi.classList.remove("inactive");
  }
  
  // Find connected network
  const connectedNet = state.wifiNetworks.find(n => n.connected);
  
  if (connectedNet) {
    state.connectedWifi = connectedNet.ssid;
    if (connectedStatus) connectedStatus.textContent = `Connected to ${connectedNet.ssid}`;
    if (topbarMsg) topbarMsg.textContent = "They are very"; // Restore center message
    
    // Render connected box
    if (connectedBox) {
      connectedBox.style.display = "flex";
      connectedBox.innerHTML = `
        <div class="wifi-net-info">
          <span class="wifi-net-icon-glyph">📶</span>
          <div class="wifi-net-name-group">
            <span class="wifi-net-name">${connectedNet.ssid}</span>
            <span class="wifi-net-status">Connected</span>
          </div>
        </div>
        <button class="wifi-connect-btn disconnect" onclick="disconnectWifi()">Disconnect</button>
      `;
    }
  } else {
    state.connectedWifi = null;
    if (connectedStatus) connectedStatus.textContent = "Not connected";
    if (topbarMsg) topbarMsg.textContent = "No Wi-Fi Connection";
    if (connectedBox) connectedBox.style.display = "none";
  }
  
  // Render available networks list
  if (availableList) {
    availableList.innerHTML = "";
    
    const availableNets = state.wifiNetworks.filter(n => !n.connected);
    
    availableNets.forEach(net => {
      const isConnecting = state.connectingSsid === net.ssid;
      const buttonText = isConnecting ? "Connecting..." : "Connect";
      const buttonDisabled = isConnecting ? "disabled style='opacity: 0.6;'" : "";
      
      const lockIcon = net.secure ? `<span class="wifi-lock-glyph">🔒</span>` : `<span class="wifi-badge-open">OPEN</span>`;
      
      const item = document.createElement("div");
      item.className = "wifi-network-item";
      item.onclick = isConnecting ? null : () => connectWifiNetwork(net.ssid, net.secure);
      
      item.innerHTML = `
        <div class="wifi-net-info">
          <span class="wifi-net-icon-glyph" style="color: ${net.signal > 2 ? '#1a73e8' : '#888'};">📶</span>
          <span class="wifi-net-name">${net.ssid}</span>
        </div>
        <div class="wifi-net-actions">
          ${lockIcon}
          <button class="wifi-connect-btn" ${buttonDisabled}>${buttonText}</button>
        </div>
      `;
      availableList.appendChild(item);
    });
  }
}

function toggleWifiState(checked) {
  state.wifiEnabled = checked;
  if (!checked) {
    // Disconnect active
    state.wifiNetworks.forEach(n => n.connected = false);
    state.connectedWifi = null;
    showNotification("📡", "Connection lost. Switched to offline navigation.");
  }
  renderWifiList();
  updateOfflineNavStatus();
}

function disconnectWifi() {
  state.wifiNetworks.forEach(n => n.connected = false);
  state.connectedWifi = null;
  showNotification("📡", "Connection lost. Switched to offline navigation.");
  renderWifiList();
  updateOfflineNavStatus();
}

function connectWifiNetwork(ssid, isSecure) {
  if (state.connectingSsid) return; // Wait for active connection
  
  if (isSecure) {
    // Open password prompt overlay inside WiFi Modal
    state.selectedWifiToConnect = ssid;
    const overlay = document.getElementById("wifi-password-overlay");
    const promptText = document.getElementById("password-prompt-ssid");
    const pwInput = document.getElementById("wifi-pw-input");
    
    if (overlay && promptText && pwInput) {
      promptText.textContent = `Network: ${ssid}`;
      pwInput.value = "";
      overlay.style.display = "flex";
      pwInput.focus();
    }
  } else {
    // Open/unsecure networks connect immediately
    triggerWifiConnection(ssid);
  }
}

function cancelWifiPassword() {
  const overlay = document.getElementById("wifi-password-overlay");
  if (overlay) overlay.style.display = "none";
  state.selectedWifiToConnect = "";
}

function submitWifiPassword() {
  const pwInput = document.getElementById("wifi-pw-input");
  const overlay = document.getElementById("wifi-password-overlay");
  
  if (pwInput && overlay) {
    const password = pwInput.value.trim();
    overlay.style.display = "none";
    
    if (password.length >= 4) {
      triggerWifiConnection(state.selectedWifiToConnect);
    } else {
      alert("Password must be at least 4 characters.");
    }
  }
}

function triggerWifiConnection(ssid) {
  state.connectingSsid = ssid;
  renderWifiList();
  
  // Simulate 1.2-second network joining handshakes
  setTimeout(() => {
    // Set all networks to unconnected
    state.wifiNetworks.forEach(n => n.connected = false);
    
    // Set target network to connected
    const targetNet = state.wifiNetworks.find(n => n.ssid === ssid);
    if (targetNet) {
      targetNet.connected = true;
      state.connectedWifi = ssid;
      showNotification("🌐", "Connection restored. Online maps synced.");
    }
    
    state.connectingSsid = "";
    renderWifiList();
    updateOfflineNavStatus();
  }, 1200);
}

/* ==========================================================================
   12. CLIMATE OVERLAY INTERACTIONS (Tesla-Cabin Mockup)
   ========================================================================== */
function toggleClimateOverlay() {
  const overlay = document.getElementById("climate-overlay");
  const fanBtn = document.querySelector(".fan-icon-btn");
  if (!overlay) return;
  
  const isActive = overlay.classList.contains("active");
  
  // Close all other modal menus/overlays
  closeAllModals();
  
  if (!isActive) {
    overlay.classList.add("active");
    if (fanBtn) fanBtn.classList.add("active");
  }
}

function toggleClimateEco() {
  const btn = document.getElementById("climate-eco-btn");
  if (!btn) return;
  
  btn.classList.toggle("active");
  const isEco = btn.classList.contains("active");
  
  // Sync with main map eco mode!
  const mapEcoBtn = document.getElementById("eco-badge-btn");
  if (mapEcoBtn) {
    if (isEco) {
      mapEcoBtn.style.backgroundColor = "#00e676";
      mapEcoBtn.style.color = "white";
      mapEcoBtn.style.fontWeight = "bold";
      mapEcoBtn.style.boxShadow = "0 0 12px rgba(0,230,118,0.5)";
      state.ecoMode = true;
    } else {
      mapEcoBtn.style.backgroundColor = "";
      mapEcoBtn.style.color = "";
      mapEcoBtn.style.fontWeight = "";
      mapEcoBtn.style.boxShadow = "";
      state.ecoMode = false;
    }
  }
}

function triggerRapidCooling() {
  const coolBtn = document.getElementById("btn-rapid-cooling");
  const warmBtn = document.getElementById("btn-rapid-warming");
  if (!coolBtn) return;
  
  const isActive = coolBtn.classList.toggle("active");
  if (warmBtn) warmBtn.classList.remove("active");
  
  if (isActive) {
    // Set temp to LO (16)
    state.driverTemp = 16;
    state.passengerTemp = 16;
    document.getElementById("temp-driver").textContent = "16 °c";
    document.getElementById("temp-passenger").textContent = "16 °c";
    
    // Set fan speed to Max (index 4)
    state.fanSpeedIndex = 4;
    document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[4]);
    const fanImg = document.getElementById("fan-blades-img");
    if (fanImg) fanImg.style.opacity = "1";
    
    // Ensure climate A/C button and power button are active
    const acBtn = document.getElementById("btn-climate-ac");
    if (acBtn) acBtn.classList.add("active");
    
    const powerBtn = document.getElementById("btn-climate-power");
    if (powerBtn) powerBtn.classList.add("active");
  }
}

function triggerRapidWarming() {
  const coolBtn = document.getElementById("btn-rapid-cooling");
  const warmBtn = document.getElementById("btn-rapid-warming");
  if (!warmBtn) return;
  
  const isActive = warmBtn.classList.toggle("active");
  if (coolBtn) coolBtn.classList.remove("active");
  
  if (isActive) {
    // Set temp to HI (28)
    state.driverTemp = 28;
    state.passengerTemp = 28;
    document.getElementById("temp-driver").textContent = "28 °c";
    document.getElementById("temp-passenger").textContent = "28 °c";
    
    // Set fan speed to Max (index 4)
    state.fanSpeedIndex = 4;
    document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[4]);
    const fanImg = document.getElementById("fan-blades-img");
    if (fanImg) fanImg.style.opacity = "1";
    
    // Turn off A/C for heating efficiency
    const acBtn = document.getElementById("btn-climate-ac");
    if (acBtn) acBtn.classList.remove("active");
    
    const powerBtn = document.getElementById("btn-climate-power");
    if (powerBtn) powerBtn.classList.add("active");
  }
}

function toggleClimateIconBtn(btnEl) {
  if (btnEl) btnEl.classList.toggle("active");
}

function toggleClimateAuto(btnEl) {
  if (!btnEl) return;
  const isActive = btnEl.classList.toggle("active");
  if (isActive) {
    // Auto climate control: reset to standard
    state.driverTemp = 21;
    state.passengerTemp = 21;
    document.getElementById("temp-driver").textContent = "21 °c";
    document.getElementById("temp-passenger").textContent = "21 °c";
    
    // Slow down fan speed to auto level
    state.fanSpeedIndex = 1;
    document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[1]);
    
    // Turn A/C on
    const acBtn = document.getElementById("btn-climate-ac");
    if (acBtn) acBtn.classList.add("active");
    
    // Deactivate rapid cooling/warming
    const coolBtn = document.getElementById("btn-rapid-cooling");
    if (coolBtn) coolBtn.classList.remove("active");
    const warmBtn = document.getElementById("btn-rapid-warming");
    if (warmBtn) warmBtn.classList.remove("active");
  }
}

function toggleClimateAC(btnEl) {
  if (btnEl) btnEl.classList.toggle("active");
}

function toggleClimatePower() {
  const btn = document.getElementById("btn-climate-power");
  if (!btn) return;
  
  const isActive = btn.classList.toggle("active");
  const tempDriver = document.getElementById("temp-driver");
  const tempPassenger = document.getElementById("temp-passenger");
  
  if (!isActive) {
    // Turn Climate Control off
    tempDriver.style.opacity = "0.3";
    tempPassenger.style.opacity = "0.3";
    state.fanSpeedIndex = 0;
    document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[0]);
    const fanImg = document.getElementById("fan-blades-img");
    if (fanImg) fanImg.style.opacity = "0.4";
    
    // Deactivate all overlay buttons
    document.querySelectorAll(".climate-pill-btn").forEach(btnOpt => {
      if (btnOpt.id !== "btn-climate-power") btnOpt.classList.remove("active");
    });
  } else {
    // Turn Climate Control on
    tempDriver.style.opacity = "1";
    tempPassenger.style.opacity = "1";
    state.fanSpeedIndex = 2; // Medium default
    document.documentElement.style.setProperty('--fan-speed', state.fanSpeeds[2]);
    const fanImg = document.getElementById("fan-blades-img");
    if (fanImg) fanImg.style.opacity = "1";
    
    // Default active states
    const acBtn = document.getElementById("btn-climate-ac");
    if (acBtn) acBtn.classList.add("active");
    const autoBtn = document.getElementById("btn-climate-auto");
    if (autoBtn) autoBtn.classList.add("active");
    const faceBtn = document.getElementById("btn-flow-face");
    if (faceBtn) faceBtn.classList.add("active");
    const recircBtn = document.getElementById("btn-climate-recirc");
    if (recircBtn) recircBtn.classList.add("active");
  }
}

function selectAirflow(type, btnEl) {
  if (!btnEl) return;
  
  // Deactivate siblings in airflow group
  const airflowBtns = btnEl.parentNode.querySelectorAll(".climate-pill-btn");
  airflowBtns.forEach(btn => btn.classList.remove("active"));
  
  btnEl.classList.add("active");
  console.log("Airflow set to:", type);
}

function toggleClimateRecirc(btnEl) {
  if (btnEl) btnEl.classList.toggle("active");
}

/* ==========================================================================
   13. SLIDE-DOWN NOTIFICATION SYSTEM & NOTIFICATION CENTER
   ========================================================================== */
state.activeNotifications = [];
state.hasUnreadNotifications = false;

const notificationsList = [
  { icon: "🔌", text: "Software Update: Version 2026.12 is ready to install." },
  { icon: "⚡", text: "Charging Complete: Battery charged to 80% limit." },
  { icon: "🚗", text: "Autopilot: Navigation on Autopilot is now available." },
  { icon: "📱", text: "Bluetooth: Phone connected successfully." },
  { icon: "🌡️", text: "Climate: Cabin temperature has reached 21°C." },
  { icon: "🛡️", text: "Sentry Mode: 0 events detected while you were away." },
  { icon: "🛣️", text: "Navigation: Traffic delay ahead. Faster route found." },
  { icon: "🛑", text: "Safety: Lane Departure Avoidance is active." },
  { icon: "💨", text: "Air Quality: Bioweapon Defense Mode active." },
  { icon: "⚙️", text: "System: Tire pressures calibrated successfully." }
];
let notificationTimeout = null;

function initNotifications() {
  // Trigger first notification after 15s, then every 30s
  setTimeout(() => {
    triggerRandomNotification();
    setInterval(triggerRandomNotification, 30000);
  }, 15000);
}

function triggerRandomNotification() {
  // Don't show if screen is asleep
  if (state.isSleep) return;

  const randomNotif = notificationsList[Math.floor(Math.random() * notificationsList.length)];
  
  // Format current time as HH:MM
  const now = new Date();
  let hr = now.getHours();
  let min = now.getMinutes();
  hr = hr < 10 ? '0' + hr : hr;
  min = min < 10 ? '0' + min : min;
  const timeStr = `${hr}:${min}`;
  
  // Add new notification to state list
  const newNotif = {
    icon: randomNotif.icon,
    text: randomNotif.text,
    time: timeStr
  };
  
  state.activeNotifications.unshift(newNotif);
  if (state.activeNotifications.length > 20) {
    state.activeNotifications.pop(); // keep maximum 20 items
  }
  
  // Set unread flag and update badge/list
  state.hasUnreadNotifications = true;
  updateNotificationBadge();
  renderNotificationPanelList();
  
  // Slide down banner
  showNotification(randomNotif.icon, randomNotif.text);
}

function showNotification(icon, text) {
  const container = document.getElementById("slide-notification");
  const iconEl = document.getElementById("notification-icon");
  const textEl = document.getElementById("notification-text");

  if (!container || !iconEl || !textEl) return;

  // Clear existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Set contents
  iconEl.textContent = icon;
  textEl.textContent = text;

  // Show
  container.classList.add("show");

  // Automatically hide after 6 seconds
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 6000);
}

function hideNotification() {
  const container = document.getElementById("slide-notification");
  if (container) {
    container.classList.remove("show");
  }
}

/* Notification Dropdown Panel Controls */
function toggleNotificationPanel(event) {
  if (event) event.stopPropagation(); // prevent immediate close-out click trigger
  
  // Close other active overlay modals
  closeAllModals();
  
  const panel = document.getElementById("notification-panel");
  if (!panel) return;
  
  const isActive = panel.classList.contains("active");
  if (!isActive) {
    panel.classList.add("active");
    // Clear unread red dot when check/view the notifications
    state.hasUnreadNotifications = false;
    updateNotificationBadge();
  } else {
    panel.classList.remove("active");
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById("notification-badge");
  if (badge) {
    badge.style.display = state.hasUnreadNotifications ? "block" : "none";
  }
}

function renderNotificationPanelList() {
  const body = document.getElementById("notification-panel-body");
  if (!body) return;
  
  if (state.activeNotifications.length === 0) {
    body.innerHTML = `
      <div class="notification-empty-state">
        <div class="empty-icon">🔔</div>
        <span>No notifications</span>
      </div>
    `;
    return;
  }
  
  body.innerHTML = "";
  state.activeNotifications.forEach((notif, index) => {
    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerHTML = `
      <div class="notification-item-icon">${notif.icon}</div>
      <div class="notification-item-details">
        <span class="notification-item-text">${notif.text}</span>
        <span class="notification-item-time">${notif.time}</span>
      </div>
      <button class="notification-item-remove-btn" onclick="removeNotification(${index}, event)">&times;</button>
    `;
    body.appendChild(item);
  });
}

function removeNotification(index, event) {
  if (event) event.stopPropagation(); // prevent closing the panel
  state.activeNotifications.splice(index, 1);
  renderNotificationPanelList();
}

function clearAllNotifications(event) {
  if (event) event.stopPropagation();
  state.activeNotifications = [];
  renderNotificationPanelList();
}

// Global click-out dismiss event handler
document.addEventListener("click", (event) => {
  const panel = document.getElementById("notification-panel");
  const btn = document.getElementById("topbar-notification-btn");
  if (panel && panel.classList.contains("active")) {
    if (!panel.contains(event.target) && (!btn || !btn.contains(event.target))) {
      panel.classList.remove("active");
    }
  }
});

/* ==========================================================================
   15. MAP NAVIGATION LOGIC (HCI Premium)
   ========================================================================== */

/* ==========================================================================
   15. MAP NAVIGATION LOGIC (HCI Premium)
   ========================================================================== */

const navDestinations = [
  {
    name: "JomCharge - Jalan Uni Academia",
    distance: 2.5,
    timeFast: 12,
    timeEco: 15,
    icon: "🔌",
    speedLimit: 60,
    weather: "☀️ 31°C Sunny",
    charger: "🔌 AC 22kW (Type 2)",
    slots: "6/8 slots available",
    price: "RM 0.60/kWh",
    address: "Jalan Uni Academia, Kota Samarahan",
    saved: false,
    streets: [
      { dist: "1.8km", street: "Jalan Kota Samarahan", arrow: "↑", speed: 60 },
      { dist: "600m", street: "Jalan Uni Entrance Rd", arrow: "↖", speed: 45 },
      { dist: "100m", street: "Uni Academia Way", arrow: "↑", speed: 30 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 485, y: 310 },
      { x: 470, y: 325 },
      { x: 455, y: 345 },
      { x: 450, y: 365 },
      { x: 445, y: 380 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 495, y: 325 },
      { x: 485, y: 350 },
      { x: 470, y: 370 },
      { x: 445, y: 380 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 485, y: 310 },
      { x: 470, y: 325 },
      { x: 455, y: 345 },
      { x: 450, y: 365 },
      { x: 445, y: 380 }
    ]
  },
  {
    name: "Shell Recharge Samarahan",
    distance: 1.2,
    timeFast: 6,
    timeEco: 8,
    icon: "⚡",
    speedLimit: 80,
    weather: "☀️ 31°C Sunny",
    charger: "🔌 DC Fast 180kW (CCS2)",
    slots: "4/6 slots available",
    price: "RM 1.50/min",
    address: "Shell Samarahan Expressway",
    saved: false,
    streets: [
      { dist: "900m", street: "Samarahan Expressway", arrow: "↑", speed: 80 },
      { dist: "300m", street: "Shell Station Loop", arrow: "↗", speed: 40 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 512, y: 312 },
      { x: 522, y: 328 },
      { x: 535, y: 350 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 520, y: 310 },
      { x: 530, y: 330 },
      { x: 535, y: 350 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 512, y: 312 },
      { x: 522, y: 328 },
      { x: 535, y: 350 }
    ]
  },
  {
    name: "BMW Charging - Lorong Seladah",
    distance: 8.4,
    timeFast: 18,
    timeEco: 22,
    icon: "🔌",
    speedLimit: 70,
    weather: "☁️ 28°C Cloudy",
    charger: "🔌 AC 12kW (Type 2)",
    slots: "2/3 slots available",
    price: "RM 0.80/kWh",
    address: "20, Lorong Seladah 1G2, Kuching",
    saved: false,
    streets: [
      { dist: "5.2km", street: "Samarahan Highway", arrow: "↑", speed: 80 },
      { dist: "2.1km", street: "Jalan Tun Jugah", arrow: "↱", speed: 60 },
      { dist: "1.1km", street: "Lorong Seladah Loop", arrow: "↑", speed: 40 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 495, y: 275 },
      { x: 485, y: 245 },
      { x: 475, y: 220 },
      { x: 480, y: 200 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 475, y: 285 },
      { x: 465, y: 255 },
      { x: 470, y: 225 },
      { x: 480, y: 200 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 495, y: 275 },
      { x: 485, y: 245 },
      { x: 475, y: 220 },
      { x: 480, y: 200 }
    ]
  },
  {
    name: "ChargeSINI - 24, Q5A",
    distance: 11.2,
    timeFast: 22,
    timeEco: 27,
    icon: "🔌",
    speedLimit: 80,
    weather: "☁️ 28°C Cloudy",
    charger: "🔌 AC 11kW (Type 2)",
    slots: "3/4 slots available",
    price: "RM 0.40/kWh",
    address: "24, Q5A, Kuching",
    saved: false,
    streets: [
      { dist: "7.2km", street: "Kuching-Samarahan Expressway", arrow: "↑", speed: 80 },
      { dist: "3.1km", street: "Jalan Q5A Link", arrow: "↖", speed: 60 },
      { dist: "900m", street: "Jalan Q5A Accessway", arrow: "↑", speed: 50 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 470, y: 305 },
      { x: 440, y: 295 },
      { x: 410, y: 295 },
      { x: 380, y: 310 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 470, y: 260 },
      { x: 430, y: 255 },
      { x: 400, y: 280 },
      { x: 380, y: 310 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 470, y: 305 },
      { x: 440, y: 295 },
      { x: 410, y: 295 },
      { x: 380, y: 310 }
    ]
  },
  {
    name: "ChargeSINI - The Podium",
    distance: 9.8,
    timeFast: 19,
    timeEco: 24,
    icon: "🔌",
    speedLimit: 70,
    weather: "🌧️ 26°C Rainy",
    charger: "🔌 AC 22kW (Type 2)",
    slots: "3/8 slots available",
    price: "RM 0.60/kWh",
    address: "The Podium, Q3A Jalan Tun Datuk Patinggi Hj. Ahmad Zaidi Adruce, Kuching",
    saved: false,
    streets: [
      { dist: "6.0km", street: "Jalan Kuching Bypass", arrow: "↑", speed: 70 },
      { dist: "2.5km", street: "Jalan Tun Zaidi Adruce", arrow: "↱", speed: 50 },
      { dist: "1.3km", street: "The Podium Entrance Rd", arrow: "↑", speed: 30 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 485, y: 275 },
      { x: 465, y: 255 },
      { x: 445, y: 235 },
      { x: 430, y: 220 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 460, y: 280 },
      { x: 440, y: 260 },
      { x: 430, y: 220 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 485, y: 275 },
      { x: 465, y: 255 },
      { x: 445, y: 235 },
      { x: 430, y: 220 }
    ]
  },
  {
    name: "ChargeSINI - Jalan Petanak",
    distance: 13.5,
    timeFast: 24,
    timeEco: 30,
    icon: "🔌",
    speedLimit: 60,
    weather: "🌧️ 26°C Rainy",
    charger: "🔌 AC 11kW (Type 2)",
    slots: "4/4 slots available",
    price: "RM 0.40/kWh",
    address: "6, Jalan Petanak, Kuching",
    saved: false,
    streets: [
      { dist: "9.0km", street: "Jalan Simpang Tiga", arrow: "↑", speed: 70 },
      { dist: "3.5km", street: "Jalan Petanak Road", arrow: "↱", speed: 50 },
      { dist: "1.0km", street: "Jalan Petanak Loop", arrow: "↑", speed: 40 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 520, y: 310 },
      { x: 545, y: 330 },
      { x: 575, y: 350 },
      { x: 610, y: 370 },
      { x: 650, y: 395 },
      { x: 690, y: 425 },
      { x: 725, y: 465 },
      { x: 745, y: 490 },
      { x: 760, y: 510 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 530, y: 340 },
      { x: 570, y: 370 },
      { x: 615, y: 405 },
      { x: 665, y: 440 },
      { x: 715, y: 475 },
      { x: 760, y: 510 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 520, y: 310 },
      { x: 545, y: 330 },
      { x: 575, y: 350 },
      { x: 610, y: 370 },
      { x: 650, y: 395 },
      { x: 690, y: 425 },
      { x: 725, y: 465 },
      { x: 745, y: 490 },
      { x: 760, y: 510 }
    ]
  },
  {
    name: "BMW Charging - Kuching",
    distance: 10.5,
    timeFast: 21,
    timeEco: 26,
    icon: "🔌",
    speedLimit: 80,
    weather: "☁️ 28°C Cloudy",
    charger: "🔌 AC 12kW (Type 2)",
    slots: "1/2 slots available",
    price: "RM 0.80/kWh",
    address: "Jalan Tun Jugah Bypass, Kuching",
    saved: false,
    streets: [
      { dist: "7.0km", street: "Samarahan Highway Bypass", arrow: "↑", speed: 80 },
      { dist: "2.5km", street: "Jalan Tun Jugah North", arrow: "↖", speed: 60 },
      { dist: "1.0km", street: "BMW Center Way", arrow: "↑", speed: 40 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 495, y: 265 },
      { x: 480, y: 230 },
      { x: 470, y: 205 },
      { x: 460, y: 190 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 480, y: 260 },
      { x: 465, y: 220 },
      { x: 460, y: 190 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 495, y: 265 },
      { x: 480, y: 230 },
      { x: 470, y: 205 },
      { x: 460, y: 190 }
    ]
  },
  {
    name: "ChargeSINI - ZUS Coffee DT",
    distance: 12.0,
    timeFast: 23,
    timeEco: 28,
    icon: "🔌",
    speedLimit: 70,
    weather: "☁️ 29°C Cloudy",
    charger: "🔌 AC 11kW (Type 2)",
    slots: "2/4 slots available",
    price: "RM 0.40/kWh",
    address: "ZUS Coffee DT, Jalan Rock, Kuching",
    saved: false,
    streets: [
      { dist: "8.5km", street: "Jalan Rock Central Link", arrow: "↑", speed: 70 },
      { dist: "2.5km", street: "Jalan Rock Expressway", arrow: "↱", speed: 60 },
      { dist: "1.0km", street: "ZUS Drive-Thru Lane", arrow: "↑", speed: 30 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 475, y: 330 },
      { x: 450, y: 370 },
      { x: 430, y: 410 },
      { x: 415, y: 440 },
      { x: 410, y: 460 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 465, y: 350 },
      { x: 435, y: 400 },
      { x: 410, y: 460 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 475, y: 330 },
      { x: 450, y: 370 },
      { x: 430, y: 410 },
      { x: 415, y: 440 },
      { x: 410, y: 460 }
    ]
  },
  {
    name: "BMW Destination - Jalan Sungai Tapang",
    distance: 12.8,
    timeFast: 20,
    timeEco: 25,
    icon: "🔌",
    speedLimit: 90,
    weather: "☁️ 29°C Cloudy",
    charger: "🔌 AC 11kW (Type 2)",
    slots: "1/2 slots available",
    price: "RM 0.50/kWh",
    address: "Jalan Sungai Tapang, Kuching",
    saved: false,
    streets: [
      { dist: "7.0km", street: "Samarahan Bypass", arrow: "↑", speed: 90 },
      { dist: "4.8km", street: "Airport Access Rd", arrow: "↗", speed: 60 },
      { dist: "1.0km", street: "Sungai Tapang Way", arrow: "↑", speed: 45 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 450, y: 360 },
      { x: 400, y: 420 },
      { x: 360, y: 470 },
      { x: 330, y: 510 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 410, y: 400 },
      { x: 330, y: 510 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 450, y: 360 },
      { x: 400, y: 420 },
      { x: 360, y: 470 },
      { x: 330, y: 510 }
    ]
  },
  {
    name: "JomCharge - 15, Jalan Bukit Mata Kuching",
    distance: 14.2,
    timeFast: 25,
    timeEco: 32,
    icon: "🔌",
    speedLimit: 80,
    weather: "🌧️ 26°C Rainy",
    charger: "🔌 AC 22kW (Type 2)",
    slots: "3/4 slots available",
    price: "RM 0.60/kWh",
    address: "15, Jalan Bukit Mata Kuching, Kuching",
    saved: false,
    streets: [
      { dist: "8.2km", street: "Samarahan Expressway", arrow: "↑", speed: 80 },
      { dist: "4.5km", street: "Jalan Tun Salahuddin", arrow: "↑", speed: 70 },
      { dist: "1.5km", street: "Jalan Bukit Mata Way", arrow: "↱", speed: 40 }
    ],
    pathPointsFast: [
      { x: 500, y: 300 },
      { x: 520, y: 310 },
      { x: 545, y: 330 },
      { x: 575, y: 350 },
      { x: 610, y: 370 },
      { x: 650, y: 395 },
      { x: 690, y: 425 },
      { x: 730, y: 465 },
      { x: 765, y: 505 },
      { x: 800, y: 540 }
    ],
    pathPointsEco: [
      { x: 500, y: 300 },
      { x: 530, y: 340 },
      { x: 570, y: 370 },
      { x: 615, y: 405 },
      { x: 665, y: 440 },
      { x: 715, y: 475 },
      { x: 760, y: 510 },
      { x: 800, y: 540 }
    ],
    pathPoints: [
      { x: 500, y: 300 },
      { x: 520, y: 310 },
      { x: 545, y: 330 },
      { x: 575, y: 350 },
      { x: 610, y: 370 },
      { x: 650, y: 395 },
      { x: 690, y: 425 },
      { x: 730, y: 465 },
      { x: 765, y: 505 },
      { x: 800, y: 540 }
    ]
  }
];

function initNavClickHandlers() {
  const mapCard = document.getElementById("map-card");
  if (mapCard) {
    let startX = 0, startY = 0, startTime = 0;
    mapCard.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    });
    
    mapCard.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest(".nav-panel")) {
        return;
      }
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      const elapsed = Date.now() - startTime;
      
      if (dx < 6 && dy < 6 && elapsed < 250) {
        openNavigationModal();
      }
    });
  }
}

function openNavigationModal() {
  closeAllModals();
  const modal = document.getElementById("navigation-modal");
  const backdrop = document.getElementById("modal-backdrop");
  if (modal && backdrop) {
    modal.classList.add("active");
    
    clearNavSearch();
    resetNavMapOrientation();
    
    if (state.isNavigating) {
      document.getElementById("nav-search-sidebar").style.display = "none";
      document.getElementById("nav-instructions-container").style.display = "flex";
      document.getElementById("nav-speed-hud").style.display = "flex";
      document.getElementById("nav-trip-bar").style.display = "flex";
    } else {
      document.getElementById("nav-search-sidebar").style.display = "flex";
      document.getElementById("nav-instructions-container").style.display = "none";
      document.getElementById("nav-speed-hud").style.display = "none";
      document.getElementById("nav-trip-bar").style.display = "none";
    }
    
    updateOfflineNavStatus();
  }
}

function handleNavBackClick() {
  if (state.selectedDest) {
    clearNavSearch();
  } else {
    closeAllModals(true);
  }
}

function initNavMapDrag() {
  const mapBg = document.getElementById("nav-map-bg");
  if (!mapBg) return;

  mapBg.addEventListener("mousedown", (e) => {
    state.isDraggingNavMap = true;
    state.navDragStartX = e.clientX - state.navMapOffsetX;
    state.navDragStartY = e.clientY - state.navMapOffsetY;
    mapBg.style.transition = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.isDraggingNavMap) return;
    const newX = e.clientX - state.navDragStartX;
    const newY = e.clientY - state.navDragStartY;
    
    const modal = document.getElementById("navigation-modal");
    const w = modal.clientWidth || 1000;
    const h = modal.clientHeight || 600;
    
    const maxDragX = Math.max(0, (state.navZoomLevel - 1) * w / 2);
    const maxDragY = Math.max(0, (state.navZoomLevel - 1) * h / 2);
    
    state.navMapOffsetX = Math.max(-maxDragX, Math.min(maxDragX, newX));
    state.navMapOffsetY = Math.max(-maxDragY, Math.min(maxDragY, newY));
    updateNavMapTransform();
  });

  window.addEventListener("mouseup", () => {
    if (state.isDraggingNavMap) {
      state.isDraggingNavMap = false;
      mapBg.style.transition = "transform 0.3s ease-out";
    }
  });
}

function updateNavMapTransform() {
  const mapBg = document.getElementById("nav-map-bg");
  if (mapBg) {
    mapBg.style.transform = `translate(${state.navMapOffsetX}px, ${state.navMapOffsetY}px) scale(${state.navZoomLevel})`;
  }
}

function zoomNavMap(direction) {
  state.navZoomLevel = Math.max(1.4, Math.min(3.0, state.navZoomLevel + (direction * 0.25)));
  const mapBg = document.getElementById("nav-map-bg");
  if (mapBg) {
    mapBg.style.transition = "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)";
    updateNavMapTransform();
  }
}

function resetNavMapOrientation() {
  state.navZoomLevel = 1.5;
  state.navMapOffsetX = 0;
  state.navMapOffsetY = 0;
  const mapBg = document.getElementById("nav-map-bg");
  if (mapBg) {
    mapBg.style.transition = "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
    updateNavMapTransform();
  }
  const compass = document.querySelector(".nav-map-controls .map-btn img");
  if (compass) {
    compass.style.transform = "rotate(360deg)";
    setTimeout(() => { compass.style.transform = ""; }, 500);
  }
}

/* Redesigned card list rendering logic */
function renderStationCards(list = navDestinations) {
  const suggestionsList = document.getElementById("nav-suggestions-list");
  if (!suggestionsList) return;
  
  suggestionsList.innerHTML = "";
  
  // Sort list strictly by distance (nearest first) to arrange by nearby
  const sortedList = [...list].sort((a, b) => a.distance - b.distance);

  // If a destination is selected, only render that card
  const listToRender = state.selectedDest 
    ? sortedList.filter(d => d.name === state.selectedDest.name)
    : sortedList;

  listToRender.forEach(dest => {
    const originalIndex = navDestinations.indexOf(dest);
    const isExpanded = state.selectedDest && state.selectedDest.name === dest.name;
    const activeRoute = state.navActiveRouteIndex || 0;
    
    const card = document.createElement("div");
    card.className = `nav-station-card ${isExpanded ? 'expanded' : 'collapsed'}`;
    card.id = `station-card-${originalIndex}`;
    
    card.innerHTML = `
      <div class="nav-station-header" onclick="toggleStationCard(${originalIndex})">
        <div class="station-header-main">
          <div class="suggest-icon">${dest.icon}</div>
          <div class="suggest-details">
            <span class="suggest-name">${dest.name}</span>
            <span class="suggest-distance">${dest.distance} km</span>
          </div>
        </div>
        <button class="nav-fav-btn ${dest.saved ? 'saved' : ''}" onclick="toggleSaveStation(${originalIndex}, event)" title="${dest.saved ? 'Unsave' : 'Save'}">
          <svg class="bookmark-svg" width="20" height="20" viewBox="0 0 24 24" fill="${dest.saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      
      <div class="nav-station-body">
        <div class="nav-station-details">
          <div class="station-detail-item address">
            <span>📍</span>
            <span class="detail-text">${dest.address}</span>
          </div>
          
          <div class="station-detail-grid">
            <div class="station-detail-item" title="Weather">
              <span>☀️</span>
              <span class="detail-text">${dest.weather}</span>
            </div>
            <div class="station-detail-item" title="Charger Type">
              <span>🔌</span>
              <span class="detail-text">${dest.charger}</span>
            </div>
          </div>
          
          <div class="station-detail-grid">
            <div class="station-detail-item" title="Slots Availability">
              <span>🔋</span>
              <span class="detail-text">${dest.slots}</span>
            </div>
            <div class="station-detail-item" title="Rates">
              <span>💰</span>
              <span class="detail-text">${dest.price}</span>
            </div>
          </div>
          
          <div class="nav-card-routes">
            <div class="nav-card-route-option ${activeRoute === 0 ? 'active' : ''}" onclick="selectCardRoute(${originalIndex}, 0, event)">
              <span class="route-opt-name">Fastest Route</span>
              <span class="route-opt-time">${dest.timeFast} min</span>
            </div>
            <div class="nav-card-route-option ${activeRoute === 1 ? 'active' : ''}" onclick="selectCardRoute(${originalIndex}, 1, event)">
              <span class="route-opt-name">Eco Route</span>
              <span class="route-opt-time">${dest.timeEco} min</span>
            </div>
          </div>
          
          <button class="nav-card-start-btn" onclick="startCardNavigation(${originalIndex}, event)">Start Navigation</button>
        </div>
      </div>
    `;
    suggestionsList.appendChild(card);
  });
}

function toggleStationCard(index) {
  const dest = navDestinations[index];
  const card = document.getElementById(`station-card-${index}`);
  const wasExpanded = card && card.classList.contains("expanded");
  
  if (wasExpanded) {
    state.selectedDest = null;
    clearNavSearch();
  } else {
    state.selectedDest = dest;
    state.navActiveRouteIndex = 0; // Default to Fastest
    
    const points = dest.pathPointsFast;
    drawRouteLine(points);
    renderStationCards();
    
    // Highlight pin on map
    updateActivePinUI(index);
    
    // Fit map bounds to show route
    let sumX = 0, sumY = 0;
    points.forEach(p => { sumX += p.x; sumY += p.y; });
    const avgX = sumX / points.length;
    const avgY = sumY / points.length;
    
    const modal = document.getElementById("navigation-modal");
    const w = modal.clientWidth || 1000;
    const h = modal.clientHeight || 600;
    
    state.navMapOffsetX = (w / 2) - ((avgX / 1000) * w);
    state.navMapOffsetY = (h / 2) - ((avgY / 600) * h);
    state.navZoomLevel = 1.4;
    updateNavMapTransform();
  }
}

function toggleSaveStation(index, event) {
  if (event) event.stopPropagation(); // prevent card toggle expansion
  
  const dest = navDestinations[index];
  dest.saved = !dest.saved;
  renderStationCards();
}

function selectCardRoute(index, routeIndex, event) {
  if (event) event.stopPropagation();
  
  const dest = navDestinations[index];
  state.selectedDest = dest;
  state.navActiveRouteIndex = routeIndex;
  
  const points = routeIndex === 0 ? dest.pathPointsFast : dest.pathPointsEco;
  drawRouteLine(points);
  
  // Highlight selected route pill in UI
  const cards = document.querySelectorAll(`#station-card-${index} .nav-card-route-option`);
  cards.forEach((card, idx) => {
    if (idx === routeIndex) card.classList.add("active");
    else card.classList.remove("active");
  });
}

function startCardNavigation(index, event) {
  if (event) event.stopPropagation();
  
  const dest = navDestinations[index];
  state.selectedDest = dest;
  startNavSimulation();
}

function filterNavSuggestions(query) {
  const suggestionsList = document.getElementById("nav-suggestions-list");
  const clearBtn = document.getElementById("nav-search-clear-btn");
  
  if (!suggestionsList) return;
  
  if (query.trim() === "") {
    if (clearBtn) clearBtn.style.display = "none";
    renderDefaultSuggestions();
    return;
  }
  
  if (clearBtn) clearBtn.style.display = "block";
  
  const filtered = navDestinations.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase())
  );
  
  if (filtered.length === 0) {
    suggestionsList.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
        No results found
      </div>
    `;
    return;
  }
  
  renderStationCards(filtered);
}

function renderDefaultSuggestions() {
  renderStationCards(navDestinations);
}

function clearNavSearch() {
  state.selectedDest = null;
  const input = document.getElementById("nav-search-input");
  const clearBtn = document.getElementById("nav-search-clear-btn");
  
  if (input) input.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  
  const path = document.getElementById("nav-route-path");
  if (path) path.setAttribute("d", "");
  
  const pointer = document.getElementById("nav-vehicle-pointer");
  if (pointer) {
    pointer.removeAttribute("style");
  }
  
  renderDefaultSuggestions();
  
  const listEl = document.getElementById("nav-suggestions-list");
  if (listEl) listEl.style.display = "flex";
  
  // Reset map pins active state
  updateActivePinUI(-1);
}

function selectDestination(dest) {
  state.selectedDest = dest;
  state.navActiveRouteIndex = 0;
  
  const input = document.getElementById("nav-search-input");
  if (input) input.value = dest.name;
  
  const clearBtn = document.getElementById("nav-search-clear-btn");
  if (clearBtn) clearBtn.style.display = "block";
  
  const points = dest.pathPointsFast;
  drawRouteLine(points);
  renderStationCards();
  
  // Highlight pin on map
  const destIndex = navDestinations.findIndex(d => d.name === dest.name);
  updateActivePinUI(destIndex);
  
  let sumX = 0, sumY = 0;
  points.forEach(p => { sumX += p.x; sumY += p.y; });
  const avgX = sumX / points.length;
  const avgY = sumY / points.length;
  
  const modal = document.getElementById("navigation-modal");
  const w = modal.clientWidth || 1000;
  const h = modal.clientHeight || 600;
  
  state.navMapOffsetX = (w / 2) - ((avgX / 1000) * w);
  state.navMapOffsetY = (h / 2) - ((avgY / 600) * h);
  state.navZoomLevel = 1.4;
  updateNavMapTransform();
}

function selectNavRoute(routeIndex) {
  state.navActiveRouteIndex = routeIndex;
  
  const points = routeIndex === 0 ? state.selectedDest.pathPointsFast : state.selectedDest.pathPointsEco;
  drawRouteLine(points);
}

function drawRouteLine(points) {
  const path = document.getElementById("nav-route-path");
  if (!path || !points || points.length === 0) return;
  
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  
  path.setAttribute("d", d);
}

function interpolatePath(points, stepsPerSegment = 20) {
  const path = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    for (let step = 0; step < stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      
      let angle = 0;
      if (i < points.length - 1) {
        angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      }
      path.push({ x, y, angle: angle + 90 });
    }
  }
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * 180 / Math.PI;
  path.push({ x: last.x, y: last.y, angle: angle + 90 });
  return path;
}

function startNavSimulation() {
  if (!state.selectedDest) return;
  
  state.isNavigating = true;
  
  const destName = state.selectedDest.name;
  const isCongestedRoute = destName.includes("Samarahan") || destName.includes("JomCharge") || destName.includes("Podium") || destName.includes("Lorong Seladah");
  state.detourStatus = isCongestedRoute ? 'available' : 'none';
  state.isDetourActive = false;
  
  document.getElementById("nav-search-sidebar").style.display = "none";
  document.getElementById("nav-instructions-container").style.display = "flex";
  document.getElementById("nav-speed-hud").style.display = "flex";
  document.getElementById("nav-trip-bar").style.display = "flex";
  
  document.getElementById("nav-speed-limit-val").textContent = state.selectedDest.speedLimit;
  
  const activeRoute = state.navActiveRouteIndex || 0;
  const basePoints = activeRoute === 0 ? state.selectedDest.pathPointsFast : state.selectedDest.pathPointsEco;
  state.navPointsArray = interpolatePath(basePoints, 35);
  state.navProgressStep = 0;
  
  const totalTime = activeRoute === 0 ? state.selectedDest.timeFast : state.selectedDest.timeEco;
  const totalDist = state.selectedDest.distance;
  
  state.navRemainingTime = totalTime;
  state.navRemainingDist = totalDist;
  
  updateTripBarUI(totalTime, totalDist);
  
  if (state.navSimulationTimer) clearInterval(state.navSimulationTimer);
  
  syncHomeScreenNavPanel("↑", `${totalDist}km`, state.selectedDest.streets[0].street);
  
  const isAutopilotActive = state.autopilotActive;
  const isOffline = !state.wifiEnabled || !state.connectedWifi;
  if (isOffline) {
    showNotification("📡", "Offline Navigation: Using cached map database.");
  } else if (isAutopilotActive) {
    showNotification("🛣️", `Autopilot: Navigating to ${state.selectedDest.name}`);
  } else {
    showNotification("🧭", `Navigation: Starting route to ${state.selectedDest.name}`);
  }
  
  updateOfflineNavStatus();
  
  // Show target destination pinpoint on the map during navigation
  const destIndex = navDestinations.findIndex(d => d.name === state.selectedDest.name);
  updateActivePinUI(destIndex);
  
  state.navSimulationTimer = setInterval(() => {
    if (!state.isNavigating) return;
    
    state.navProgressStep++;
    
    // Consume battery during driving simulation
    if (state.navProgressStep % 10 === 0) {
      if (state.batteryPct > 3) {
        state.batteryPct--;
        updateGlobalBatteryUI(state.batteryPct);
      }
    }
    
    if (state.navProgressStep >= state.navPointsArray.length) {
      completeNavSimulation();
      return;
    }
    
    const pt = state.navPointsArray[state.navProgressStep];
    const progressPct = state.navProgressStep / state.navPointsArray.length;
    
    const pointer = document.getElementById("nav-vehicle-pointer");
    if (pointer) {
      pointer.style.left = `${(pt.x / 1000) * 100}%`;
      pointer.style.top = `${(pt.y / 600) * 100}%`;
      pointer.style.transform = `translate(-50%, -50%) rotate(${pt.angle}deg)`;
    }
    
    // Hide pinpoint tooltip if the vehicle pointer gets close to the destination pinpoint
    const destPoints = activeRoute === 0 ? state.selectedDest.pathPointsFast : state.selectedDest.pathPointsEco;
    const destPoint = destPoints[destPoints.length - 1];
    if (destPoint) {
      const dx = pt.x - destPoint.x;
      const dy = pt.y - destPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const activePin = document.getElementById(`map-pin-${destIndex}`);
      if (activePin) {
        if (dist < 80) {
          activePin.classList.add("hide-tooltip");
        } else {
          activePin.classList.remove("hide-tooltip");
        }
      }
    }
    
    const modal = document.getElementById("navigation-modal");
    const modalW = modal.clientWidth || 1000;
    const modalH = modal.clientHeight || 600;
    state.navMapOffsetX = (modalW / 2) - ((pt.x / 1000) * modalW);
    state.navMapOffsetY = (modalH / 2) - ((pt.y / 600) * modalH);
    state.navZoomLevel = 1.6;
    updateNavMapTransform();
    
    state.navRemainingDist = Math.max(0, parseFloat((totalDist * (1 - progressPct)).toFixed(1)));
    state.navRemainingTime = Math.max(0, Math.ceil(totalTime * (1 - progressPct)));
    updateTripBarUI(state.navRemainingTime, state.navRemainingDist);
    
    const segmentCount = basePoints.length - 1;
    const segmentIndex = Math.min(
      segmentCount - 1,
      Math.floor(progressPct * segmentCount)
    );
    let streetDetails = state.selectedDest.streets[segmentIndex] || state.selectedDest.streets[state.selectedDest.streets.length - 1];
    
    if (state.isDetourActive) {
      if (progressPct < 0.75) {
        streetDetails = { dist: "1.2km", street: "Jalan Stutong Bypass", arrow: "↱", speed: 70 };
      } else {
        streetDetails = { dist: "200m", street: "Station Loop", arrow: "🏁", speed: 30 };
      }
    }
    
    const baseSpeed = streetDetails.speed;
    const speedVariation = Math.floor(Math.random() * 9 - 4);
    const simulatedSpeed = Math.max(15, baseSpeed + speedVariation);
    
    document.getElementById("nav-speed-val").textContent = simulatedSpeed;
    
    let nextSegmentIndex = segmentIndex + 1;
    let nextStreetDetails = state.selectedDest.streets[nextSegmentIndex] || { street: "Arrived", dist: "0m", arrow: "🏁" };
    
    if (segmentIndex === segmentCount - 1) {
      nextStreetDetails = { street: state.selectedDest.name, dist: "100m", arrow: "🏁" };
    }
    
    if (state.isDetourActive) {
      if (progressPct < 0.75) {
        nextStreetDetails = { street: "Station Loop", dist: "200m", arrow: "🏁" };
      } else {
        nextStreetDetails = { street: state.selectedDest.name, dist: "50m", arrow: "🏁" };
      }
    }
    
    const segmentStartProgress = segmentIndex / segmentCount;
    const segmentEndProgress = (segmentIndex + 1) / segmentCount;
    const segmentProgress = (progressPct - segmentStartProgress) / (segmentEndProgress - segmentStartProgress);
    
    let distVal = parseFloat(streetDetails.dist);
    let distUnit = "m";
    if (streetDetails.dist.includes("km")) {
      distVal = parseFloat(streetDetails.dist) * 1000;
    }
    const currentDistToTurn = Math.max(50, Math.round(distVal * (1 - segmentProgress)));
    const distStr = currentDistToTurn >= 1000 ? `${(currentDistToTurn/1000).toFixed(1)}km` : `${currentDistToTurn}m`;
    
    document.getElementById("nav-instr-arrow").textContent = streetDetails.arrow;
    document.getElementById("nav-instr-dist").textContent = distStr;
    document.getElementById("nav-instr-road").textContent = streetDetails.street;
    
    // Update next turn card
    const nextArrowEl = document.getElementById("nav-next-arrow");
    const nextRoadEl = document.getElementById("nav-next-road");
    if (nextArrowEl && nextRoadEl) {
      nextArrowEl.textContent = nextStreetDetails.arrow;
      if (nextStreetDetails.arrow === "🏁") {
        nextRoadEl.textContent = `Arrive at Destination`;
      } else {
        nextRoadEl.textContent = `then follow ${nextStreetDetails.street}`;
      }
    }
    
    const topbarMsg = document.getElementById("topbar-center-msg");
    if (topbarMsg && state.navProgressStep % 10 === 0) {
      topbarMsg.textContent = `In ${distStr}, follow ${streetDetails.street}`;
    }
    
    updateAlertsCard(progressPct, segmentIndex, streetDetails);
    
    syncHomeScreenNavPanel(streetDetails.arrow, distStr, streetDetails.street);
    
  }, 1200);
}

function updateTripBarUI(minsLeft, kmsLeft) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minsLeft);
  let hr = now.getHours();
  let min = now.getMinutes();
  hr = hr < 10 ? '0' + hr : hr;
  min = min < 10 ? '0' + min : min;
  
  document.getElementById("nav-trip-eta").textContent = `${hr}:${min}`;
  document.getElementById("nav-trip-time").textContent = minsLeft;
  document.getElementById("nav-trip-distance").textContent = kmsLeft;
}

function syncHomeScreenNavPanel(arrow = "↑", distance = "---", street = "Select Destination") {
  const arrowEl = document.getElementById("nav-arrow-symbol");
  const distEl = document.getElementById("nav-distance-text");
  const streetEl = document.getElementById("nav-street-text");
  
  if (arrowEl) arrowEl.textContent = arrow;
  if (distEl) distEl.textContent = distance;
  if (streetEl) streetEl.textContent = street;
}

function cancelNavSimulation(isCompleted = false) {
  state.isNavigating = false;
  if (state.navSimulationTimer) {
    clearInterval(state.navSimulationTimer);
    state.navSimulationTimer = null;
  }
  
  state.detourStatus = 'none';
  state.isDetourActive = false;
  
  document.getElementById("nav-instructions-container").style.display = "none";
  document.getElementById("nav-speed-hud").style.display = "none";
  document.getElementById("nav-trip-bar").style.display = "none";
  
  document.getElementById("nav-search-sidebar").style.display = "flex";
  
  const alertsCard = document.getElementById("nav-alerts-card");
  if (alertsCard) alertsCard.style.display = "none";
  
  if (!isCompleted) {
    clearNavSearch();
    resetNavMapOrientation();
    syncHomeScreenNavPanel("↑", "4km", "Jalan Kota Samarahan");
  } else {
    renderDefaultSuggestions();
  }
  
  const topbarMsg = document.getElementById("topbar-center-msg");
  if (topbarMsg) topbarMsg.textContent = "They are very";
}

function completeNavSimulation() {
  state.isNavigating = false;
  if (state.navSimulationTimer) {
    clearInterval(state.navSimulationTimer);
    state.navSimulationTimer = null;
  }
  
  showNotification("🏁", `Arrived: You have reached ${state.selectedDest.name}!`);
  
  // Update homescreen panel to show where the car stopped
  syncHomeScreenNavPanel("🏁", "0m", `Stopped at ${state.selectedDest.name}`);
  
  setTimeout(() => {
    cancelNavSimulation(true);
  }, 3000);
}

function triggerDestinationNav(destName) {
  const dest = navDestinations.find(d => d.name === destName);
  if (dest) {
    selectDestination(dest);
    startNavSimulation();
  }
}

/* Global Quick Theme Switcher from Bottom Control Bar */
function toggleGlobalTheme() {
  const dashboard = document.getElementById("dashboard");
  if (dashboard.classList.contains("dark-theme")) {
    setDashboardTheme("light");
  } else {
    setDashboardTheme("dark");
  }
}

/* Dynamically render interactive red pin points for each station on the navigation map */
function renderMapPins() {
  const mapBg = document.getElementById("nav-map-bg");
  if (!mapBg) return;

  // Clear any existing pins to prevent duplication
  const existingPins = mapBg.querySelectorAll(".nav-map-pin");
  existingPins.forEach(p => p.remove());

  navDestinations.forEach((dest, index) => {
    const points = dest.pathPointsFast || dest.pathPoints;
    if (!points || points.length === 0) return;
    const destPoint = points[points.length - 1];

    const pin = document.createElement("div");
    pin.className = "nav-map-pin";
    pin.id = `map-pin-${index}`;
    // Position absolute relative to the 1000x600 nav-map-bg coordinate space
    pin.style.left = `${(destPoint.x / 1000) * 100}%`;
    pin.style.top = `${(destPoint.y / 600) * 100}%`;

    pin.innerHTML = `
      <div class="pin-pulse-ring"></div>
      <div class="pin-marker">
        <svg class="pin-svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="color: white; display: block;">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <div class="pin-tooltip">${dest.name}</div>
    `;

    // Click event to trigger selected destination card expansion and route highlights
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      selectDestination(dest);
    });

    mapBg.appendChild(pin);
  });
}

/* Update visual highlight class of active pin */
function updateActivePinUI(activeIndex) {
  const pins = document.querySelectorAll(".nav-map-pin");
  pins.forEach((pin, index) => {
    pin.classList.remove("hide-tooltip");
    if (activeIndex === -1) {
      // Show all pins and remove active highlights when selection is cleared
      pin.classList.remove("hidden");
      pin.classList.remove("active");
    } else {
      if (index === activeIndex) {
        // Show only the selected/active destination pin on the map
        pin.classList.remove("hidden");
        pin.classList.add("active");
      } else {
        // Hide all other pin points on the map to focus on the selected station route
        pin.classList.add("hidden");
        pin.classList.remove("active");
      }
    }
  });
}

/* Update UI display of offline maps banner and badge */
function updateOfflineNavStatus() {
  const isOffline = !state.wifiEnabled || !state.connectedWifi;
  
  const banner = document.getElementById("nav-offline-banner");
  const tripBadge = document.getElementById("nav-trip-offline-badge");
  
  if (banner) {
    banner.style.display = isOffline ? "flex" : "none";
  }
  if (tripBadge) {
    tripBadge.style.display = isOffline ? "block" : "none";
  }
}

/* Update alerts card content dynamically based on route conditions */
function updateAlertsCard(progressPct, segmentIndex, streetDetails) {
  const alertsCard = document.getElementById("nav-alerts-card");
  if (!alertsCard) return;

  const dest = state.selectedDest;
  if (!dest) {
    alertsCard.style.display = "none";
    return;
  }

  const weatherEl = document.getElementById("alert-weather");
  const trafficEl = document.getElementById("alert-traffic");
  const detourEl = document.getElementById("alert-detour");

  let hasAlerts = false;

  // 1. Weather Alert (Heavy Rain Warning)
  const isRainy = dest.weather.toLowerCase().includes("rainy");
  if (isRainy) {
    weatherEl.style.display = "flex";
    const currentRoad = streetDetails ? streetDetails.street : "Expressway";
    weatherEl.querySelector(".alert-text-sub").textContent = `🌧️ Slippery road conditions on ${currentRoad}. Reduce speed limit to 50 km/h.`;
    hasAlerts = true;
  } else {
    weatherEl.style.display = "none";
  }

  // 2. Traffic Alert & Detour (simulated heavy traffic on first segment for specific stations)
  if (state.detourStatus === 'active') {
    if (trafficEl) trafficEl.style.display = "none";
    if (detourEl) {
      detourEl.style.display = "flex";
      detourEl.querySelector(".alert-text-main").textContent = "Detour Active";
      detourEl.querySelector(".alert-text-sub").textContent = "Via Jalan Stutong Bypass";
      const btn = detourEl.querySelector(".detour-accept-btn");
      if (btn) btn.style.display = "none";
    }
    hasAlerts = true;
  } else if (state.detourStatus === 'available') {
    if (trafficEl) {
      trafficEl.style.display = "flex";
      const currentRoad = streetDetails ? streetDetails.street : "Expressway";
      trafficEl.querySelector(".alert-text-sub").textContent = `🚗 Heavy congestion reported on ${currentRoad} (Delay +6 mins).`;
    }
    if (detourEl) {
      detourEl.style.display = "flex";
      detourEl.querySelector(".alert-text-main").textContent = "Alternative Route Available";
      detourEl.querySelector(".alert-text-sub").textContent = `Alternative: Via Jalan Stutong Bypass Link (Save 4 mins).`;
      const btn = detourEl.querySelector(".detour-accept-btn");
      if (btn) btn.style.display = "inline-block";
    }
    hasAlerts = true;
  } else {
    if (trafficEl) trafficEl.style.display = "none";
    if (detourEl) detourEl.style.display = "none";
  }

  // Display alerts card if any alerts are active
  alertsCard.style.display = hasAlerts ? "flex" : "none";
}

/* Accept alternative route detour and update active trip details */
function acceptDetourRoute() {
  state.detourStatus = 'active';
  state.isDetourActive = true;
  
  showNotification("🛣️", "Detour Accepted: Switched to alternative road (Jalan Stutong Bypass).");
  
  // Reduce remaining time by 4 minutes and recalculate ETA in real time
  state.navRemainingTime = Math.max(1, state.navRemainingTime - 4);
  updateTripBarUI(state.navRemainingTime, state.navRemainingDist);
  
  // Overwrite coordinates in state.navPointsArray to create detour path
  if (state.navPointsArray && state.navPointsArray.length > 0) {
    const currPoint = state.navPointsArray[state.navProgressStep];
    const activeRoute = state.navActiveRouteIndex || 0;
    const basePoints = activeRoute === 0 ? state.selectedDest.pathPointsFast : state.selectedDest.pathPointsEco;
    const destPoint = basePoints[basePoints.length - 1];
    
    // Perpendicular detour logic to create a curved route path
    const midX = (currPoint.x + destPoint.x) / 2;
    const midY = (currPoint.y + destPoint.y) / 2;
    const dx = destPoint.x - currPoint.x;
    const dy = destPoint.y - currPoint.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    
    const offsetDist = 50; // offset in pixels
    const nx = -dy / len;
    const ny = dx / len;
    
    const detourPt = {
      x: midX + nx * offsetDist,
      y: midY + ny * offsetDist
    };
    
    const detourControlPoints = [currPoint, detourPt, destPoint];
    const remainingSteps = state.navPointsArray.length - state.navProgressStep;
    const newDetourPoints = interpolatePath(detourControlPoints, Math.max(15, remainingSteps));
    
    // Splice new detour coordinates into navigation path
    state.navPointsArray.splice(state.navProgressStep, remainingSteps, ...newDetourPoints);
    
    // Redraw the path line on the map using updated coordinates array
    drawRouteLine(state.navPointsArray);
  }
  
  // Update alert card UI immediately
  const detourEl = document.getElementById("alert-detour");
  const trafficEl = document.getElementById("alert-traffic");
  if (detourEl) {
    detourEl.querySelector(".alert-text-main").textContent = "Detour Active";
    detourEl.querySelector(".alert-text-sub").textContent = "Via Jalan Stutong Bypass";
    const btn = detourEl.querySelector(".detour-accept-btn");
    if (btn) btn.style.display = "none";
  }
  if (trafficEl) {
    trafficEl.style.display = "none";
  }
}

function toggleBluetoothModal() {
  const modal = document.getElementById("bluetooth-modal");
  const backdrop = document.getElementById("modal-backdrop");
  
  if (modal && backdrop) {
    const wasActive = modal.classList.contains("active");
    closeAllModals();
    
    if (!wasActive) {
      modal.classList.add("active");
      backdrop.classList.add("active");
      renderBluetoothList();
    }
  }
}

function toggleBluetoothPowerState(enabled) {
  state.bluetoothEnabled = enabled;
  const btIcon = document.getElementById("topbar-bluetooth-icon");
  
  if (btIcon) {
    if (enabled) {
      btIcon.classList.remove("inactive");
      btIcon.classList.add("active");
      showNotification("📶", "Bluetooth Enabled.");
    } else {
      btIcon.classList.remove("active");
      btIcon.classList.add("inactive");
      showNotification("🔌", "Bluetooth Disabled.");
    }
  }
  
  renderBluetoothList();
}

function renderBluetoothList() {
  const connectedStatus = document.getElementById("bluetooth-connected-status");
  const devicesList = document.getElementById("bluetooth-devices-list");
  const disabledScreen = document.getElementById("bluetooth-disabled-screen");
  const btToggle = document.getElementById("bluetooth-toggle-checkbox");
  
  if (btToggle) btToggle.checked = state.bluetoothEnabled;
  
  if (!state.bluetoothEnabled) {
    if (connectedStatus) connectedStatus.textContent = "Bluetooth Disabled";
    if (devicesList) devicesList.style.display = "none";
    if (disabledScreen) disabledScreen.style.display = "flex";
    return;
  }
  
  if (disabledScreen) disabledScreen.style.display = "none";
  if (devicesList) {
    devicesList.style.display = "block";
    devicesList.innerHTML = "";
    
    // Set status text
    const connectedDev = state.bluetoothDevices.find(d => d.connected);
    if (connectedStatus) {
      connectedStatus.textContent = connectedDev ? `Connected to ${connectedDev.name}` : "Bluetooth Enabled • Searching...";
    }
    
    state.bluetoothDevices.forEach((device, index) => {
      const item = document.createElement("div");
      item.className = `wifi-network-item ${device.connected ? 'connected-net' : ''}`;
      item.style.cursor = "pointer";
      
      // Determine icon based on device type
      let icon = "📱";
      if (device.type === "headphones") icon = "🎧";
      else if (device.type === "watch") icon = "⌚";
      else if (device.type === "laptop") icon = "💻";
      
      item.innerHTML = `
        <div class="wifi-net-info">
          <span class="wifi-net-icon-glyph" style="font-size: 16px; margin-right: 8px;">${icon}</span>
          <div class="wifi-net-name-group">
            <span class="wifi-net-name">${device.name}</span>
            <span class="wifi-net-status" style="font-size: 11px; opacity: 0.7;">
              ${device.connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
        <div class="wifi-net-actions">
          <button class="wifi-connect-btn ${device.connected ? 'disconnect' : ''}">
            ${device.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      `;
      
      // Bind click handler to Connect/Disconnect button or device row
      item.onclick = () => {
        handleBluetoothDeviceClick(index);
      };
      
      devicesList.appendChild(item);
    });
  }
}

function handleBluetoothDeviceClick(index) {
  const device = state.bluetoothDevices[index];
  if (device.isPairing) return; // Prevent double clicks during pairing
  
  if (device.connected) {
    // Disconnect
    device.connected = false;
    showNotification("🔌", `Disconnected from ${device.name}.`);
    renderBluetoothList();
  } else {
    // Connect (simulate pairing delay)
    const btn = document.querySelectorAll("#bluetooth-devices-list .wifi-connect-btn")[index];
    if (btn) {
      device.isPairing = true;
      btn.textContent = "Pairing...";
      btn.disabled = true;
      
      setTimeout(() => {
        device.isPairing = false;
        // Disconnect all other devices first
        state.bluetoothDevices.forEach(d => d.connected = false);
        
        device.connected = true;
        showNotification("📶", `Connected to ${device.name}.`);
        renderBluetoothList();
      }, 1200);
    }
  }
}

function toggleChargingPortState() {
  const portIcon = document.getElementById("topbar-charging-port");
  if (!portIcon) return;
  
  if (portIcon.classList.contains("open")) {
    portIcon.classList.remove("open");
    portIcon.classList.add("closed");
    showNotification("🔒", "Charging Port Closed.");
  } else {
    portIcon.classList.remove("closed");
    portIcon.classList.add("open");
    showNotification("🔌", "Charging Port Opened.");
  }
}


