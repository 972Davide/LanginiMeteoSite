/* ====================================================
   DASHBOARD.JS – LETTURA DATI METEO THINGSPEAK
   ==================================================== */

const METEO_CHANNEL = 3149218;

/* --------------------------------------------
   Utility converti numero
-------------------------------------------- */
function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

/* --------------------------------------------
   AGGIORNA I DATI METEO
-------------------------------------------- */
async function updateDashboard() {
  if (!unlocked) return;

  try {
    // Preleva gli ultimi 60 record, usa l'ultimo
    const meteo = await fetch(
      `https://api.thingspeak.com/channels/${METEO_CHANNEL}/feeds.json?results=60`
    ).then(r => r.json());

    const m = meteo.feeds?.at(-1) || {};

    const pressure = toNum(m.field1);
    const temp     = toNum(m.field2);
    const hum      = toNum(m.field3);
    const aqi      = toNum(m.field4);

    /* ----------------------------------------
       AGGIORNA VALORI TESTUALI
       ---------------------------------------- */

    document.getElementById("pressureValue").textContent =
      pressure ? pressure.toFixed(0) : "--";

    document.getElementById("tempValue").textContent =
      temp ? temp.toFixed(0) : "--";

    document.getElementById("humValue").textContent =
      hum ? hum.toFixed(0) : "--";

    document.getElementById("aqValue").textContent =
      aqi ? aqi.toFixed(0) : "--";

    /* ----------------------------------------
       AGGIORNA GAUGE (barre)
       ---------------------------------------- */

    document.getElementById("gaugePressure").style.width =
      clamp((pressure - 950) / 100 * 100, 0, 100) + "%";

    document.getElementById("gaugeTemp").style.width =
      clamp((temp + 10) / 60 * 100, 0, 100) + "%";

    document.getElementById("gaugeHum").style.width =
      hum + "%";

    document.getElementById("gaugeAQ").style.width =
      clamp(aqi / 500 * 100, 0, 100) + "%";

    /* ----------------------------------------
       TIMESTAMP ULTIMO AGGIORNAMENTO
       ---------------------------------------- */

    if (m.created_at) {
      document.getElementById("statusText").textContent =
        "Aggiornato: " + new Date(m.created_at)
        .toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
    }

  } catch (e) {
    console.warn("Errore updateDashboard:", e);
    document.getElementById("statusText").textContent = "Errore dati";
  }
}
