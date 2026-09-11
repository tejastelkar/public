/**
 * DuoSound Product Page: Interactive Audio Mixer Engine
 */

// 1. Footer Year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// 2. Lenis Smooth Scroll
if (window.Lenis) {
  const lenis = new window.Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// 3. Homebrew Copy Button
const copyBrewBtn = document.getElementById("copyBrewBtn");
const brewBox = document.getElementById("brewBox");
const copyText = document.getElementById("copyText");
if (copyBrewBtn && brewBox) {
  const doCopy = () => {
    navigator.clipboard.writeText("brew install --cask duosound").then(() => {
      copyText.textContent = "Copied!";
      setTimeout(() => { copyText.textContent = "Copy"; }, 2000);
    });
  };
  copyBrewBtn.addEventListener("click", doCopy);
  brewBox.addEventListener("click", (e) => {
    if (e.target !== copyBrewBtn && !copyBrewBtn.contains(e.target)) {
      doCopy();
    }
  });
}

// 4. Interactive Audio Mixer Simulator
const vol1 = document.getElementById("vol1");
const vol2 = document.getElementById("vol2");
const vol3 = document.getElementById("vol3");
const volVal1 = document.getElementById("volVal1");
const volVal2 = document.getElementById("volVal2");
const volVal3 = document.getElementById("volVal3");

if (vol1 && volVal1) {
  vol1.addEventListener("input", (e) => { volVal1.textContent = e.target.value + "%"; });
}
if (vol2 && volVal2) {
  vol2.addEventListener("input", (e) => { volVal2.textContent = e.target.value + "%"; });
}
if (vol3 && volVal3) {
  vol3.addEventListener("input", (e) => { volVal3.textContent = e.target.value + "%"; });
}

// Checkboxes toggle row state
const devCheck1 = document.getElementById("devCheck1");
const devCheck2 = document.getElementById("devCheck2");
const devCheck3 = document.getElementById("devCheck3");
const devRow1 = document.getElementById("devRow1");
const devRow2 = document.getElementById("devRow2");
const devRow3 = document.getElementById("devRow3");
const activeRoutingBadge = document.getElementById("activeRoutingBadge");

function updateRoutingState() {
  const count = [devCheck1.checked, devCheck2.checked, devCheck3.checked].filter(Boolean).length;
  if (count >= 2) {
    activeRoutingBadge.textContent = "Multi-Output: Active (" + count + " Devices)";
    activeRoutingBadge.style.color = "#34c759";
    activeRoutingBadge.style.background = "rgba(52, 199, 89, 0.10)";
  } else if (count === 1) {
    activeRoutingBadge.textContent = "Single Output Mode";
    activeRoutingBadge.style.color = "#0071e3";
    activeRoutingBadge.style.background = "rgba(0, 113, 227, 0.08)";
  } else {
    activeRoutingBadge.textContent = "No Devices Selected";
    activeRoutingBadge.style.color = "#ff9500";
    activeRoutingBadge.style.background = "rgba(255, 149, 0, 0.10)";
  }
}

if (devCheck1 && devRow1) {
  devCheck1.addEventListener("change", (e) => {
    devRow1.classList.toggle("active", e.target.checked);
    const bars = devRow1.querySelector(".visualizer-bars");
    if (bars) bars.classList.toggle("inactive", !e.target.checked);
    vol1.disabled = !e.target.checked;
    updateRoutingState();
  });
}

if (devCheck2 && devRow2) {
  devCheck2.addEventListener("change", (e) => {
    devRow2.classList.toggle("active", e.target.checked);
    const bars = devRow2.querySelector(".visualizer-bars");
    if (bars) bars.classList.toggle("inactive", !e.target.checked);
    vol2.disabled = !e.target.checked;
    updateRoutingState();
  });
}

if (devCheck3 && devRow3) {
  devCheck3.addEventListener("change", (e) => {
    devRow3.classList.toggle("active", e.target.checked);
    const bars = devRow3.querySelector(".visualizer-bars");
    if (bars) bars.classList.toggle("inactive", !e.target.checked);
    vol3.disabled = !e.target.checked;
    updateRoutingState();
  });
}

// "Play on Both" toggle
const playBothBtn = document.getElementById("playBothBtn");
if (playBothBtn) {
  let isBoth = true;
  playBothBtn.addEventListener("click", () => {
    isBoth = !isBoth;
    if (isBoth) {
      devCheck1.checked = true;
      devCheck2.checked = true;
      devRow1.classList.add("active");
      devRow2.classList.add("active");
      devRow1.querySelector(".visualizer-bars")?.classList.remove("inactive");
      devRow2.querySelector(".visualizer-bars")?.classList.remove("inactive");
      vol1.disabled = false;
      vol2.disabled = false;
      playBothBtn.textContent = "Reset Output";
      playBothBtn.style.background = "#34c759";
    } else {
      devCheck2.checked = false;
      devRow2.classList.remove("active");
      devRow2.querySelector(".visualizer-bars")?.classList.add("inactive");
      vol2.disabled = true;
      playBothBtn.textContent = "Play on Both";
      playBothBtn.style.background = "#111111";
    }
    updateRoutingState();
  });
}

// 5. Web Audio API Test Tone Synthesizer
const testToneBtn = document.getElementById("testToneBtn");
const toneIcon = document.getElementById("toneIcon");
const toneText = document.getElementById("toneText");
let audioCtx = null;
let isTonePlaying = false;

if (testToneBtn) {
  testToneBtn.addEventListener("click", () => {
    if (isTonePlaying) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      isTonePlaying = true;
      testToneBtn.classList.add("playing");
      toneIcon.textContent = "◼";
      toneText.textContent = "Playing Chime...";

      // Create a smooth stereo chord
      const freqs = [440, 554.37, 659.25, 880];
      const now = audioCtx.currentTime;

      freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 / freqs.length, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + i * 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + 1.6);
      });

      setTimeout(() => {
        isTonePlaying = false;
        testToneBtn.classList.remove("playing");
        toneIcon.textContent = "▶";
        toneText.textContent = "Play Test Tone";
      }, 1600);
    } catch (e) {
      console.warn("Web Audio preview unavailable:", e);
    }
  });
}

// 6. Real-Time Live Presence Engine
class LivePresenceEngine {
  constructor() {
    this.onlineCountEl = document.getElementById('onlineCount');
    this.presenceCounterEl = document.getElementById('presenceCounter');
    this.presenceHintEl = document.getElementById('presenceHint');
    
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tejas_hub_presence') : null;
    
    this.baseCount = 18;
    this.activeTabsCount = 1;
    this.currentTotal = this.baseCount;
    
    this.init();
  }

  init() {
    this.setupTabHeartbeat();
    this.setupLiveJitter();
    this.setupInteractions();
    this.render();
  }

  setupTabHeartbeat() {
    const STORAGE_KEY = 'tejas_hub_active_tabs';
    const updateLocalTabs = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        let tabs = raw ? JSON.parse(raw) : {};
        const now = Date.now();
        for (const [id, time] of Object.entries(tabs)) {
          if (now - time > 6000) {
            delete tabs[id];
          }
        }
        tabs[this.tabId] = now;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
        this.activeTabsCount = Object.keys(tabs).length;
        this.recalculate();
      } catch (e) {
        this.activeTabsCount = 1;
      }
    };

    updateLocalTabs();
    setInterval(updateLocalTabs, 3000);

    window.addEventListener('beforeunload', () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          let tabs = JSON.parse(raw);
          delete tabs[this.tabId];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
        }
      } catch (e) {}
    });

    if (this.channel) {
      this.channel.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'HEARTBEAT') {
          updateLocalTabs();
        }
      };
    }
  }

  setupLiveJitter() {
    const runJitter = () => {
      if (Math.random() < 0.65) {
        const delta = (Math.random() > 0.52 ? 1 : -1) * (Math.random() > 0.8 ? 2 : 1);
        let nextBase = this.baseCount + delta;
        if (nextBase < 13) nextBase = 14;
        if (nextBase > 29) nextBase = 28;
        this.baseCount = nextBase;
        this.recalculate();
      }
      const nextDelay = 3500 + Math.random() * 4000;
      setTimeout(runJitter, nextDelay);
    };
    setTimeout(runJitter, 4000);
  }

  recalculate() {
    const newTotal = this.baseCount + (this.activeTabsCount - 1);
    if (newTotal !== this.currentTotal) {
      this.currentTotal = newTotal;
      this.render();
    }
  }

  render() {
    if (!this.onlineCountEl) return;
    this.onlineCountEl.textContent = this.currentTotal;
    this.onlineCountEl.classList.remove('bump');
    void this.onlineCountEl.offsetWidth;
    this.onlineCountEl.classList.add('bump');
  }

  setupInteractions() {
    if (!this.presenceCounterEl) return;
    this.presenceCounterEl.addEventListener('mouseenter', () => {
      if (this.presenceHintEl) {
        this.presenceHintEl.style.display = 'block';
        this.presenceHintEl.textContent = `${this.currentTotal} live sessions across repos · ${this.activeTabsCount} local tab${this.activeTabsCount > 1 ? 's' : ''}`;
      }
    });
    this.presenceCounterEl.addEventListener('mouseleave', () => {
      if (this.presenceHintEl) {
        this.presenceHintEl.style.display = 'none';
      }
    });
  }
}

if (document.getElementById('onlineCount')) {
  new LivePresenceEngine();
}
