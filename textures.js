/**
 * textures.js - Satellite & Real Photographic Material Pipeline
 * Loads authentic Google Earth & aerial imagery + club entrance photos
 * with procedural canvas fallbacks.
 */

const TextureGenerator = {
  textureLoader: new THREE.TextureLoader(),

  // Load a texture with automatic fallback
  loadAsset(path, fallbackCanvasFn) {
    return this.textureLoader.load(
      path,
      (texture) => {
        texture.anisotropy = 8;
        if (texture.image) {
          texture.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.warn(`Failed to load ${path}, using procedural fallback`, err);
        return fallbackCanvasFn ? fallbackCanvasFn() : null;
      }
    );
  },

  // Real Above Clouds Texture
  getAboveCloudsTexture() {
    return this.loadAsset('assets/real_above_clouds.jpg', () => this.createCloudTexture());
  },

  // Real Earth from Space Texture
  getEarthSpaceTexture() {
    return this.loadAsset('assets/real_earth_space.jpg', () => this.createEarthTexture());
  },

  // Real Satellite Kolkata / EM Bypass Textures
  getKolkataSatelliteTexture() {
    return this.loadAsset('assets/sat_kolkata.jpg', () => this.createKolkataSatelliteTexture());
  },

  getSantoshpurSatelliteTexture() {
    return this.loadAsset('assets/sat_santoshpur.jpg', () => this.createKolkataSatelliteTexture());
  },

  getEMClubAerialTexture() {
    return this.loadAsset('assets/sat_emclub_aerial.jpg', () => this.createKolkataSatelliteTexture());
  },

  getEMClubCloseTexture() {
    return this.loadAsset('assets/sat_emclub_close.jpg', () => this.createKolkataSatelliteTexture());
  },

  // Real Eastern Metropolitan Club Entrance Gate Photo
  getClubRealGateTexture() {
    return this.loadAsset('assets/club_real_gate.jpg', () => this.createClubMarqueeTexture());
  },

  // Real Eastern Metropolitan Club Building Entrance Photo
  getClubEntranceRealTexture() {
    return this.loadAsset('assets/club_entrance_real.webp', () => this.createClubMarqueeTexture());
  },

  // Real Eastern Metropolitan Club Decorated Evening Celebration Lawn Photo
  getClubBanquetTexture() {
    return this.loadAsset('assets/club_emerald.webp', () => this.createRedCarpetTexture());
  },

  // 1. Procedural Realistic Earth Canvas Texture (Fallback & Space Sphere)
  createEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#091d34');
    oceanGrad.addColorStop(0.5, '#0d2b4f');
    oceanGrad.addColorStop(1, '#091d34');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 2048; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    function mapCoord(lon, lat) {
      return [
        ((lon + 180) / 360) * 2048,
        ((90 - lat) / 180) * 1024
      ];
    }

    function drawLandmass(points, baseColor, strokeColor) {
      ctx.fillStyle = baseColor;
      ctx.strokeStyle = strokeColor || 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        const [x, y] = mapCoord(pt[0], pt[1]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Eurasia, India Subcontinent, Bengal & Kolkata
    drawLandmass([
      [-10, 36], [0, 44], [10, 45], [25, 40], [30, 30], [35, 12], [45, 12],
      [51, 26], [60, 25], [68, 23], [70, 20], [73, 15], [77, 8], [80, 10],
      [80, 16], [85, 20], [88.4, 22.5], [92, 21], [98, 10], [104, 2], [108, 15],
      [120, 24], [122, 32], [130, 42], [140, 50], [150, 60], [170, 68],
      [180, 65], [-180, 65], [170, 72], [100, 76], [50, 70], [20, 71],
      [10, 60], [-5, 58], [-10, 48], [-10, 36]
    ], '#1e4827', '#34d399');

    // Indian Subcontinent Detail
    drawLandmass([
      [68, 24], [72, 21], [73, 16], [76, 10], [77.5, 8.2], [79.8, 9.8],
      [80.3, 13], [82, 16.5], [85, 19.5], [88.4, 22.5], [91, 23.5],
      [92, 25], [88, 27], [85, 27.5], [80, 30], [74, 32], [70, 30], [68, 24]
    ], '#2d6a3a', '#4ade80');

    // Africa & Americas
    drawLandmass([
      [-17, 15], [-5, 5], [10, 2], [12, -5], [18, -34], [28, -33],
      [33, -25], [40, -10], [51, 12], [43, 12], [32, 31], [10, 37],
      [-5, 36], [-10, 30], [-17, 15]
    ], '#424128', '#84cc16');

    drawLandmass([
      [-168, 65], [-140, 60], [-125, 50], [-122, 38], [-117, 32], [-105, 20],
      [-97, 26], [-81, 25], [-80, 30], [-74, 40], [-64, 45], [-60, 50],
      [-64, 60], [-80, 62], [-95, 70], [-130, 72], [-168, 65]
    ], '#254b2d', '#22c55e');

    drawLandmass([
      [-75, 10], [-80, 0], [-81, -5], [-72, -40], [-68, -55], [-65, -55],
      [-50, -30], [-35, -5], [-40, -2], [-50, 0], [-60, 10], [-75, 10]
    ], '#1f4e30', '#16a34a');

    // Target GPS Beacon at Kolkata
    const [kx, ky] = mapCoord(88.3965, 22.4989);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(kx, ky, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(kx, ky, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('TARGET: EASTERN METROPOLITAN CLUB', kx + 30, ky + 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  },

  // 2. Cloud Texture
  createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 2048, 1024);

    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 2048;
      const y = 180 + Math.random() * 664;
      const radius = 25 + Math.random() * 80;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  },

  // 3. Fallback Kolkata Satellite Aerial Texture
  createKolkataSatelliteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c281e';
    ctx.fillRect(0, 0, 2048, 2048);

    ctx.fillStyle = '#263428';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const w = 40 + Math.random() * 90;
      const h = 30 + Math.random() * 70;
      ctx.fillRect(x, y, w, h);
    }

    // Lakes & water bodies in Santoshpur
    ctx.fillStyle = '#0f293b';
    ctx.beginPath();
    ctx.ellipse(600, 900, 220, 130, 0.3, 0, Math.PI * 2);
    ctx.ellipse(1400, 1300, 180, 90, -0.4, 0, Math.PI * 2);
    ctx.ellipse(980, 1050, 120, 70, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eastern Metropolitan (EM) Bypass Highway
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.bezierCurveTo(700, 600, 1100, 1200, 1450, 2048);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.bezierCurveTo(700, 600, 1100, 1200, 1450, 2048);
    ctx.stroke();

    // Eastern Metropolitan Club Boundary
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(880, 880, 288, 288, 24);
    } else {
      ctx.rect(880, 880, 288, 288);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EASTERN METROPOLITAN CLUB', 1024, 840);
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('A-73, Purba Diganta, Santoshpur, Kolkata 700075', 1024, 872);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // 4. Fallback Club Marquee Signboard
  createClubMarqueeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0b0f19');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.textAlign = 'center';
    ctx.font = 'bold 52px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('EASTERN METROPOLITAN CLUB', 512, 105);

    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('A-73, PURBA DIGANTA, SANTOSHPUR, KOLKATA', 512, 155);

    ctx.font = 'italic 500 22px system-ui, sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.fillText('★ Welcome to Ajooni\'s 8th Birthday Wonderland ★', 512, 198);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // 5. Fallback Red Carpet
  createRedCarpetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#881337';
    ctx.fillRect(0, 0, 512, 1024);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(16, 0, 20, 1024);
    ctx.fillRect(476, 0, 20, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return texture;
  }
};

window.TextureGenerator = TextureGenerator;
