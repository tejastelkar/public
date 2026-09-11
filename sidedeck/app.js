/**
 * SideDeck Landing Page Application
 * Smooth scrolling, Homebrew copy interaction, and Live Dock Flyout Switcher
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scrolling if available
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
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

  // 2. Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Homebrew Command Copy Interaction
  const brewBox = document.getElementById('brewBox');
  const copyBrewBtn = document.getElementById('copyBrewBtn');
  const copyText = document.getElementById('copyText');
  const brewCmd = document.getElementById('brewCmd');

  function copyCommand() {
    const cmd = brewCmd.textContent.trim();
    navigator.clipboard.writeText(cmd).then(() => {
      copyText.textContent = 'Copied!';
      brewBox.style.borderColor = '#0071e3';
      setTimeout(() => {
        copyText.textContent = 'Copy';
        brewBox.style.borderColor = '';
      }, 2000);
    }).catch(() => {
      copyText.textContent = 'Copied!';
      setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
    });
  }

  if (brewBox) brewBox.addEventListener('click', copyCommand);
  if (copyBrewBtn) copyBrewBtn.addEventListener('click', (e) => { e.stopPropagation(); copyCommand(); });

  // 4. Presence Counter Randomizer
  const onlineCount = document.getElementById('onlineCount');
  if (onlineCount) {
    let current = 24;
    setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      current = Math.max(16, Math.min(36, current + delta));
      onlineCount.textContent = current;
    }, 6000);
  }

  // 5. Interactive Dock Flyout Simulator
  const cardBtns = document.querySelectorAll('.card-btn');
  const flyoutBox = document.getElementById('flyoutContent');

  const flyoutTemplates = {
    focus: {
      title: "Focus Tasks",
      badge: "Pomodoro 25:00",
      beakTop: "12%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Tasks · 2 to go</span>
          <span class="flyout-status-chip">Focus 25:00</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12.5px;">
            <input type="checkbox" checked style="accent-color:#0068fe;">
            <span style="text-decoration:line-through; color:#8e8e93;">Draw the new landing page</span>
            <span style="margin-left:auto; font-size:10px; font-family:monospace; color:#8e8e93;">25:00</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12.5px;">
            <input type="checkbox" style="accent-color:#0068fe;">
            <span>Reply to the framer</span>
            <span style="margin-left:auto; font-size:10px; font-family:monospace; color:#8e8e93;">10:00</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12.5px;">
            <input type="checkbox" style="accent-color:#0068fe;">
            <span>Send the invoice</span>
            <span style="margin-left:auto; font-size:10px; font-family:monospace; color:#8e8e93;">05:00</span>
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <input type="text" placeholder="Add a task..." style="flex:1; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:6px 10px; color:#fff; font-size:12px;" disabled value="Draft launch tweet">
          <button style="background:#0068fe; color:#fff; border:none; border-radius:8px; width:28px; height:28px; cursor:pointer;">+</button>
        </div>
      `
    },
    clock: {
      title: "Digital Clock",
      badge: "System Sync",
      beakTop: "27%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Digital Clock</span>
          <span class="flyout-status-chip">Week 37</span>
        </div>
        <div style="text-align:center; padding:16px 0; background:rgba(255,255,255,0.04); border-radius:12px; margin-bottom:12px;">
          <div style="font-size:32px; font-weight:800; font-family:monospace; letter-spacing:-1px;">9:48:42 <small style="font-size:14px; color:#8e8e93;">PM</small></div>
          <div style="font-size:13px; color:#a1a1a6; margin-top:4px;">Friday, 11 September 2026</div>
        </div>
        <div style="display:flex; gap:6px; font-size:11.5px;">
          <span style="flex:1; text-align:center; padding:6px; border-radius:6px; background:rgba(0,113,227,0.25); color:#2997ff; font-weight:600;">System</span>
          <span style="flex:1; text-align:center; padding:6px; border-radius:6px; background:rgba(255,255,255,0.06); color:#a1a1a6;">12-hour</span>
          <span style="flex:1; text-align:center; padding:6px; border-radius:6px; background:rgba(255,255,255,0.06); color:#a1a1a6;">24-hour</span>
        </div>
      `
    },
    battery: {
      title: "Battery & Wi-Fi",
      badge: "Live Hardware",
      beakTop: "42%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Battery &amp; Wi-Fi</span>
          <span class="flyout-status-chip">Live Hardware</span>
        </div>
        <div class="battery-hero-block">
          <div class="battery-hero-top">
            <strong class="battery-pct">68%</strong>
            <span class="battery-time">5h 43m left</span>
          </div>
          <div class="battery-bar-track">
            <div class="battery-bar-fill" style="width: 68%;"></div>
          </div>
        </div>
        <div class="wifi-hero-block">
          <div class="wifi-line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
            <strong>Connected</strong>
            <span class="wifi-dbm">Signal: -65 dBm · Active</span>
          </div>
          <div class="wifi-chip-row">
            <span class="wifi-chip active">Home 5G</span>
            <span class="wifi-chip">Studio</span>
            <span class="wifi-chip">Cafe Guest</span>
          </div>
        </div>
      `
    },
    habits: {
      title: "Habit Tracker",
      badge: "6 Day Streak",
      beakTop: "58%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Habits · 6 day streak</span>
          <span class="flyout-status-chip" style="color:#00e1ff; background:rgba(0,225,255,0.15);">Today 4</span>
        </div>
        <div style="padding:12px; background:rgba(255,255,255,0.04); border-radius:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#8e8e93; margin-bottom:8px;">
            <span>36-day visual consistency</span>
            <span>Less ···· More</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(12, 1fr); gap:4px;">
            ${Array.from({length: 36}, (_, i) => `<div style="height:14px; border-radius:3px; background:${['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.25)', '#8e8e93', '#c7c7cc', '#ffffff'][i % 5]};"></div>`).join('')}
          </div>
        </div>
        <button style="width:100%; padding:8px; border-radius:8px; background:#0068fe; color:#fff; border:none; font-weight:600; font-size:12.5px; cursor:pointer;">Check in Today (+1)</button>
      `
    },
    water: {
      title: "Hydration",
      badge: "4 of 8 Today",
      beakTop: "72%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Hydration · 4 glasses</span>
          <span class="flyout-status-chip" style="color:#00e1ff; background:rgba(0,225,255,0.15);">1,000 / 2,000 ml</span>
        </div>
        <div style="padding:14px; background:rgba(0,225,255,0.06); border:1px solid rgba(0,225,255,0.2); border-radius:12px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:24px; font-weight:800; font-family:monospace; color:#00e1ff;">01:38</div>
            <div style="font-size:11.5px; color:#8e8e93;">Next reminder in 1 hour 38m</div>
          </div>
          <button style="padding:8px 14px; border-radius:8px; background:#0068fe; color:#fff; border:none; font-weight:600; font-size:12px; cursor:pointer;">+250 ml</button>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:#8e8e93;">
          <span>Streak: 7 days</span>
          <span>Avg: 4.6 / day</span>
          <span>Best: 8</span>
        </div>
      `
    },
    notes: {
      title: "Quick Notes",
      badge: "3 Saved",
      beakTop: "88%",
      html: `
        <div class="flyout-header-row">
          <span class="flyout-title">Scratchpad Notes</span>
          <span class="flyout-status-chip">3 Active</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px; padding:7px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12px;">
            <input type="checkbox" style="accent-color:#0068fe;">
            <span>Ship the update</span>
            <span style="margin-left:auto; font-size:10px; color:#8e8e93;">2m ago</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:7px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12px;">
            <input type="checkbox" style="accent-color:#0068fe;">
            <span>Call the framer back</span>
            <span style="margin-left:auto; font-size:10px; color:#8e8e93;">1h ago</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:7px 10px; background:rgba(255,255,255,0.05); border-radius:8px; font-size:12px;">
            <input type="checkbox" style="accent-color:#0068fe;">
            <span>Rent, Friday</span>
            <span style="margin-left:auto; font-size:10px; color:#8e8e93;">yesterday</span>
          </div>
        </div>
        <input type="text" placeholder="Jot something down..." style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:6px 10px; color:#fff; font-size:12px;" disabled value="Meeting at 4pm">
      `
    }
  };

  cardBtns.forEach((btn) => {
    const activateCard = () => {
      const widget = btn.getAttribute('data-widget');
      if (!widget || !flyoutTemplates[widget]) return;

      cardBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const data = flyoutTemplates[widget];
      flyoutBox.style.setProperty('--beak-top', data.beakTop);
      flyoutBox.innerHTML = data.html;
    };

    btn.addEventListener('mouseenter', activateCard);
    btn.addEventListener('click', activateCard);
  });
});
