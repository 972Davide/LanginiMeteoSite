/* =====================================================
   SKY.JS – Cielo, Sole/Luna, Alba/Tramonto
   - Sole al centro a mezzogiorno
   - Luna al centro a mezzanotte
   - Gestione colore cielo
   - isNightTime() globale
   - updateSunTimes() globale
===================================================== */

// Coordinate Venegono Superiore
const LAT = 45.7525;
const LON = 8.8975;

// Utility
function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

// Interpolazione colori notte ↔ giorno
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

/* -----------------------------------------------------
   isNightTime() → usata da stars.js
----------------------------------------------------- */
window.isNightTime = function () {
  const now = new Date();
  const t = SunCalc.getTimes(now, LAT, LON);
  return now < t.sunrise || now > t.sunset;
};

/* -----------------------------------------------------
   updateSunTimes() → scrive "Alba: -- • Tramonto: --"
----------------------------------------------------- */
window.updateSunTimes = function () {
  const now = new Date();
  const t = SunCalc.getTimes(now, LAT, LON);
  const el = document.getElementById("sunTimes");
  if (!el) return;

  const fmt = d =>
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  el.textContent = `Alba: ${fmt(t.sunrise)} • Tramonto: ${fmt(t.sunset)}`;
};

/* -----------------------------------------------------
   tickSky() → muove Sole/Luna e aggiorna il cielo
----------------------------------------------------- */
window.tickSky = function () {
  if (!unlocked) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const timesToday = SunCalc.getTimes(today, LAT, LON);
  const timesTomorrow = SunCalc.getTimes(
    new Date(today.getTime() + 86400000),
    LAT,
    LON
  );
  const timesYesterday = SunCalc.getTimes(
    new Date(today.getTime() - 86400000),
    LAT,
    LON
  );

  let phase;   // "day" o "night"
  let start;
  let end;

  if (now >= timesToday.sunrise && now <= timesToday.sunset) {
    // Giorno → ciclo alba → tramonto
    phase = "day";
    start = timesToday.sunrise;
    end = timesToday.sunset;
  } else {
    phase = "night";
    // Notte: potrebbe essere dopo il tramonto di oggi o prima dell'alba di oggi
    if (now < timesToday.sunrise) {
      // notte "prima" dell'alba → da tramonto di ieri ad alba di oggi
      start = timesYesterday.sunset;
      end = timesToday.sunrise;
    } else {
      // notte "dopo" il tramonto → da tramonto di oggi ad alba di domani
      start = timesToday.sunset;
      end = timesTomorrow.sunrise;
    }
  }

  let p = (now - start) / (end - start);
  p = clamp(p, 0, 1);

  const SKY = document.getElementById("sky");
  const SM = document.getElementById("sunMoon");
  const MASK = document.getElementById("moonMask");

  if (!SKY || !SM) return;

  // Mostra Sole o Luna
  if (phase === "day") {
    SM.classList.add("sun");
    SM.classList.remove("moon");
    if (MASK) MASK.style.display = "none";
  } else {
    SM.classList.add("moon");
    SM.classList.remove("sun");
    if (MASK) MASK.style.display = "block";
  }

  // Orbita: p=0 orizzonte sinistro, p=0.5 centro, p=1 orizzonte destro
  const W = window.innerWidth;
  const H = window.innerHeight;

  const orbitWidth = W + 200;
  const horizonY = H * 0.78;      // "terra"
  const zenithY  = H * 0.25;      // punto più alto

  const x = p * orbitWidth - 100;
  const y = horizonY - Math.sin(Math.PI * p) * (horizonY - zenithY);

  SM.style.left = `${x}px`;
  SM.style.top  = `${y}px`;

  // Colore cielo in base all'altezza del Sole
  const posSun = SunCalc.getPosition(now, LAT, LON);
  const alt = (posSun.altitude * 180) / Math.PI;

  const NIGHT = "#000814";
  const DAY   = "#1f2b3a";

  let blend = 0;
  if (alt <= -12) blend = 0;
  else if (alt >= 45) blend = 1;
  else blend = (alt + 12) / (45 + 12);

  SKY.style.background = interpolateColor(NIGHT, DAY, blend);

  SKY.classList.toggle("night", phase === "night");
  SKY.classList.toggle("day", phase === "day");
};
