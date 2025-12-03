
/* =====================================================
   MAIN.JS – Login + loop generale
===================================================== */

let unlocked = false;
const PASSWORD = "Doroty025";

/* --------- Login / Password --------- */
function handleLogin() {
  const pwd = document.getElementById("lockPassword").value.trim();

  if (pwd === PASSWORD) {
    unlocked = true;
    document.getElementById("lockScreen").style.display = "none";

    // avvio immediato di tutti gli aggiornamenti
    if (window.updateSunTimes) updateSunTimes();
    if (window.tickSky) tickSky();
    if (window.toggleStars) toggleStars();
    if (window.updateDashboard) updateDashboard();
  } else {
    document.getElementById("lockError").textContent = "Password errata.";
  }
}

/* Eventi UI */
document.getElementById("lockButton").onclick = handleLogin;
document.getElementById("lockPassword").onkeydown = (e) => {
  if (e.key === "Enter") handleLogin();
};

/* --------- LOOP OGNI 10s --------- */
setInterval(() => {
  if (!unlocked) return;

  if (window.tickSky) tickSky();
  if (window.toggleStars) toggleStars();
  if (window.updateSunTimes) updateSunTimes();
  if (window.updateDashboard) updateDashboard();
}, 10000);
