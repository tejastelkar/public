/* SideDeck Interactive Client Runtime
   Full 1:1 Sydedock Architecture, Live Hardware Simulation & Dynamic Flyout Engine
   Handcrafted for Tejas Telkar
*/

(function() {
  'use strict';

  // --- 1. Lenis Smooth Scroll ---
  if (typeof Lenis !== 'undefined') {
    try {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis init failed:', e);
    }
  }

  // --- 2. State & References ---
  const state = {
    scrollCard: null,
    activeCard: null,
    lockedCard: null,
    clockFormat: 'system', // 'system', '12', '24'
    showSeconds: true,
    showDate: true,
    timerTotal: 25 * 60,
    timerRemaining: 24 * 60 + 38,
    timerRunning: true,
    waterTimerRemaining: 14 * 60 + 22,
    waterGlasses: 4,
    waterInterval: 45,
    habitsLogged: 4,
  };

  const cards = ['focus', 'clock', 'status', 'habits', 'hydration', 'notes'];
  const cardWraps = document.querySelectorAll('.dock .card-wrap');
  const allFlyouts = document.querySelectorAll('.dock .flyout, #flyout-settings');
  const mainDock = document.getElementById('mainDock');

  // --- 3. Flyout Manager ---
  function setActiveCard(cardKey, isManual = false) {
    if (isManual) {
      state.activeCard = cardKey;
    } else {
      state.scrollCard = cardKey;
      state.activeCard = cardKey;
      state.lockedCard = null; // scroll overrides lock
    }

    // Update dock dimming (data-lit)
    cardWraps.forEach(wrap => {
      const key = wrap.getAttribute('data-card-key');
      if (!state.activeCard || state.activeCard === 'hero') {
        wrap.setAttribute('data-lit', 'true');
      } else if (key === state.activeCard) {
        wrap.setAttribute('data-lit', 'true');
      } else {
        wrap.setAttribute('data-lit', 'false');
      }
    });

    // Toggle Flyouts
    allFlyouts.forEach(flyout => {
      flyout.style.display = 'none';
    });

    if (state.activeCard && state.activeCard !== 'hero') {
      const targetFlyout = document.getElementById(`flyout-${state.activeCard}`);
      if (targetFlyout) {
        targetFlyout.style.display = 'flex';
      }
    }
  }

  // Bind mouse hover & click on dock card-wraps
  cardWraps.forEach(wrap => {
    const key = wrap.getAttribute('data-card-key');
    if (!key) return;

    wrap.addEventListener('mouseenter', () => {
      setActiveCard(key, true);
    });

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      state.lockedCard = (state.lockedCard === key) ? null : key;
      setActiveCard(state.lockedCard || key, true);
    });
  });

  // When mouse leaves the dock, revert to currently scrolled feature section
  if (mainDock) {
    mainDock.addEventListener('mouseleave', () => {
      if (!state.lockedCard) {
        setActiveCard(state.scrollCard, false);
      }
    });
  }

  // Settings Handle Click
  window.toggleSettingsFlyout = function() {
    const settingsFlyout = document.getElementById('flyout-settings');
    if (!settingsFlyout) return;

    const isOpen = settingsFlyout.style.display === 'flex';
    allFlyouts.forEach(f => f.style.display = 'none');
    cardWraps.forEach(w => w.setAttribute('data-lit', isOpen ? 'true' : 'false'));

    if (!isOpen) {
      settingsFlyout.style.display = 'flex';
      state.lockedCard = 'settings';
      state.activeCard = 'settings';
    } else {
      state.lockedCard = null;
      setActiveCard(state.scrollCard, false);
    }
  };

  // Close flyouts on outer click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dock-stack') && !e.target.closest('.flyout')) {
      state.lockedCard = null;
      setActiveCard(state.scrollCard, false);
    }
  });

  // --- 4. Scroll-Driven Intersection Observer ---
  const sections = document.querySelectorAll('section[data-card], section#hero');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -25% 0px',
    threshold: 0.2,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cardKey = entry.target.getAttribute('data-card') || 'hero';
        setActiveCard(cardKey === 'hero' ? null : cardKey, false);
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // --- 5. Live Digital Clock Engine ---
  const dockClockTime = document.getElementById('dockClockTime');
  const dockClockDate = document.getElementById('dockClockDate');
  const flyoutClockBig = document.getElementById('flyoutClockBig');
  const flyoutClockSec = document.getElementById('flyoutClockSeconds');
  const flyoutClockPeriod = document.getElementById('flyoutClockPeriod');
  const flyoutClockFullDate = document.getElementById('flyoutClockFullDate');

  const analogHourHand = document.getElementById('analogHourHand');
  const analogMinuteHand = document.getElementById('analogMinuteHand');
  const analogSecondHand = document.getElementById('analogSecondHand');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function updateLiveClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const day = now.getDate();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();

    const pad = (n) => String(n).padStart(2, '0');
    let displayHours = hours;
    let period = hours >= 12 ? 'PM' : 'AM';

    if (state.clockFormat === '12') {
      displayHours = hours % 12 || 12;
    } else if (state.clockFormat === '24') {
      period = '';
    } else {
      // system default: 12-hour with period
      displayHours = hours % 12 || 12;
    }

    const timeString = `${displayHours}:${pad(minutes)}`;
    const secString = `:${pad(seconds)}`;
    const dateShort = `${dayNames[dayOfWeek]}, ${monthNames[month]} ${day}`;
    const dateFull = `${fullDays[dayOfWeek]}, ${fullMonths[month]} ${day}`;

    // Update Dock Clock
    if (dockClockTime) {
      if (state.showSeconds) {
        dockClockTime.innerHTML = `${displayHours}<span style="color:var(--colon)">:</span>${pad(minutes)}<span style="font-size:0.55em;opacity:0.65;margin-left:2px">${pad(seconds)}</span>`;
      } else {
        dockClockTime.innerHTML = `${displayHours}<span style="color:var(--colon)">:</span>${pad(minutes)}`;
      }
    }

    if (dockClockDate) {
      dockClockDate.style.display = state.showDate ? 'block' : 'none';
      dockClockDate.textContent = dateShort;
    }

    // Update Clock Flyout
    if (flyoutClockBig) flyoutClockBig.textContent = timeString;
    if (flyoutClockSec) flyoutClockSec.textContent = secString;
    if (flyoutClockPeriod) flyoutClockPeriod.textContent = period;
    if (flyoutClockFullDate) flyoutClockFullDate.textContent = dateFull;

    // Update Gallery Analog Dial Hands
    if (analogHourHand && analogMinuteHand && analogSecondHand) {
      const hDeg = (hours % 12 + minutes / 60) * 30;
      const mDeg = (minutes + seconds / 60) * 6;
      const sDeg = seconds * 6;
      analogHourHand.setAttribute('transform', `rotate(${hDeg} 50 50)`);
      analogMinuteHand.setAttribute('transform', `rotate(${mDeg} 50 50)`);
      analogSecondHand.setAttribute('transform', `rotate(${sDeg} 50 50)`);
    }
  }

  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  window.setClockFormat = function(fmt) {
    state.clockFormat = fmt;
    document.querySelectorAll('.flyout-capsule button').forEach(b => b.classList.remove('is-on'));
    const btn = document.getElementById(fmt === 'system' ? 'fmtSystem' : fmt === '12' ? 'fmt12' : 'fmt24');
    if (btn) btn.classList.add('is-on');
    updateLiveClock();
  };

  window.toggleClockSeconds = function() {
    state.showSeconds = !state.showSeconds;
    const btn = document.getElementById('toggleSeconds');
    if (btn) btn.classList.toggle('is-on', state.showSeconds);
    updateLiveClock();
  };

  window.toggleClockDate = function() {
    state.showDate = !state.showDate;
    const btn = document.getElementById('toggleDate');
    if (btn) btn.classList.toggle('is-on', state.showDate);
    updateLiveClock();
  };

  // --- 6. Focus Pomodoro Bolt Timer Engine ---
  const focusMinEl = document.getElementById('focusMinutes');
  const focusSecEl = document.getElementById('focusSeconds');
  const boltProgressPath = document.getElementById('boltProgressPath');

  function updateFocusTimer() {
    if (!state.timerRunning) return;
    if (state.timerRemaining > 0) {
      state.timerRemaining--;
    } else {
      state.timerRemaining = state.timerTotal;
    }

    const mins = Math.floor(state.timerRemaining / 60);
    const secs = state.timerRemaining % 60;
    const pad = (n) => String(n).padStart(2, '0');

    if (focusMinEl) focusMinEl.textContent = pad(mins);
    if (focusSecEl) focusSecEl.textContent = pad(secs);

    if (boltProgressPath) {
      const progress = 1 - (state.timerRemaining / state.timerTotal);
      const totalDash = 494;
      const offset = totalDash * (1 - progress);
      boltProgressPath.style.strokeDashoffset = String(offset);
    }
  }

  setInterval(updateFocusTimer, 1000);

  // --- 7. Hydration Water Reservoir & Physics Slosh ---
  const dockWaterTimer = document.getElementById('dockWaterTimer');
  const flyoutWaterNext = document.getElementById('flyoutWaterNextTimer');
  const flyoutWaterToday = document.getElementById('flyoutWaterToday');
  const waterSheenPath = document.getElementById('waterSheenPath');
  const waterBodyPath = document.getElementById('waterBodyPath');

  let waveStep = 0;
  function animateWaterWave() {
    waveStep += 0.04;
    const h1 = 16 + Math.sin(waveStep) * 4;
    const h2 = 22 + Math.cos(waveStep * 0.8) * 3;
    const mid1 = 8 + Math.cos(waveStep) * 4;
    const mid2 = 18 + Math.sin(waveStep * 0.9) * 3;

    if (waterSheenPath) {
      waterSheenPath.setAttribute('d', `M 0 117 L 0 ${h1} Q 41 ${mid1} 83 ${h1 - 4} Q 125 ${mid1 + 6} 166 ${h1} L 166 117 Z`);
    }
    if (waterBodyPath) {
      waterBodyPath.setAttribute('d', `M 0 117 L 0 ${h2} Q 41 ${mid2} 83 ${h2 - 3} Q 125 ${mid2 + 5} 166 ${h2} L 166 117 Z`);
    }
    requestAnimationFrame(animateWaterWave);
  }
  requestAnimationFrame(animateWaterWave);

  function updateWaterTimer() {
    if (state.waterTimerRemaining > 0) {
      state.waterTimerRemaining--;
    } else {
      state.waterTimerRemaining = state.waterInterval * 60;
    }
    const mins = Math.floor(state.waterTimerRemaining / 60);
    const secs = state.waterTimerRemaining % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const str = `${pad(mins)}:${pad(secs)}`;

    if (dockWaterTimer) dockWaterTimer.textContent = str;
    if (flyoutWaterNext) flyoutWaterNext.textContent = str;
  }
  setInterval(updateWaterTimer, 1000);

  window.drinkWaterGlass = function() {
    state.waterGlasses++;
    state.waterTimerRemaining = state.waterInterval * 60;
    if (flyoutWaterToday) flyoutWaterToday.textContent = `${state.waterGlasses} glasses today`;

    // Splash animation
    if (waterBodyPath) {
      waterBodyPath.style.transition = 'transform 0.3s cubic-bezier(0.2, 1.4, 0.4, 1)';
      waterBodyPath.style.transform = 'scaleY(1.15)';
      setTimeout(() => {
        waterBodyPath.style.transform = 'scaleY(1)';
      }, 350);
    }
  };

  window.adjustInterval = function(delta) {
    state.waterInterval = Math.max(15, Math.min(120, state.waterInterval + delta));
    const el = document.getElementById('intervalValue');
    if (el) el.textContent = `${state.waterInterval} min`;
  };

  // --- 8. Habit Matrix 36-Dot Grid Generator ---
  function buildHabitGrid(containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = '';

    const opacities = [
      '#a1a1a1', 'rgba(255,255,255,0.75)', 'rgba(161,161,161,0.5)', '#ffffff',
      '#a1a1a1', 'empty', 'rgba(161,161,161,0.5)', 'rgba(255,255,255,0.75)',
      '#ffffff', '#a1a1a1', 'rgba(255,255,255,0.75)', 'rgba(161,161,161,0.5)',
      'empty', '#a1a1a1', '#ffffff', 'rgba(255,255,255,0.75)',
      '#a1a1a1', '#ffffff', 'rgba(161,161,161,0.5)', 'empty',
      'rgba(255,255,255,0.75)', '#ffffff', '#a1a1a1', 'rgba(255,255,255,0.75)',
      'rgba(161,161,161,0.5)', '#a1a1a1', '#ffffff', 'rgba(255,255,255,0.75)',
      'empty', '#a1a1a1', 'rgba(255,255,255,0.75)', '#ffffff',
      '#a1a1a1', 'rgba(161,161,161,0.5)', 'rgba(255,255,255,0.75)', '#ffffff'
    ];

    opacities.forEach((style, i) => {
      const dot = document.createElement('span');
      dot.className = 'habit-dot';
      if (style === 'empty') {
        dot.style.background = 'rgba(255,255,255,0.05)';
        dot.style.boxShadow = 'inset 0 0 0 0.6px rgba(255,255,255,0.3)';
      } else {
        dot.style.background = style;
      }
      dot.title = `Day ${i + 1} completion`;
      dot.addEventListener('click', () => {
        dot.style.background = '#00e1ff';
        dot.style.boxShadow = '0 0 8px #00e1ff';
      });
      grid.appendChild(dot);
    });
  }

  buildHabitGrid('dockHabitGrid');
  buildHabitGrid('galleryHabitGrid');

  window.logHabitToday = function() {
    state.habitsLogged++;
    const countEl = document.getElementById('habitsTodayCount');
    if (countEl) countEl.textContent = `${state.habitsLogged} of 5 habits`;
  };

  // --- 9. Tasks & Notes Interactive Checkboxes ---
  window.toggleTaskDone = function(row) {
    const line = row.querySelector('.flyout-line');
    const check = row.querySelector('.flyout-check');
    if (!line || !check) return;

    const isDone = line.classList.toggle('is-done');
    check.classList.toggle('is-done', isDone);
    if (isDone) {
      check.innerHTML = '<svg viewBox="0 0 14 14" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 7.4 L5.4 10.6 L12 3.6"/></svg>';
    } else {
      check.innerHTML = '';
    }
  };

  window.addNewTask = function(e) {
    e.preventDefault();
    const input = document.getElementById('newTaskInput');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    const newRow = document.createElement('div');
    newRow.className = 'flyout-row';
    newRow.onclick = function() { window.toggleTaskDone(this); };
    newRow.innerHTML = `
      <span class="flyout-check"></span>
      <span class="flyout-line">${text}</span>
      <span class="flyout-meta mono">Just now</span>
    `;

    const form = input.closest('.flyout-composer');
    form.parentNode.insertBefore(newRow, form);
  };

  window.toggleNoteCheck = function(row) {
    const line = row.querySelector('.flyout-line');
    const check = row.querySelector('.flyout-check');
    if (!line || !check) return;

    const isDone = line.classList.toggle('is-done');
    check.classList.toggle('is-done', isDone);
    if (isDone) {
      check.innerHTML = '<svg viewBox="0 0 14 14" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 7.4 L5.4 10.6 L12 3.6"/></svg>';
    } else {
      check.innerHTML = '';
    }
  };

  window.addNewNote = function(e) {
    e.preventDefault();
    const input = document.getElementById('newNoteInput');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    const newRow = document.createElement('div');
    newRow.className = 'flyout-row';
    newRow.onclick = function() { window.toggleNoteCheck(this); };
    newRow.innerHTML = `
      <span class="flyout-check"></span>
      <span class="flyout-line">${text}</span>
      <span class="flyout-meta mono">Just now</span>
    `;

    const form = input.closest('.flyout-composer');
    form.parentNode.insertBefore(newRow, form);
  };

  // --- 10. Copy Homebrew Command ---
  function handleBrewCopy(btnId) {
    const cmd = 'brew install --cask sidedeck';
    navigator.clipboard.writeText(cmd).then(() => {
      const btn = document.getElementById(btnId);
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    }).catch(() => {
      prompt('Copy Homebrew command:', cmd);
    });
  }

  const copyBrewBtn = document.getElementById('copyBrewBtn');
  if (copyBrewBtn) {
    copyBrewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleBrewCopy('copyBrewText');
    });
  }

  const brewBox = document.getElementById('brewBox');
  if (brewBox) {
    brewBox.addEventListener('click', () => {
      handleBrewCopy('copyBrewText');
    });
  }

  window.copyBrewCmd = function(e) {
    if (e) e.stopPropagation();
    handleBrewCopy('planBrewCopy');
  };

  // --- 11. Live Online Visitor Presence Simulation ---
  const countEl = document.getElementById('onlineCount');
  if (countEl) {
    let count = 24;
    setInterval(() => {
      const delta = Math.random() > 0.5 ? 1 : -1;
      count = Math.max(16, Math.min(38, count + delta));
      countEl.textContent = count;
    }, 12000);
  }

  // --- 12. Settings Edge Selection ---
  window.setEdge = function(edge) {
    const dock = document.querySelector('.mac-dock');
    if (dock) {
      if (edge === 'left') {
        dock.style.left = '14px';
        dock.style.right = 'auto';
      } else {
        dock.style.left = 'auto';
        dock.style.right = '14px';
      }
    }
  };

})();
