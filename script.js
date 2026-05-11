/* ===================================================================
   PRESENTATION RUNTIME — Search & Breast Cancer
   -------------------------------------------------------------------
   • Slide navigation (arrows / space / click / number jump / overview)
   • Per-slide "fragment" reveal (elements with class .fragment)
   • Auto-scale slides to viewport while keeping 16:9 aspect ratio
   • Builds the day-by-day example timeline (slide 7B) from data below
   =================================================================== */

(() => {
  'use strict';

  /* ---------------- Slide setup ---------------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total  = slides.length;
  let index    = 0;
  let revealTimers = []; // cancellable cascading-reveal timeouts

  /* Tunable: time (ms) between successive fragments on a slide.
     Lower = snappier, higher = more dramatic stagger. */
  const STAGGER_MS    = 110;
  const FIRST_DELAY   = 180;  // delay before first fragment appears

  const counterEl  = document.getElementById('counter');
  const progressEl = document.getElementById('progress');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const overviewEl = document.getElementById('overview');
  const overviewGrid = document.getElementById('overviewGrid');

  /* ---------------- Build the example timeline (slide 8) ----------
     Real data from the paper's Table II — same user shown on slide 9.
     Each entry: { offset, label, tags: [...], ddx?: true }
       offset = day number (1..35)
       label  = optional date label shown inside the day cell
       tags   = colored dots, one per real query on that day
  ------------------------------------------------------------------ */
  const daysData = [
    // Week 1 — first symptom appears (Nov 13)
    { offset:  1, label: 'Nov 13', tags: ['symptom'] },     // "feels like lump in breast"
    { offset:  2, tags: [] },
    { offset:  3, tags: [] },
    { offset:  4, tags: [] },
    { offset:  5, tags: [] },
    { offset:  6, tags: [] },
    { offset:  7, tags: [] },

    // Week 2 — silent
    { offset:  8, tags: [] },
    { offset:  9, tags: [] },
    { offset: 10, tags: [] },
    { offset: 11, tags: [] },
    { offset: 12, tags: [] },
    { offset: 13, tags: [] },
    { offset: 14, tags: [] },

    // Week 3 — biopsy day (Dec 1)
    { offset: 15, tags: [] },
    { offset: 16, tags: [] },
    { offset: 17, tags: [] },
    { offset: 18, tags: [] },
    { offset: 19, label: 'Dec 1',  tags: ['symptom', 'diag'] },  // "pain after biopsy", "what happens after breast biopsy"
    { offset: 20, tags: [] },
    { offset: 21, tags: [] },

    // Week 4 — waiting on results (Dec 9)
    { offset: 22, tags: [] },
    { offset: 23, tags: [] },
    { offset: 24, tags: [] },
    { offset: 25, tags: [] },
    { offset: 26, tags: [] },
    { offset: 27, label: 'Dec 9',  tags: ['diag', 'symptom', 'diag'] },  // biopsy-results queries
    { offset: 28, tags: [] },

    // Week 5 — DDX, then planning (Dec 12–15)
    { offset: 29, tags: [] },
    { offset: 30, label: 'Dec 12', tags: ['desc', 'desc', 'desc', 'prognosis', 'prognosis', 'treat', 'treat'], ddx: true },  // diagnosis day
    { offset: 31, label: 'Dec 13', tags: ['treat', 'treat'] },
    { offset: 32, tags: [] },
    { offset: 33, label: 'Dec 15', tags: ['prof', 'treat', 'treat', 'treat'] },
    { offset: 34, tags: [] },
    { offset: 35, tags: [] }
  ];

  function buildExampleTimeline () {
    const host = document.getElementById('exampleTimeline');
    if (!host) return;

    // group days into rows of 7
    const weeks = [];
    for (let i = 0; i < daysData.length; i += 7) {
      weeks.push(daysData.slice(i, i + 7));
    }

    const weekLabels = [
      'week 1 — first symptom',
      'week 2',
      'week 3 — biopsy',
      'week 4 — waiting',
      'week 5 — DDX'
    ];
    weeks.forEach((week, wi) => {
      const row = document.createElement('div');
      row.className = 'te-week';
      row.innerHTML = `
        <div class="te-week-label">${weekLabels[wi] || ''}</div>
        <div class="te-days"></div>
      `;
      const daysHost = row.querySelector('.te-days');
      week.forEach(day => {
        const d = document.createElement('div');
        d.className = 'te-day' + (day.ddx ? ' te-day--ddx' : '') + (day.tags.length === 0 ? ' te-day--empty' : '');
        const tagsHtml = day.tags.length
          ? day.tags.map(t => `<i class="te-day-tag tag--${t}"></i>`).join('')
          : '';
        const topLine = day.label
          ? `<span class="te-day-date">${day.label}</span>`
          : `<span class="te-day-num">d${day.offset}</span>`;
        d.innerHTML = `
          ${topLine}
          <span class="te-day-tags">${tagsHtml}</span>
        `;
        daysHost.appendChild(d);
      });
      host.appendChild(row);
    });
  }

  /* ---------------- Navigation ---------------- */
  function showSlide (next) {
    next = Math.max(0, Math.min(total - 1, next));
    if (next === index && slides[index].classList.contains('is-active')) return;

    // cancel any pending reveals from the slide we're leaving
    revealTimers.forEach(clearTimeout);
    revealTimers = [];

    slides.forEach((s, i) => {
      s.classList.remove('is-active', 'is-leaving');
      if (i === index && next !== index) s.classList.add('is-leaving');
    });

    index = next;
    const slide = slides[index];
    slide.classList.add('is-active');

    // Reset every fragment, then cascade them in with a smooth stagger
    // so the audience sees everything appear automatically — no clicks.
    const frags = slide.querySelectorAll('.fragment');
    frags.forEach(f => f.classList.remove('is-visible'));
    frags.forEach((f, i) => {
      const t = setTimeout(() => f.classList.add('is-visible'),
                           FIRST_DELAY + i * STAGGER_MS);
      revealTimers.push(t);
    });

    updateChrome();
  }

  function updateChrome () {
    counterEl.textContent = `${index + 1} / ${total}`;
    progressEl.style.setProperty('--p', `${((index + 1) / total) * 100}%`);
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
  }

  /* Fragments auto-cascade in showSlide, so next/prev simply advance slides. */
  function next () {
    if (index < total - 1) showSlide(index + 1);
  }
  function prev () {
    if (index > 0) showSlide(index - 1);
  }

  /* ---------------- Auto-scale stage to viewport ----------------
     The stage is a fixed 1280×720 box; we set --scale so it fits.   */
  function fit () {
    const baseW = 1280;
    const baseH = 720;
    const scale = Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    document.documentElement.style.setProperty('--scale', scale.toString());
  }
  window.addEventListener('resize', fit);

  /* ---------------- Keyboard / mouse ---------------- */
  let numberBuffer = '';
  let numberTimer  = null;

  document.addEventListener('keydown', (e) => {
    // overview mode
    if (overviewEl.hidden === false) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') {
        toggleOverview(false);
      }
      return;
    }

    // number-jump (type a number, then Enter)
    if (/^[0-9]$/.test(e.key)) {
      numberBuffer += e.key;
      clearTimeout(numberTimer);
      numberTimer = setTimeout(() => { numberBuffer = ''; }, 1200);
      return;
    }

    if (e.key === 'Enter' && numberBuffer) {
      const n = parseInt(numberBuffer, 10);
      numberBuffer = '';
      clearTimeout(numberTimer);
      if (!isNaN(n) && n >= 1 && n <= total) showSlide(n - 1);
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); showSlide(0); break;
      case 'End':
        e.preventDefault(); showSlide(total - 1); break;
      case 'f':
      case 'F':
        toggleFullscreen(); break;
      case 'o':
      case 'O':
      case 'Escape':
        toggleOverview(); break;
    }
  });

  // Click-to-advance (but ignore clicks on the HUD)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.hud') || e.target.closest('.overview')) return;
    next();
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  /* ---------------- Fullscreen ---------------- */
  function toggleFullscreen () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ---------------- Overview ---------------- */
  function buildOverview () {
    overviewGrid.innerHTML = '';
    slides.forEach((s, i) => {
      const title = s.dataset.title || s.querySelector('h2, h1')?.textContent?.trim() || `Slide ${i + 1}`;
      const tile = document.createElement('div');
      tile.className = 'overview-tile';
      tile.innerHTML = `
        <div class="ov-num">Slide ${i + 1}</div>
        <div class="ov-title">${title}</div>
      `;
      tile.addEventListener('click', () => {
        showSlide(i);
        toggleOverview(false);
      });
      overviewGrid.appendChild(tile);
    });
  }
  function toggleOverview (force) {
    const open = (force !== undefined) ? force : overviewEl.hidden;
    overviewEl.hidden = !open;
  }

  /* ---------------- Init ---------------- */
  buildExampleTimeline();
  buildOverview();
  fit();
  // Bring up slide 0 with the same cascading reveal everyone else gets.
  slides[0].classList.add('is-active');
  const initFrags = slides[0].querySelectorAll('.fragment');
  initFrags.forEach((f, i) => {
    revealTimers.push(
      setTimeout(() => f.classList.add('is-visible'),
                 FIRST_DELAY + i * STAGGER_MS)
    );
  });
  updateChrome();

  // Expose a tiny debug helper so the user can jump from the console
  window.deck = { go: showSlide, next, prev, total };
})();
