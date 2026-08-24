import { initHeroScene, initAmbientScene } from "./scenes.js";

/* ============================================================
   WEDDING CONSTANTS — edit these to update the whole site
   ============================================================ */
const WEDDING = {
  brideName: "Fathima N",
  groomName: "Abdul Hafeel",
  // Muhurtham 12:30 PM IST, 27 Sept 2026
  startISO: "2026-09-27T12:30:00+05:30",
  endISO: "2026-09-27T13:00:00+05:30",
  venue: "Salma Auditorium, Kulappadam, Kollam",
  mapsUrl: "https://maps.app.goo.gl/iSJ2XkK2twdS3RUD9",
};

/* ============================================================
   PAGE FADE-IN — removes opacity:0 once the page has loaded
   ============================================================ */
window.addEventListener("load", () => {
  document.body.classList.remove("page-loading");
  // Start observing reveal elements after the fade begins
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
});

/* ============================================================
   NAV
   ============================================================ */
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("[data-nav]").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ============================================================
   SCROLL CUE
   ============================================================ */
document.getElementById("scroll-cue").addEventListener("click", () => {
  document.getElementById("blessing").scrollIntoView({ behavior: "smooth" });
});

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);



/* ============================================================
   COUNTDOWN
   ============================================================ */
const weddingDate = new Date(WEDDING.startISO);

function updateCountdown() {
  const now = new Date();
  let diff = weddingDate.getTime() - now.getTime();
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
  document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("cd-mins").textContent = String(mins).padStart(2, "0");
  document.getElementById("cd-secs").textContent = String(secs).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   CALENDAR LINKS
   ============================================================ */
function toUTCStamp(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

const startDate = new Date(WEDDING.startISO);
const endDate = new Date(WEDDING.endISO);
const calTitle = `${WEDDING.brideName} & ${WEDDING.groomName}'s Wedding`;
const calDetails = "Nikah ceremony — with love, an invitation to celebrate.";

const gcalUrl = new URL("https://www.google.com/calendar/render");
gcalUrl.searchParams.set("action", "TEMPLATE");
gcalUrl.searchParams.set("text", calTitle);
gcalUrl.searchParams.set("dates", `${toUTCStamp(startDate)}/${toUTCStamp(endDate)}`);
gcalUrl.searchParams.set("details", calDetails);
gcalUrl.searchParams.set("location", WEDDING.venue);
document.getElementById("gcal-link").href = gcalUrl.toString();

function buildICS() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fathima N & Abdul Hafeel Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@fathima-n-abdul-hafeel-wedding`,
    `DTSTAMP:${toUTCStamp(new Date())}`,
    `DTSTART:${toUTCStamp(startDate)}`,
    `DTEND:${toUTCStamp(endDate)}`,
    `SUMMARY:${calTitle}`,
    `DESCRIPTION:${calDetails}`,
    `LOCATION:${WEDDING.venue}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
const icsBlob = new Blob([buildICS()], { type: "text/calendar" });
document.getElementById("ics-link").href = URL.createObjectURL(icsBlob);

/* ============================================================
   THREE.JS SCENES
   ============================================================ */
initHeroScene(document.getElementById("hero-canvas"));
initAmbientScene(document.getElementById("countdown-canvas"), "#c9a84c", 80);
initAmbientScene(document.getElementById("closing-canvas"), "#c97d8a", 60);
