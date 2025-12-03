/* =====================================================
   MAIN LOOP GENERALE
===================================================== */

let unlocked = false;

/* Password */
function handleLogin() {
    const pwd = document.getElementById("lockPassword").value.trim();
    if (pwd === "Doroty025") {
        unlocked = true;
        document.getElementById("lockScreen").style.display = "none";

        // Avvio immediato
        tickSky();
        tickSunMoon();
        updateDashboard();
    } else {
        document.getElementById("lockError").textContent = "Password errata.";
    }
}

document.getElementById("lockButton").onclick = handleLogin;
document.getElementById("lockPassword").onkeydown = e => {
    if (e.key === "Enter") handleLogin();
};

/* LOOP OGNI 10 SEC */
setInterval(() => {
    if (!unlocked) return;

    tickSky();
    toggleStars();
    tickSunMoon();      // <-- IMPORTANTE
    updateSunTimes();   // <-- IMPORTANTE
    updateDashboard();
}, 10000);
