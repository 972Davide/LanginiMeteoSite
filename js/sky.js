/* =====================================================
      CIELO DINAMICO (COLORE + ORBITA)
===================================================== */

// Coordinate Venegono Superiore
const LAT = 45.7525;
const LON = 8.8975;

// Utility
function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
}

// Interpola due colori (notte → giorno)
function interpolateColor(c1, c2, t) {
    const a = parseInt(c1.slice(1), 16);
    const b = parseInt(c2.slice(1), 16);

    const ar = (a >> 16) & 255,
          ag = (a >> 8) & 255,
          ab = a & 255;

    const br = (b >> 16) & 255,
          bg = (b >> 8) & 255,
          bb = b & 255;

    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);

    return `rgb(${r}, ${g}, ${bl})`;
}

// Aggiorna il cielo (colore + posizione sole/luna)
function tickSky() {
    const now = new Date();
    const times = SunCalc.getTimes(now, LAT, LON);
    const pos = SunCalc.getPosition(now, LAT, LON);
    const alt = pos.altitude * 180 / Math.PI;

    const SKY = document.getElementById("sky");
    const SM = document.getElementById("sunMoon");

    if (!SKY || !SM) return;

    const isDay = now >= times.sunrise && now <= times.sunset;

    // Orbita Sole/Luna
    const start = isDay ? times.sunrise : times.sunset;
    const end   = isDay ? times.sunset  : new Date(times.sunrise.getTime() + 86400000);

    let p = (now - start) / (end - start);
    p = clamp(p, 0, 1);

    const W = window.innerWidth;
    const orbitHeight = window.innerHeight * 0.25;
    const baseY = 120;

    const y = baseY + (1 - Math.sin(p * Math.PI)) * orbitHeight;

    SM.style.left = `${p * (W + 200) - 120}px`;
    SM.style.top  = `${y}px`;

    // Colori
    const NIGHT = "#000814";
    const DAY   = "#1f2b3a";

    const ALT_N = -12;
    const ALT_D = 45;

    let blend = 0;
    if (alt <= ALT_N) blend = 0;
    else if (alt >= ALT_D) blend = 1;
    else blend = (alt - ALT_N) / (ALT_D - ALT_N);

    SKY.style.background = interpolateColor(NIGHT, DAY, blend);
    SKY.classList.toggle("night", alt <= 0);
}
