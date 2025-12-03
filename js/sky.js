/* ====================================================
   SKY.JS – CIELO DINAMICO + SOLE/LUNA IN ORBITA (FIX)
   ==================================================== */

const LAT = 45.7525;
const LON = 8.8975;

/* ----------------------------------------------------
   CORREZIONE FUSO ORARIO (GitHub Pages → UTC)
---------------------------------------------------- */
function localDate(d) {
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
}

/* ----------------------------------------------------
   Utility clamp
---------------------------------------------------- */
function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
}

/* ----------------------------------------------------
   Interpolazione colori notte → giorno
---------------------------------------------------- */
function interpolateColor(c1, c2, t) {
    const a = parseInt(c1.slice(1), 16);
    const b = parseInt(c2.slice(1), 16);

    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;

    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);

    return `rgb(${r}, ${g}, ${bl})`;
}

/* ----------------------------------------------------
   Verifica se è notte
---------------------------------------------------- */
function isNightTime() {
    const nowL = localDate(new Date());
    const t = SunCalc.getTimes(nowL, LAT, LON);
    return nowL < t.sunrise || nowL > t.sunset;
}

/* ----------------------------------------------------
   AGGIORNA CIELO + ORBITA SOLE/LUNA
---------------------------------------------------- */
function updateSky() {
    if (!unlocked) return;

    const now = new Date();
    const nowL = localDate(now);

    const times = SunCalc.getTimes(nowL, LAT, LON);
    const pos = SunCalc.getPosition(nowL, LAT, LON);
    const alt = pos.altitude * 180 / Math.PI;

    const SKY = document.getElementById("sky");
    const SM = document.getElementById("sunMoon");

    if (!SKY || !SM) return;

    /* ----- Giorno o notte ----- */
    const isDay = nowL >= times.sunrise && nowL <= times.sunset;

    /* ----- Calcolo orbita ----- */
    const start = isDay ? times.sunrise : times.sunset;
    const end   = isDay ? times.sunset  : new Date(times.sunrise.getTime() + 86400000);

    let p = (nowL - start) / (end - start);
    p = clamp(p, 0, 1);

    /* ----- Posizione su schermo ----- */
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const orbitHeight = screenH * 0.30;
    const baseY = screenH * 0.35;

    const y = baseY - Math.sin(p * Math.PI) * orbitHeight;
    const x = p * (screenW + 200) - 100;

    SM.style.left = `${x}px`;
    SM.style.top  = `${y}px`;

    /* ----- Seleziona Sole o Luna ----- */
    SM.className = isDay ? "sun" : "moon";

    /* ----- Colore cielo ----- */
    const NIGHT = "#000814";
    const DAY = "#1f2b3a";

    const ALT_N = -12;
    const ALT_D = 45;

    let blend = 0;
    if (alt <= ALT_N) blend = 0;
    else if (alt >= ALT_D) blend = 1;
    else blend = (alt - ALT_N) / (ALT_D - ALT_N);

    SKY.style.background = interpolateColor(NIGHT, DAY, blend);

    SKY.classList.toggle("night", !isDay);
}

/* ----------------------------------------------------
   AGGIORNA ALBA / TRAMONTO (PER DASHBOARD)
---------------------------------------------------- */
function updateSunTimes() {
    const now = new Date();
    const nowL = localDate(now);

    const t = SunCalc.getTimes(nowL, LAT, LON);

    const albaEl = document.getElementById("sunriseTime");
    const tramontoEl = document.getElementById("sunsetTime");

    if (!albaEl || !tramontoEl) return;

    const fmt = d =>
        d.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        });

    albaEl.textContent = fmt(t.sunrise);
    tramontoEl.textContent = fmt(t.sunset);
}
