/* ====================================================
   STARS.JS – GENERAZIONE STELLE + VISIBILITÀ NOTTE
   ==================================================== */

/* --------------------------------------------
   CREA TUTTE LE STELLE (una sola volta)
-------------------------------------------- */
function initStars() {
  const container = document.getElementById("stars");

  // Numero stelle – regolabile
  const STAR_COUNT = 140;

  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement("div");
    s.className = "star";

    s.style.top = Math.random() * 100 + "%";
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";

    container.appendChild(s);
  }
}

/* --------------------------------------------
   MOSTRA / NASCONDE STELLE IN BASE ALLA NOTTE
-------------------------------------------- */
function toggleStars() {
  if (!unlocked) return;

  const stars = document.getElementById("stars");
  stars.style.opacity = isNightTime() ? 1 : 0;
}
