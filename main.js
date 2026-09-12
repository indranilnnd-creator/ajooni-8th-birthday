/**
 * main.js - 60-Frame Continuous Google Earth Zoom from Aeroplane Above Clouds
 * Linear 12s Journey Driven by Scroll & GSAP Engine
 * 4 Distinct Slide-in / Slide-out 3D Spatial Liquid Glass Windows
 * 8th Birthday Celebration for Ajooni (18 Sept 2026)
 * Continuous Freefall Skydiving POV + Google Earth Satellite Zoom
 * 4x Liquid Glass 3D Spatial Windows + VisionOS 3D Spatial Deck
 */

(function() {
  'use strict';

  // --- Real Google Earth Frames Configuration ---
  const TOTAL_FRAMES = 60;
  const earthFrames = [];
  let loadedFramesCount = 0;
  let earthCanvas, earthCtx;

  // --- Motion Engine & 3D Particle Vortex ---
  let lenis = null;
  let particleVortex = null;

  // --- Three.js Foreground Layer (3D Balloons, Sprinkles & Party Lights) ---
  let scene, camera, renderer, controls;
  let balloons = [];
  let confettiParticles = [];
  let fairySparkles;
  let popParticles = [];
  let raycaster, mouse;

  // --- State & Animation Tracking ---
  const state = {
    progress: 0,        // 0.0 (Above Clouds) to 1.0 (Inside Club Entrance)
    targetProgress: 0,
    isOrbitActive: false,
    currentWindowIndex: 0,
    isSpatialMode: false,
    spatialFocusIndex: 0,
    hasReachedVenue: false,
    poppedCount: 0
  };

  const DOM = {
    scrollTrack: document.getElementById('scroll-track'),
    earthCanvas: document.getElementById('earth-canvas'),
    threeContainer: document.getElementById('canvas-container'),
    scrollPrompt: document.getElementById('scroll-prompt'),
    telemetryHud: document.getElementById('telemetry-hud'),
    altReadout: document.getElementById('altitude-readout'),
    velReadout: document.getElementById('velocity-readout'),
    progressBar: document.getElementById('descent-progress-bar'),
    flightScrubber: document.getElementById('flight-scrubber'),
    spaceHero: document.getElementById('space-hero'),
    freeLookBanner: document.getElementById('free-look-banner'),
    windowsStage: document.getElementById('windows-stage'),
    spatialDeckNav: document.getElementById('spatial-deck-nav'),
    spatialPrevBtn: document.getElementById('spatial-prev-btn'),
    spatialNextBtn: document.getElementById('spatial-next-btn'),
    spatialCloseBtn: document.getElementById('spatial-close-btn'),
    spatialCardName: document.getElementById('spatial-card-name'),
    spatialCardIndex: document.getElementById('spatial-card-index'),
    windows: [
      document.getElementById('window-1'),
      document.getElementById('window-2'),
      document.getElementById('window-3'),
      document.getElementById('window-4')
    ],
    dock: document.getElementById('spatial-dock'),
    dockTabs: document.querySelectorAll('.dock-tab-btn'),
    spatialToggleBtn: document.getElementById('spatial-mode-toggle'),
    soundBtn: document.getElementById('sound-btn'),
    soundIcon: document.getElementById('sound-icon'),
    soundLabel: document.getElementById('sound-label'),
    replayBtn: document.getElementById('replay-btn'),
    orbitBtn: document.getElementById('orbit-btn'),
    orbitLabel: document.getElementById('orbit-label'),
    orbitSwitchBtn: document.getElementById('orbit-switch-btn'),
    guestbookBtn: document.getElementById('guestbook-btn'),
    confettiBlastBtn: document.getElementById('confetti-blast-btn'),
    calendarBtn: document.getElementById('calendar-btn'),
    rsvpForm: document.getElementById('rsvp-form'),
    rsvpName: document.getElementById('rsvp-name'),
    rsvpStatus: document.getElementById('rsvp-status'),
    rsvpGuests: document.getElementById('rsvp-guests'),
    rsvpPhone: document.getElementById('rsvp-phone'),
    rsvpMessage: document.getElementById('rsvp-message'),
    rsvpSubmitBtn: document.getElementById('rsvp-submit-btn'),
    rsvpSuccessCard: document.getElementById('rsvp-success-card'),
    successGuestMsg: document.getElementById('success-guest-msg'),
    whatsappShareBtn: document.getElementById('whatsapp-share-btn'),
    rsvpEditBtn: document.getElementById('rsvp-edit-btn'),
    attendChoiceBtns: document.querySelectorAll('.attend-choice-btn'),
    guestsCountGroup: document.getElementById('guests-count-group'),
    adminModal: document.getElementById('admin-modal'),
    adminCloseBtn: document.getElementById('admin-close-btn'),
    adminTbody: document.getElementById('admin-rsvp-tbody'),
    adminTotalCount: document.getElementById('admin-total-count'),
    adminAttendingCount: document.getElementById('admin-attending-count'),
    adminGuestsHeadcount: document.getElementById('admin-guests-headcount'),
    adminExportCsvBtn: document.getElementById('admin-export-csv-btn'),
    adminClearBtn: document.getElementById('admin-clear-btn'),
    popCounterBadge: document.getElementById('pop-counter-badge'),
    balloonHint: document.getElementById('balloon-hint'),
    countDays: document.getElementById('countdown-days'),
    countHours: document.getElementById('countdown-hours'),
    countMins: document.getElementById('countdown-mins'),
    countSecs: document.getElementById('countdown-secs')
  };

  // --- Initializer ---
  function init() {
    initEarthCanvas();

    // Check URL parameters for direct waypoint debugging
    const urlParams = new URLSearchParams(window.location.search);
    const p = parseFloat(urlParams.get('prog') || urlParams.get('progress'));
    if (!isNaN(p)) {
      state.progress = Math.max(0, Math.min(1, p));
      state.targetProgress = state.progress;
      state.hasCustomProgress = true;
    }

    preloadDenseEarthFrames();
    initThreeScene();
    buildParticleVortex();
    buildBalloons();
    buildConfettiRain();
    buildFairySparkles();
    setupScrollSystem();
    setupCursorAndSpotlight();
    setupWindowSystem();
    setupEvents();
    setupRsvpAndAdminSystem();
    startCountdownTimer();
    animateThree();

    if (!isNaN(p)) {
      state.progress = Math.max(0, Math.min(1, p));
      state.targetProgress = state.progress;
      const maxScroll = (DOM.scrollTrack ? DOM.scrollTrack.offsetHeight : 5200) - window.innerHeight;
      if (maxScroll > 0) {
        if (lenis) lenis.scrollTo(state.progress * maxScroll, { immediate: true });
        else window.scrollTo(0, state.progress * maxScroll);
      }
      onFlightProgressUpdate();
      updateParticleVortex(state.progress, 0);
      const w = parseInt(urlParams.get('win'), 10);
      if (!isNaN(w)) {
        slideWindowTo(w);
      }
      if (urlParams.get('spatial') === '1') {
        toggleSpatialMode(true);
      }
    }
  }

  // --- 1. Real Google Earth 60-Frame Canvas Engine ---
  function initEarthCanvas() {
    earthCanvas = DOM.earthCanvas;
    earthCtx = earthCanvas.getContext('2d', { alpha: false });
    resizeEarthCanvas();
  }

  function resizeEarthCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    earthCanvas.width = window.innerWidth * dpr;
    earthCanvas.height = window.innerHeight * dpr;
    earthCtx.scale(dpr, dpr);
    renderGoogleEarthFrame(state.progress);
  }

  let lastRenderedProgress = -1;
  let lastRenderedLoadedCount = -1;

  function preloadDenseEarthFrames() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `assets/dense_frames/frame_${numStr}.jpg?v=8.0_skydive`;
      img.onload = () => {
        loadedFramesCount++;
        renderGoogleEarthFrame(state.progress, true);
      };
      earthFrames.push(img);
    }
  }

  // Continuous linear sub-frame rendering across 60 frames with crisp optical clarity
  function renderGoogleEarthFrame(prog, force = false) {
    if (!earthCtx) return;
    if (!force && Math.abs(prog - lastRenderedProgress) < 0.0001 && loadedFramesCount === lastRenderedLoadedCount) {
      return;
    }
    lastRenderedProgress = prog;
    lastRenderedLoadedCount = loadedFramesCount;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const clampedProg = Math.max(0, Math.min(1, prog));
    const totalT = clampedProg * (TOTAL_FRAMES - 1);
    const frameIndexA = Math.min(Math.floor(totalT), TOTAL_FRAMES - 2);
    const frameIndexB = frameIndexA + 1;
    const localT = totalT - frameIndexA; // 0.0 to 1.0

    const imgA = earthFrames[frameIndexA];
    const imgB = earthFrames[frameIndexB];

    // Background fill
    earthCtx.fillStyle = '#020617';
    earthCtx.fillRect(0, 0, w, h);

    // Frame A: Crisp base
    if (imgA && imgA.complete && imgA.naturalWidth > 0) {
      earthCtx.save();
      drawImageCover(earthCtx, imgA, w, h, 1.0, 1.0);
      earthCtx.restore();
    }

    // Frame B: Seamless subtle cross-fade
    if (imgB && imgB.complete && imgB.naturalWidth > 0 && localT > 0.03) {
      earthCtx.save();
      earthCtx.globalAlpha = localT;
      drawImageCover(earthCtx, imgB, w, h, 1.0, 1.0);
      earthCtx.restore();
    }
  }

  function drawImageCover(ctx, img, cw, ch, scale = 1.0, alpha = 1.0) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const ir = iw / ih;
    const cr = cw / ch;

    let dw, dh;
    if (cr > ir) {
      dw = cw * scale;
      dh = (cw / ir) * scale;
    } else {
      dh = ch * scale;
      dw = (ch * ir) * scale;
    }

    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // --- 2. Three.js Foreground Layer (3D Balloons, Sprinkles & Lights) ---
  function initThreeScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 22);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    DOM.threeContainer.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 3;
    controls.maxDistance = 50;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const pinkSpot = new THREE.PointLight(0xf43f5e, 3.5, 60);
    pinkSpot.position.set(-15, 12, 10);
    scene.add(pinkSpot);

    const goldSpot = new THREE.PointLight(0xf59e0b, 3.5, 60);
    goldSpot.position.set(15, 12, 10);
    scene.add(goldSpot);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
  }

  // --- 3D Balloons System with Realistic Physics & Popping ---
  function buildBalloons() {
    const balloonColors = [0xf43f5e, 0xf59e0b, 0x06b6d4, 0x8b5cf6, 0xec4899, 0x3b82f6, 0xfef08a];
    const balloonCount = 36;

    for (let i = 0; i < balloonCount; i++) {
      const color = balloonColors[i % balloonColors.length];
      const balloonGroup = new THREE.Group();

      const balloonGeo = new THREE.SphereGeometry(1.05, 24, 24);
      balloonGeo.scale(1.0, 1.28, 1.0);

      const balloonMat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.28,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95
      });

      const balloonMesh = new THREE.Mesh(balloonGeo, balloonMat);
      balloonMesh.name = 'interactiveBalloon';
      balloonGroup.add(balloonMesh);

      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 8), balloonMat);
      knot.position.y = -1.35;
      balloonGroup.add(knot);

      const points = [];
      for (let s = 0; s < 10; s++) {
        points.push(new THREE.Vector3(Math.sin(s * 0.6) * 0.1, -1.35 - s * 0.32, Math.cos(s * 0.6) * 0.1));
      }
      const stringLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
      );
      balloonGroup.add(stringLine);

      // Stagger balloons to the sides and background to keep card reading zone clear
      const side = (i % 2 === 0) ? -1 : 1;
      const spreadX = side * (8.5 + Math.random() * 12);
      const spreadZ = -4 + Math.random() * 8;
      const initialY = -14 + Math.random() * 26;

      balloonGroup.position.set(spreadX, initialY, spreadZ);
      balloonGroup.scale.set(0, 0, 0); // Initially hidden at high altitude, blooms at venue
      balloonGroup.userData = {
        baseX: spreadX,
        baseZ: spreadZ,
        floatSpeed: 0.018 + Math.random() * 0.025,
        swaySpeed: 1.1 + Math.random() * 1.3,
        swayAmplitude: 0.35 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        mesh: balloonMesh,
        color: color
      };

      scene.add(balloonGroup);
      balloons.push(balloonGroup);
    }
  }

  // --- Festive Shimmering Confetti & Ribbon Rain ---
  function buildConfettiRain() {
    const count = 180;
    const colors = [0xf43f5e, 0xf59e0b, 0x10b981, 0x06b6d4, 0x8b5cf6, 0xec4899, 0xfacc15];

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      let geo;
      const type = Math.random();

      if (type < 0.65) {
        // Delicate metallic confetti ribbon
        geo = new THREE.PlaneGeometry(0.14, 0.30);
      } else {
        // Shimmering party sparkle crystal
        geo = new THREE.TetrahedronGeometry(0.12);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in background celebratory volume (safely behind cards)
      const spreadX = (Math.random() - 0.5) * 36;
      const spreadY = (Math.random() - 0.5) * 28;
      const spreadZ = -6 + Math.random() * 11;
      mesh.position.set(spreadX, spreadY, spreadZ);
      mesh.scale.set(0, 0, 0); // Initially hidden at high altitude

      mesh.userData = {
        fallSpeed: 0.025 + Math.random() * 0.04,
        rotSpeedX: (Math.random() - 0.5) * 0.08,
        rotSpeedY: (Math.random() - 0.5) * 0.1,
        rotSpeedZ: (Math.random() - 0.5) * 0.08,
        swaySpeed: 1.0 + Math.random() * 1.5,
        swayAmp: 0.02 + Math.random() * 0.03
      };

      scene.add(mesh);
      confettiParticles.push(mesh);
    }
  }

  // --- Soft Luminous Fairy Sparkles ---
  function buildFairySparkles() {
    const count = 150;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = -8 + Math.random() * 12; // Safely back from camera
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Circular soft glowing particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.8)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTexture = new THREE.CanvasTexture(canvas);

    fairySparkles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        map: spriteTexture,
        size: 0.55,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    fairySparkles.scale.set(0, 0, 0); // Blooms at venue arrival
    scene.add(fairySparkles);
  }

  // --- Three.js Points Particle Vortex (5000 Glowing Celestial Particles) ---
  function buildParticleVortex() {
    const PARTICLE_COUNT = 5000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const cyan = new THREE.Color('#00d9ff');
    const teal = new THREE.Color('#00ffcc');
    const purple = new THREE.Color('#a855f7');
    const gold = new THREE.Color('#fbbf24');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spiral formula: r = 2.0 + height * 0.15 with random radial spread
      const height = (Math.random() - 0.5) * 70; // -35 to +35
      const angle = (i * 0.08) + (Math.random() * 0.6);
      const r = 2.0 + Math.abs(height) * 0.14 + (Math.random() * 4.0 - 2.0);

      const x = Math.cos(angle) * r;
      const y = height;
      const z = Math.sin(angle) * r;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Dual gradient: cyan to teal, with purple & gold accents
      const rnd = Math.random();
      let col;
      if (rnd < 0.55) {
        col = cyan.clone().lerp(teal, Math.random());
      } else if (rnd < 0.85) {
        col = cyan.clone().lerp(purple, Math.random());
      } else {
        col = gold.clone();
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(0, 217, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(0, 255, 204, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.95,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleVortex = new THREE.Points(geo, mat);
    particleVortex.position.set(0, 0, 0);
    scene.add(particleVortex);
  }

  function updateParticleVortex(prog, velocity = 0) {
    if (!particleVortex) return;
    if (prog < 0.32) {
      particleVortex.visible = true;
      const fade = 1.0 - (prog / 0.32);
      particleVortex.material.opacity = 0.95 * fade;
      const s = 1.0 + prog * 2.5;
      particleVortex.scale.set(s, s, s);
      particleVortex.rotation.y += 0.003 + Math.abs(velocity) * 0.003;
    } else {
      particleVortex.visible = false;
    }
  }

  // --- 3. Scroll System (Lenis Buttery Smooth Momentum + Linear GSAP Flight) ---
  function setupScrollSystem() {
    let lastWhooshTime = 0;

    // Initialize Lenis smooth scroll engine
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
      });

      lenis.on('scroll', ({ scroll, limit, velocity }) => {
        if (state.isAutoFlight) return;
        const maxScroll = limit || (DOM.scrollTrack ? DOM.scrollTrack.offsetHeight - window.innerHeight : 5200);
        if (maxScroll <= 0) return;

        if (state.hasCustomProgress && scroll === 0) return;
        state.hasCustomProgress = false;

        const rawProgress = Math.max(0, Math.min(1, scroll / maxScroll));
        state.targetProgress = rawProgress;
        state.progress = rawProgress;

        const now = Date.now();
        if (Math.abs(velocity) > 1.2 && now - lastWhooshTime > 600 && window.soundEngine) {
          lastWhooshTime = now;
          if (window.soundEngine.playSubtleScrollWhoosh) {
            window.soundEngine.playSubtleScrollWhoosh(velocity);
          }
        }

        onFlightProgressUpdate();
        updateParticleVortex(state.progress, velocity);
      });

      // Hook Lenis into GSAP ticker
      if (window.gsap) {
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    // Direct scroll event fallback / sync
    window.addEventListener('scroll', () => {
      if (lenis) return; // Managed by Lenis
      if (state.isAutoFlight) return;

      const maxScroll = DOM.scrollTrack ? DOM.scrollTrack.offsetHeight - window.innerHeight : 5200;
      if (maxScroll <= 0) return;

      if (state.hasCustomProgress && window.scrollY === 0) return;
      state.hasCustomProgress = false;

      const rawProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      state.targetProgress = rawProgress;
      state.progress = rawProgress;
      onFlightProgressUpdate();
      updateParticleVortex(state.progress, 0);
    }, { passive: true });

    // Scrubber drag handler
    if (DOM.flightScrubber) {
      DOM.flightScrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 1000;
        const maxScroll = (DOM.scrollTrack ? DOM.scrollTrack.offsetHeight : 5200) - window.innerHeight;
        const targetY = val * maxScroll;
        if (lenis) lenis.scrollTo(targetY, { immediate: true });
        else window.scrollTo(0, targetY);
        state.progress = val;
        onFlightProgressUpdate();
        updateParticleVortex(state.progress, 0);
      });
    }
  }

  // Updates Google Earth frames, telemetry HUD, scrubber, and window choreography
  function onFlightProgressUpdate() {
    renderGoogleEarthFrame(state.progress);
    updateFlightTelemetry(state.progress);
    updateFlightUIChoreography(state.progress);

    if (DOM.flightScrubber && !state.isAutoFlight) {
      DOM.flightScrubber.value = Math.round(state.progress * 1000);
    }
  }

  function updateFlightTelemetry(prog) {
    let alt, vel, status;
    if (prog < 0.24) {
      // High altitude skydiving freefall: 35,000 ft (10.6 km) down to 5.0 km
      const p = prog / 0.24;
      alt = 10600 - p * 5600;
      vel = 215; // 215 km/h terminal velocity freefall
      status = 'Freefall';
    } else if (prog < 0.40) {
      // Cloud plunge & breaking into Bengal delta view: 5.0 km down to 1.8 km
      const p = (prog - 0.24) / 0.16;
      alt = 5000 - p * 3200;
      vel = 190 - p * 50;
      status = 'Cloud Dive';
    } else if (prog < 0.72) {
      // South Kolkata aerial descent: 1.8 km down to 220 m
      const p = (prog - 0.40) / 0.32;
      alt = 1800 - p * 1580;
      vel = 140 - p * 70;
      status = 'Glide';
    } else if (prog < 0.88) {
      // Santoshpur & EM Club aerial approach: 220 m down to 25 m
      const p = (prog - 0.72) / 0.16;
      alt = 220 - p * 195;
      vel = 70 - p * 45;
      status = 'Approach';
    } else {
      // Eastern Metropolitan Club entrance & celebration lawn: 25 m down to 2 m
      const p = (prog - 0.88) / 0.12;
      alt = Math.max(2, 25 - p * 23);
      vel = Math.max(0, 25 - p * 25);
      status = 'Touchdown';
    }

    DOM.altReadout.textContent = alt >= 1000
      ? `${(alt / 1000).toFixed(1)} KM`
      : `${Math.round(alt)} M`;

    DOM.velReadout.textContent = vel > 0
      ? `${Math.round(vel)} km/h (${status})`
      : `Arrived ✨`;

    DOM.progressBar.style.width = `${Math.min(100, Math.round(prog * 100))}%`;

    // Dock telemetry HUD neatly when reaching venue
    if (prog >= 0.70 || state.isSpatialMode) {
      DOM.telemetryHud.classList.add('venue-docked');
    } else {
      DOM.telemetryHud.classList.remove('venue-docked');
    }
  }

  // Choreograph 3D Liquid Glass Windows & Prompts according to flight progress
  function updateFlightUIChoreography(prog) {
    if (prog > 0.04) {
      DOM.scrollPrompt.classList.add('fade-out');
      DOM.spaceHero.classList.add('fade-out');
      DOM.telemetryHud.classList.remove('hidden');
    } else {
      DOM.scrollPrompt.classList.remove('fade-out');
      DOM.spaceHero.classList.remove('fade-out');
    }

    // When reaching venue entrance (prog >= 0.70)
    if (prog >= 0.70) {
      if (!state.hasReachedVenue) {
        state.hasReachedVenue = true;
        DOM.dock.classList.add('active');

        if (window.soundEngine) {
          window.soundEngine.playFanfare();
          window.soundEngine.startAmbient();
        }
        triggerConfettiBlast();

        if (!state.isSpatialMode) {
          const targetIdx = (typeof state.currentWindowIndex === 'number' && state.currentWindowIndex >= 0)
            ? state.currentWindowIndex
            : 0;
          slideWindowTo(targetIdx);
        }
      }
    } else {
      if (state.hasReachedVenue) {
        state.hasReachedVenue = false;
        DOM.dock.classList.remove('active');
        DOM.windows.forEach(w => w.classList.remove('window-active', 'window-slide-left', 'window-slide-right', 'window-minimized'));
      }
    }
  }

  // --- 4. 4 Distinct 3D Liquid Glass Window Manager ---
  function setupWindowSystem() {
    document.querySelectorAll('.next-win-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nextIdx = parseInt(e.currentTarget.dataset.next, 10);
        slideWindowTo(nextIdx, 'forward');
      });
    });

    document.querySelectorAll('.prev-win-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prevIdx = parseInt(e.currentTarget.dataset.prev, 10);
        slideWindowTo(prevIdx, 'backward');
      });
    });

    DOM.dockTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.dataset.target, 10);
        if (state.isSpatialMode) {
          setSpatialFocus(targetIdx);
        } else {
          slideWindowTo(targetIdx);
        }
      });
    });

    // Touch horizontal swipe to navigate between cards on mobile
    let touchStartX = 0;
    let touchStartY = 0;
    DOM.windows.forEach(win => {
      win.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      win.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Horizontal swipe detected (more horizontal than vertical, > 45px distance)
        if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
          if (diffX < 0) {
            // Swiped left -> Next card
            if (state.currentWindowIndex < DOM.windows.length - 1) {
              slideWindowTo(state.currentWindowIndex + 1, 'forward');
            }
          } else {
            // Swiped right -> Previous card
            if (state.currentWindowIndex > 0) {
              slideWindowTo(state.currentWindowIndex - 1, 'backward');
            }
          }
        }
      }, { passive: true });
    });

    if (DOM.spatialPrevBtn) {
      DOM.spatialPrevBtn.addEventListener('click', () => setSpatialFocus(state.spatialFocusIndex - 1));
    }
    if (DOM.spatialNextBtn) {
      DOM.spatialNextBtn.addEventListener('click', () => setSpatialFocus(state.spatialFocusIndex + 1));
    }
    if (DOM.spatialCloseBtn) {
      DOM.spatialCloseBtn.addEventListener('click', () => toggleSpatialMode(false));
    }

    DOM.windows.forEach((win, idx) => {
      const closeBtn = win.querySelector('.traffic-dot.close');
      const minBtn = win.querySelector('.traffic-dot.minimize');
      const expBtn = win.querySelector('.traffic-dot.expand');

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.isSpatialMode) toggleSpatialMode(false);
          closeWindow(idx);
        });
      }
      if (minBtn) {
        minBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.isSpatialMode) toggleSpatialMode(false);
          minimizeWindow(idx);
        });
      }
      if (expBtn) {
        expBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSpatialMode();
        });
      }

      win.addEventListener('click', () => {
        if (state.isSpatialMode) {
          setSpatialFocus(idx);
        }
      });

      setupCardTilt(win);
    });

    DOM.spatialToggleBtn.addEventListener('click', () => toggleSpatialMode());

    // Mouse movement parallax for 3D Spatial Mode
    window.addEventListener('mousemove', (e) => {
      if (!state.isSpatialMode) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      updateSpatialCardsLayout(nx, ny);
    });

    // Keyboard navigation in 3D Spatial Mode
    window.addEventListener('keydown', (e) => {
      if (state.isSpatialMode) {
        if (e.key === 'ArrowLeft') setSpatialFocus(state.spatialFocusIndex - 1);
        if (e.key === 'ArrowRight') setSpatialFocus(state.spatialFocusIndex + 1);
        if (e.key === 'Escape') toggleSpatialMode(false);
      }
    });
  }

  const spatialCardTitles = [
    '💌 Card 1: The Invitation',
    '👑 Card 2: The Birthday Star (Ajooni - Turning 8)',
    '📍 Card 3: When & Where (Venue)',
    '🎉 Card 4: RSVP & Celebration'
  ];

  function updateSpatialCardsLayout(mouseRelX = 0, mouseRelY = 0) {
    if (!state.isSpatialMode) return;

    if (DOM.spatialCardName) {
      DOM.spatialCardName.textContent = spatialCardTitles[state.spatialFocusIndex] || '';
    }
    if (DOM.spatialCardIndex) {
      DOM.spatialCardIndex.textContent = `${state.spatialFocusIndex + 1} of 4`;
    }

    DOM.windows.forEach((win, idx) => {
      const offset = idx - state.spatialFocusIndex;
      const isFocused = (offset === 0);

      win.classList.remove('window-active', 'window-slide-left', 'window-slide-right', 'window-minimized');
      win.classList.toggle('spatial-card-focused', isFocused);

      let tx = 0, ty = 0, tz = 0, ry = 0, s = 1.0, op = 1.0, zIdx = 50;

      if (offset === 0) {
        tx = mouseRelX * 22;
        ty = mouseRelY * 14;
        tz = 80;
        ry = mouseRelX * 6;
        s = 1.03;
        op = 1.0;
        zIdx = 90;
      } else if (offset === -1) {
        tx = -440 + mouseRelX * 32;
        ty = 15 + mouseRelY * 18;
        tz = -120;
        ry = 22 + mouseRelX * 7;
        s = 0.88;
        op = 0.85;
        zIdx = 75;
      } else if (offset < -1) {
        tx = -780 + mouseRelX * 40;
        ty = 30 + mouseRelY * 20;
        tz = -260;
        ry = 34 + mouseRelX * 9;
        s = 0.74;
        op = 0.55;
        zIdx = 60;
      } else if (offset === 1) {
        tx = 440 + mouseRelX * 32;
        ty = 15 + mouseRelY * 18;
        tz = -120;
        ry = -22 + mouseRelX * 7;
        s = 0.88;
        op = 0.85;
        zIdx = 75;
      } else if (offset > 1) {
        tx = 780 + mouseRelX * 40;
        ty = 30 + mouseRelY * 20;
        tz = -260;
        ry = -34 + mouseRelX * 9;
        s = 0.74;
        op = 0.55;
        zIdx = 60;
      }

      win.style.transform = `perspective(1600px) translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) scale(${s})`;
      win.style.opacity = op;
      win.style.zIndex = zIdx;
      win.style.visibility = 'visible';
      win.style.pointerEvents = 'auto';
    });

    DOM.dockTabs.forEach((tab, idx) => {
      tab.classList.toggle('active', idx === state.spatialFocusIndex);
    });
  }

  function setSpatialFocus(newIndex) {
    if (newIndex < 0 || newIndex >= DOM.windows.length) return;
    state.spatialFocusIndex = newIndex;
    state.currentWindowIndex = newIndex;
    updateSpatialCardsLayout();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  function slideWindowTo(targetIndex, direction = 'auto') {
    if (targetIndex < 0 || targetIndex >= DOM.windows.length) return;

    const fromIdx = state.currentWindowIndex;
    const toIdx = targetIndex;

    // Avoid reflow loops and repeated sound clicks if already at this window
    if (fromIdx === toIdx && DOM.windows[toIdx].classList.contains('window-active')) {
      return;
    }

    const isForward = (direction === 'forward') || (direction === 'auto' && toIdx >= fromIdx);

    DOM.windows.forEach((win, idx) => {
      win.style.transform = '';
      win.style.opacity = '';
      win.style.zIndex = '';
      win.classList.remove('window-active', 'window-slide-left', 'window-slide-right', 'window-minimized', 'spatial-card-focused');

      if (idx === toIdx) {
        win.classList.add(isForward ? 'window-slide-right' : 'window-slide-left');
        void win.offsetWidth; // Force reflow
        win.classList.remove('window-slide-left', 'window-slide-right');
        win.classList.add('window-active');
      } else if (idx === fromIdx && fromIdx !== toIdx) {
        win.classList.add(isForward ? 'window-slide-left' : 'window-slide-right');
      } else {
        win.classList.add('window-slide-left');
      }
    });

    state.currentWindowIndex = toIdx;

    DOM.dockTabs.forEach((tab, idx) => {
      tab.classList.toggle('active', idx === toIdx);
    });

    if (window.soundEngine) window.soundEngine.playClick();
  }

  function closeWindow(idx) {
    const win = DOM.windows[idx];
    win.classList.remove('window-active');
    win.classList.add('window-slide-left');
    DOM.dockTabs[idx].classList.remove('active');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  function minimizeWindow(idx) {
    const win = DOM.windows[idx];
    win.classList.remove('window-active');
    win.classList.add('window-minimized');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  function toggleSpatialMode(forceState) {
    state.isSpatialMode = (forceState !== undefined) ? forceState : !state.isSpatialMode;
    DOM.windowsStage.classList.toggle('spatial-mode', state.isSpatialMode);
    DOM.spatialToggleBtn.classList.toggle('mode-active', state.isSpatialMode);

    if (DOM.balloonHint) {
      DOM.balloonHint.style.display = state.isSpatialMode ? 'none' : '';
    }

    if (state.isSpatialMode) {
      state.spatialFocusIndex = state.currentWindowIndex;
      updateSpatialCardsLayout();
      if (window.soundEngine) window.soundEngine.playChime();
    } else {
      DOM.windows.forEach(win => {
        win.style.transform = '';
        win.style.opacity = '';
        win.style.zIndex = '';
        win.classList.remove('spatial-card-focused');
      });
      slideWindowTo(state.currentWindowIndex);
    }
  }

  function setupCardTilt(card) {
    const sheen = card.querySelector('.card-sheen');
    card.addEventListener('mousemove', (e) => {
      if (state.isSpatialMode) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`;
      if (sheen) {
        sheen.style.setProperty('--sheen-x', `${(x - centerX) * 0.8}px`);
        sheen.style.setProperty('--sheen-y', `${(y - centerY) * 0.8}px`);
      }
    });

    card.addEventListener('mouseleave', () => {
      if (state.isSpatialMode) return;
      card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
      if (sheen) {
        sheen.style.setProperty('--sheen-x', '0px');
        sheen.style.setProperty('--sheen-y', '0px');
      }
    });
  }

  // --- 5. Linear 12-Second End-to-End Flight Journey ---
  function toggleAutoFlight() {
    state.isAutoFlight = !state.isAutoFlight;
    DOM.flightIcon.textContent = state.isAutoFlight ? '⏸' : '▶';
    DOM.flightLabel.textContent = state.isAutoFlight ? 'Pause' : '12s Flight';

    if (state.isAutoFlight) {
      if (window.soundEngine) {
        window.soundEngine.resume();
        window.soundEngine.playWhoosh(3.2);
      }

      const maxScroll = DOM.scrollTrack.offsetHeight - window.innerHeight;
      const currentY = window.scrollY;
      const remainingRatio = Math.max(0.1, (maxScroll - currentY) / maxScroll);
      // Strictly guaranteed at least 10-12 seconds end to end
      const duration = remainingRatio * 12.0;

      const scrollObj = { y: currentY };
      state.autoFlightTween = gsap.to(scrollObj, {
        y: maxScroll,
        duration: duration,
        ease: 'none', // Smooth linear flight
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y);
          state.progress = Math.max(0, Math.min(1, scrollObj.y / maxScroll));
          onFlightProgressUpdate();
        },
        onComplete: () => {
          state.isAutoFlight = false;
          DOM.flightIcon.textContent = '▶';
          DOM.flightLabel.textContent = '12s Flight';
        }
      });
    } else {
      if (state.autoFlightTween) {
        state.autoFlightTween.kill();
      }
    }
  }

  // --- 6. Balloon Popping Raycaster Handler ---
  function handleBalloonClick(event) {
    if (event.target.closest('#windows-stage, .top-status-bar, #space-hero, #spatial-dock, .flight-scrubber-container')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let hit of intersects) {
      let obj = hit.object;
      if (obj.name === 'interactiveBalloon' || (obj.parent && obj.parent.userData && obj.parent.userData.mesh)) {
        const balloonGroup = obj.parent.userData.mesh ? obj.parent : obj.parent.parent;
        if (balloonGroup && balloonGroup.userData) {
          popBalloon(balloonGroup, hit.point);
          break;
        }
      }
    }
  }

  function popBalloon(balloonGroup, popPoint) {
    if (window.soundEngine) window.soundEngine.playPop();
    createPopBurst(popPoint || balloonGroup.position, balloonGroup.userData.color);

    state.poppedCount++;
    DOM.popCounterBadge.textContent = state.poppedCount;

    gsap.to(balloonGroup.scale, {
      x: 0.01,
      y: 0.01,
      z: 0.01,
      duration: 0.08,
      ease: 'power4.out',
      onComplete: () => {
        balloonGroup.position.y = -14;
        balloonGroup.position.x = (Math.random() - 0.5) * 38;
        balloonGroup.position.z = -5 + Math.random() * 25;
        balloonGroup.scale.set(1, 1, 1);
      }
    });

    if (window.confetti) {
      window.confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: mouse.x * 0.5 + 0.5, y: -mouse.y * 0.5 + 0.5 }
      });
    }
  }

  function createPopBurst(pos, color) {
    const burstCount = 28;
    for (let i = 0; i < burstCount; i++) {
      const shard = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.18),
        new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
      );
      shard.position.copy(pos);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.35;
      shard.userData = {
        vx: Math.cos(angle) * speed,
        vy: (Math.random() - 0.2) * speed + 0.1,
        vz: Math.sin(angle) * speed,
        life: 1.0
      };
      scene.add(shard);
      popParticles.push(shard);
    }
  }

  function triggerConfettiBlast() {
    if (!window.confetti) return;
    if (window.soundEngine) window.soundEngine.playChime();

    window.confetti({
      particleCount: 100,
      angle: 60,
      spread: 75,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#4ade80']
    });

    window.confetti({
      particleCount: 100,
      angle: 120,
      spread: 75,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#4ade80']
    });
  }

  function downloadCalendarInvite() {
    if (window.soundEngine) window.soundEngine.playClick();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ajooni 8th Birthday//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:ajooni-8th-birthday-2026@celebration.in',
      'DTSTAMP:20260911T120000Z',
      'DTSTART:20260918T123000Z',
      'DTEND:20260918T183000Z',
      'SUMMARY:Ajooni\'s 8th Birthday Celebration 🎈🎂',
      'DESCRIPTION:Join us for Ajooni\'s 8th Birthday Celebration at Eastern Metropolitan Club! Magic show, games, feast and joy.',
      'LOCATION:Eastern Metropolitan Club, A-73, Purba Diganta, Santoshpur, Kolkata, West Bengal 700075',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Ajooni\'s 8th Birthday Party tomorrow at 6 PM!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Ajooni_8th_Birthday_Invite.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function startCountdownTimer() {
    const partyTime = new Date('2026-09-18T18:00:00+05:30').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const diff = partyTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        DOM.countDays.textContent = String(days).padStart(2, '0');
        DOM.countHours.textContent = String(hours).padStart(2, '0');
        DOM.countMins.textContent = String(mins).padStart(2, '0');
        DOM.countSecs.textContent = String(secs).padStart(2, '0');
      } else {
        DOM.countDays.textContent = '00';
        DOM.countHours.textContent = '00';
        DOM.countMins.textContent = '00';
        DOM.countSecs.textContent = '00';
      }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  function setupEvents() {
    DOM.replayBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    DOM.soundBtn.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      DOM.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      DOM.soundLabel.textContent = isMuted ? 'Muted' : 'Sound';
    });

    function toggleOrbitControls(forceState) {
      state.isOrbitActive = (forceState !== undefined) ? forceState : !state.isOrbitActive;
      controls.enabled = state.isOrbitActive;

      if (state.isOrbitActive) {
        DOM.threeContainer.style.pointerEvents = 'auto';
        DOM.threeContainer.style.cursor = 'grab';
        DOM.orbitLabel.textContent = 'Exit Look';
        DOM.orbitBtn.classList.add('active-btn');
        if (DOM.freeLookBanner) {
          DOM.freeLookBanner.classList.add('active');
          setTimeout(() => {
            if (DOM.freeLookBanner) DOM.freeLookBanner.classList.remove('active');
          }, 4500);
        }
        if (window.soundEngine) window.soundEngine.playChime();
      } else {
        DOM.threeContainer.style.pointerEvents = 'none';
        DOM.threeContainer.style.cursor = 'default';
        DOM.orbitLabel.textContent = 'Free Look';
        DOM.orbitBtn.classList.remove('active-btn');
        if (DOM.freeLookBanner) DOM.freeLookBanner.classList.remove('active');
        DOM.earthCanvas.style.transform = 'scale(1.0)';
        if (!state.isSpatialMode) DOM.windowsStage.style.transform = 'none';
        gsap.to(camera.position, { x: 0, y: 0, z: 22, duration: 0.6, ease: 'power2.out' });
        gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power2.out' });
        controls.target.set(0, 0, 0);
        if (window.soundEngine) window.soundEngine.playClick();
      }
    }

    DOM.orbitBtn.addEventListener('click', () => toggleOrbitControls());
    if (DOM.orbitSwitchBtn) {
      DOM.orbitSwitchBtn.addEventListener('click', () => toggleOrbitControls());
    }

    DOM.threeContainer.addEventListener('pointerdown', () => {
      if (state.isOrbitActive) DOM.threeContainer.style.cursor = 'grabbing';
    });
    window.addEventListener('pointerup', () => {
      if (state.isOrbitActive) DOM.threeContainer.style.cursor = 'grab';
    });

    window.addEventListener('pointerdown', handleBalloonClick);
    DOM.confettiBlastBtn.addEventListener('click', triggerConfettiBlast);
    DOM.calendarBtn.addEventListener('click', downloadCalendarInvite);

    window.addEventListener('resize', () => {
      resizeEarthCanvas();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- RSVP Recording & Host Admin System ---
  const RSVP_STORAGE_KEY = 'ajooni_8th_rsvps_list';

  function getSavedRsvps() {
    try {
      return JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveRsvpRecord(record) {
    const list = getSavedRsvps();
    list.unshift(record);
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  function setupRsvpAndAdminSystem() {
    // 1. Attendance choice toggle
    if (DOM.attendChoiceBtns) {
      DOM.attendChoiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.attendChoiceBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const status = btn.dataset.status;
          if (DOM.rsvpStatus) DOM.rsvpStatus.value = status;
          if (DOM.guestsCountGroup) {
            DOM.guestsCountGroup.style.opacity = (status === 'Attending') ? '1' : '0.4';
          }
          if (window.soundEngine) window.soundEngine.playClick();
        });
      });
    }

    // 2. RSVP Form Submit
    if (DOM.rsvpForm) {
      DOM.rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (DOM.rsvpName ? DOM.rsvpName.value.trim() : '');
        if (!name) {
          alert('Please enter your name or family name!');
          return;
        }

        const status = DOM.rsvpStatus ? DOM.rsvpStatus.value : 'Attending';
        const guests = (status === 'Attending' && DOM.rsvpGuests) ? DOM.rsvpGuests.value : '0';
        const phone = DOM.rsvpPhone ? DOM.rsvpPhone.value.trim() : '';
        const message = DOM.rsvpMessage ? DOM.rsvpMessage.value.trim() : '';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

        const rsvpRecord = {
          id: Date.now(),
          date: dateStr,
          name: name,
          status: status,
          guests: guests,
          phone: phone,
          message: message
        };

        // Save locally immediately
        saveRsvpRecord(rsvpRecord);

        // UI transition to success state
        if (DOM.rsvpForm) DOM.rsvpForm.style.display = 'none';
        if (DOM.rsvpSuccessCard) {
          DOM.rsvpSuccessCard.style.display = 'flex';
          if (DOM.successGuestMsg) {
            if (status === 'Attending') {
              DOM.successGuestMsg.textContent = `Thank you, ${name}! We're thrilled you'll be joining us to celebrate Ajooni turning 8. Headcount reserved: ${guests}.`;
            } else {
              DOM.successGuestMsg.textContent = `Thank you, ${name}, for sending your love and blessings to Ajooni! She will treasure your warm wishes.`;
            }
          }
        }

        // WhatsApp Share button
        if (DOM.whatsappShareBtn) {
          const waText = `*Ajooni's 8th Birthday RSVP Confirmation* 🎈🎂\n\n*Name:* ${name}\n*Status:* ${status === 'Attending' ? '🎉 Attending with Joy' : '💖 Sending Love & Wishes'}\n*Guests:* ${guests}\n*Contact:* ${phone || 'N/A'}\n*Birthday Wish:* "${message || 'Happy 8th Birthday Ajooni!'}"\n\n*Venue:* Eastern Metropolitan Club, Kolkata\n*Date:* Friday, 18 Sept 2026, 6:00 PM`;
          DOM.whatsappShareBtn.onclick = () => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
          };
        }

        // Audio and celebratory confetti
        if (window.soundEngine) window.soundEngine.playChime();
        triggerConfettiBlast();

        // Optional cloud dispatch via FormSubmit (silent background post)
        try {
          fetch('https://formsubmit.co/ajax/ajooni.celebration.2026@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              Event: "Ajooni's 8th Birthday Party RSVP",
              Date: dateStr,
              Name: name,
              Attendance: status,
              GuestsCount: guests,
              Phone: phone,
              Message: message
            })
          }).catch(() => {});
        } catch (err) {}
      });
    }

    // 3. Edit response button
    if (DOM.rsvpEditBtn) {
      DOM.rsvpEditBtn.addEventListener('click', () => {
        if (DOM.rsvpSuccessCard) DOM.rsvpSuccessCard.style.display = 'none';
        if (DOM.rsvpForm) DOM.rsvpForm.style.display = 'flex';
      });
    }

    // 4. Host Admin Dashboard Modal
    function renderAdminTable() {
      const list = getSavedRsvps();
      if (DOM.adminTotalCount) DOM.adminTotalCount.textContent = list.length;

      let attendingFamilies = 0;
      let totalHeadcount = 0;

      list.forEach(item => {
        if (item.status === 'Attending') {
          attendingFamilies++;
          const countNum = parseInt(item.guests, 10) || 1;
          totalHeadcount += countNum;
        }
      });

      if (DOM.adminAttendingCount) DOM.adminAttendingCount.textContent = attendingFamilies;
      if (DOM.adminGuestsHeadcount) DOM.adminGuestsHeadcount.textContent = totalHeadcount;

      if (DOM.adminTbody) {
        if (list.length === 0) {
          DOM.adminTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 24px;">No RSVPs recorded yet. Submissions from guests will appear here live.</td></tr>';
        } else {
          DOM.adminTbody.innerHTML = list.map(item => `
            <tr>
              <td style="white-space:nowrap; font-size:11px; color:#94a3b8;">${item.date}</td>
              <td style="font-weight:700; color:#ffffff;">${item.name}</td>
              <td>
                <span style="display:inline-block; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; ${item.status === 'Attending' ? 'background:rgba(34,197,94,0.2); color:#4ade80; border:1px solid rgba(34,197,94,0.4);' : 'background:rgba(244,114,182,0.2); color:#f472b6; border:1px solid rgba(244,114,182,0.4);'}">
                  ${item.status === 'Attending' ? '🎉 Attending' : '💖 Wishes'}
                </span>
              </td>
              <td style="text-align:center; font-weight:700; color:#00d9ff;">${item.guests}</td>
              <td style="font-family:monospace; color:#cbd5e1;">${item.phone || '-'}</td>
              <td style="max-width:240px; font-size:11.5px; color:#e2e8f0; font-style:italic;">"${item.message || '-'}"</td>
            </tr>
          `).join('');
        }
      }
    }

    if (DOM.guestbookBtn) {
      DOM.guestbookBtn.addEventListener('click', () => {
        renderAdminTable();
        if (DOM.adminModal) DOM.adminModal.style.display = 'flex';
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (DOM.adminCloseBtn) {
      DOM.adminCloseBtn.addEventListener('click', () => {
        if (DOM.adminModal) DOM.adminModal.style.display = 'none';
      });
    }

    if (DOM.adminModal) {
      DOM.adminModal.addEventListener('click', (e) => {
        if (e.target === DOM.adminModal) {
          DOM.adminModal.style.display = 'none';
        }
      });
    }

    // 5. Export to CSV
    if (DOM.adminExportCsvBtn) {
      DOM.adminExportCsvBtn.addEventListener('click', () => {
        const list = getSavedRsvps();
        if (list.length === 0) {
          alert('No RSVP records to export yet!');
          return;
        }

        const headers = ['Timestamp', 'Guest Name', 'Attendance Status', 'Guests Count', 'Phone Number', 'Birthday Message'];
        const rows = list.map(item => [
          `"${item.date}"`,
          `"${(item.name || '').replace(/"/g, '""')}"`,
          `"${item.status}"`,
          `"${item.guests}"`,
          `"${(item.phone || '').replace(/"/g, '""')}"`,
          `"${(item.message || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'Ajooni_8th_Birthday_Guest_RSVPs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    // 6. Clear Records
    if (DOM.adminClearBtn) {
      DOM.adminClearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored RSVP records?')) {
          localStorage.removeItem(RSVP_STORAGE_KEY);
          renderAdminTable();
        }
      });
    }
  }

  // --- 7. Three.js Render Loop ---
  let clock = new THREE.Clock();

  function animateThree() {
    requestAnimationFrame(animateThree);

    renderGoogleEarthFrame(state.progress);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    // Venue arrival bloom factor (0.0 at high altitude, smoothly rises to 1.0 upon venue approach)
    const venueArrival = Math.max(0, Math.min(1, (state.progress - 0.65) / 0.12));

    // Animate Floating Balloons
    balloons.forEach((bGroup) => {
      const u = bGroup.userData;
      bGroup.position.y += u.floatSpeed;
      bGroup.position.x = u.baseX + Math.sin(elapsedTime * u.swaySpeed + u.phase) * u.swayAmplitude;
      bGroup.position.z = u.baseZ + Math.cos(elapsedTime * u.swaySpeed + u.phase) * 0.3;
      bGroup.rotation.z = Math.sin(elapsedTime * u.swaySpeed + u.phase) * 0.08;

      // Scale balloons smoothly with venue arrival
      bGroup.scale.setScalar(venueArrival);

      if (bGroup.position.y > 22) {
        bGroup.position.y = -14;
      }
    });

    // Animate Confetti Particles
    confettiParticles.forEach((p) => {
      const u = p.userData;
      p.position.y -= u.fallSpeed;
      p.position.x += Math.sin(elapsedTime * u.swaySpeed) * u.swayAmp;
      p.rotation.x += u.rotSpeedX;
      p.rotation.y += u.rotSpeedY;
      p.rotation.z += u.rotSpeedZ;

      // Scale confetti smoothly with venue arrival
      p.scale.setScalar(venueArrival);

      if (p.position.y < -15) {
        p.position.y = 18;
        p.position.x = (Math.random() - 0.5) * 36;
      }
    });

    if (fairySparkles) {
      fairySparkles.scale.setScalar(venueArrival);
      fairySparkles.rotation.y = elapsedTime * 0.04;
    }

    // Animate Three.js Points Particle Vortex (Celestial Swirl)
    if (particleVortex && particleVortex.visible) {
      particleVortex.rotation.y += 0.0025;
      particleVortex.rotation.x = Math.sin(elapsedTime * 0.35) * 0.08;
    }

    // Animate Balloon Pop Shards
    for (let i = popParticles.length - 1; i >= 0; i--) {
      const shard = popParticles[i];
      shard.position.x += shard.userData.vx;
      shard.position.y += shard.userData.vy;
      shard.position.z += shard.userData.vz;
      shard.userData.vy -= 0.008;
      shard.userData.life -= delta * 1.8;
      shard.scale.multiplyScalar(0.96);

      if (shard.userData.life <= 0) {
        scene.remove(shard);
        popParticles.splice(i, 1);
      }
    }

    if (controls.enabled) {
      controls.update();
      const rotY = camera.rotation.y;
      const rotX = camera.rotation.x;
      DOM.earthCanvas.style.transform = `scale(1.10) translate3d(${rotY * -90}px, ${rotX * 60}px, 0)`;
      if (!state.isSpatialMode) {
        DOM.windowsStage.style.transform = `translate3d(${rotY * -50}px, ${rotX * 30}px, 0)`;
      }
    }

    renderer.render(scene, camera);
  }

  // --- 8. Custom Fluid Dot & Ring Cursor with Aceternity Spotlight Tracking ---
  function setupCursorAndSpotlight() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const spotlight = document.getElementById('cursor-spotlight');

    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      if (spotlight) {
        spotlight.style.setProperty('--mouse-x', `${mouseX}px`);
        spotlight.style.setProperty('--mouse-y', `${mouseY}px`);
      }
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

      // Aceternity card sheen highlight
      DOM.windows.forEach(w => {
        const rect = w.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          const relX = mouseX - rect.left;
          const relY = mouseY - rect.top;
          w.style.setProperty('--card-mouse-x', `${relX}px`);
          w.style.setProperty('--card-mouse-y', `${relY}px`);
        }
      });
    }, { passive: true });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Magnetic interactive hover state
    const interactives = document.querySelectorAll('button, a, input, .liquid-glass-window, .scroll-dive-cue, .traffic-dot, .brand-pill');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
