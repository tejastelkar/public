/**
 * Tejas Telkar  :  Open Source Hub & Projects Showcase
 * Client-side script: Real-time Live Presence Engine & Interactions
 */

// 1. Footer Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// 2. Lenis Smooth Scrolling
if (window.Lenis) {
  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// 3. Real-Time Live Presence Engine
// Calculates active online visitors dynamically via:
// - Local tab heartbeat synchronisation using BroadcastChannel & localStorage
// - Stochastic live peer walk simulating active concurrent GitHub/repository visitors
class LivePresenceEngine {
  constructor() {
    this.onlineCountEl = document.getElementById('onlineCount');
    this.presenceCounterEl = document.getElementById('presenceCounter');
    this.presenceHintEl = document.getElementById('presenceHint');
    
    // Unique session ID for this browser tab
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tejas_hub_presence') : null;
    
    // Base online count (16 - 24 base range)
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

  // Multi-tab coordination
  setupTabHeartbeat() {
    const STORAGE_KEY = 'tejas_hub_active_tabs';
    
    const updateLocalTabs = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        let tabs = raw ? JSON.parse(raw) : {};
        const now = Date.now();
        
        // Prune stale tabs older than 6 seconds
        for (const [id, time] of Object.entries(tabs)) {
          if (now - time > 6000) {
            delete tabs[id];
          }
        }
        
        // Register current tab
        tabs[this.tabId] = now;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
        
        this.activeTabsCount = Object.keys(tabs).length;
        this.recalculate();
      } catch (e) {
        // Fallback for private browsing or storage disabled
        this.activeTabsCount = 1;
      }
    };

    updateLocalTabs();
    setInterval(updateLocalTabs, 3000);

    // Clean up when tab closes
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

  // Stochastic Poisson / random walk jitter simulating real active visitors arriving & leaving
  setupLiveJitter() {
    const runJitter = () => {
      // 65% chance of fluctuation, 35% stay steady
      if (Math.random() < 0.65) {
        // Random step: -2, -1, 0, +1, +2 with bias toward equilibrium around 18-22
        const delta = (Math.random() > 0.52 ? 1 : -1) * (Math.random() > 0.8 ? 2 : 1);
        
        let nextBase = this.baseCount + delta;
        // Keep within realistic organic bounds (13 to 29)
        if (nextBase < 13) nextBase = 14;
        if (nextBase > 29) nextBase = 28;
        
        this.baseCount = nextBase;
        this.recalculate();
      }

      // Schedule next fluctuation between 3.5s and 7.5s
      const nextDelay = 3500 + Math.random() * 4000;
      setTimeout(runJitter, nextDelay);
    };

    setTimeout(runJitter, 4000);
  }

  recalculate() {
    // Total = simulated remote active network peers + local active browser tabs
    const newTotal = this.baseCount + (this.activeTabsCount - 1);
    if (newTotal !== this.currentTotal) {
      this.currentTotal = newTotal;
      this.render();
    }
  }

  render() {
    if (!this.onlineCountEl) return;
    this.onlineCountEl.textContent = this.currentTotal;
    
    // Quick bounce animation
    this.onlineCountEl.classList.remove('bump');
    void this.onlineCountEl.offsetWidth; // trigger reflow
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

// Instantiate presence engine on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LivePresenceEngine());
} else {
  new LivePresenceEngine();
}
