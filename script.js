const root = document.documentElement;
const email = "afhamsyahir45@gmail.com";
const clock = document.querySelector("#clock");
const themeToggle = document.querySelector("#theme-toggle");
const copyButton = document.querySelector("#copy-email");
const toastRoot = document.querySelector("#toast");
const splashScreen = document.querySelector("#splash-screen");
const roseLoaderGroup = document.querySelector("#rose-loader-group");
const roseLoaderPath = document.querySelector("#rose-loader-path");

const roseConfig = {
  particleCount: 78,
  trailSpan: 0.32,
  durationMs: 5400,
  rotationDurationMs: 28000,
  pulseDurationMs: 4500,
  strokeWidth: 4.6,
  roseA: 9.2,
  roseABoost: 0.6,
  roseBreathBase: 0.72,
  roseBreathBoost: 0.28,
  roseScale: 3.25,
};

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  localStorage.setItem("afham-theme", theme);
}

function initialTheme() {
  const saved = localStorage.getItem("afham-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

const connect = document.querySelector("#connect");
const connectClock = document.querySelector("#connect-clock");

function klParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour12: false,
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "00";
  return { hour: Number(get("hour")), hh: get("hour"), mm: get("minute"), ss: get("second") };
}

function timeOfDay(hour) {
  if (hour >= 5 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

function updateClock() {
  const { hour, hh, mm, ss } = klParts();
  if (clock) clock.textContent = `${hh}:${mm}:${ss} KL`;
  if (connectClock) connectClock.textContent = `${hh}:${mm}`;
  document.body.dataset.time = timeOfDay(hour);
}

const page = document.querySelector(".page");

function updatePageReveal() {
  if (!page) return;
  const fromBottom =
    document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  const range = window.innerHeight * 0.85;
  const p = Math.min(1, Math.max(0, 1 - fromBottom / range));
  const eased = p * p * (3 - 2 * p);
  page.style.setProperty("--page-scale", (1 - 0.05 * eased).toFixed(4));
  page.style.setProperty("--page-radius", `${(28 * eased).toFixed(1)}px`);
}

function showToast(message) {
  if (!toastRoot) return;
  toastRoot.textContent = "";
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  toastRoot.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function normalizeProgress(progress) {
  return ((progress % 1) + 1) % 1;
}

function getRoseDetailScale(time) {
  const pulseProgress = (time % roseConfig.pulseDurationMs) / roseConfig.pulseDurationMs;
  const pulseAngle = pulseProgress * Math.PI * 2;
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
}

function getRosePoint(progress, detailScale) {
  const t = progress * Math.PI * 2;
  const a = roseConfig.roseA + detailScale * roseConfig.roseABoost;
  const r = a * (roseConfig.roseBreathBase + detailScale * roseConfig.roseBreathBoost) * Math.cos(4 * t);

  return {
    x: 50 + Math.cos(t) * r * roseConfig.roseScale,
    y: 50 + Math.sin(t) * r * roseConfig.roseScale,
  };
}

function buildRosePath(detailScale, steps = 480) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const point = getRosePoint(index / steps, detailScale);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");
}

function startRoseLoader() {
  if (!roseLoaderGroup || !roseLoaderPath) return;

  const svgNamespace = "http://www.w3.org/2000/svg";
  const particles = Array.from({ length: roseConfig.particleCount }, () => {
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("fill", "currentColor");
    roseLoaderGroup.append(circle);
    return circle;
  });

  roseLoaderPath.setAttribute("stroke-width", String(roseConfig.strokeWidth));
  const startedAt = performance.now();

  function render(now) {
    if (!document.body.classList.contains("is-loading")) return;

    const time = now - startedAt;
    const progress = (time % roseConfig.durationMs) / roseConfig.durationMs;
    const detailScale = getRoseDetailScale(time);
    const rotation = -((time % roseConfig.rotationDurationMs) / roseConfig.rotationDurationMs) * 360;

    roseLoaderGroup.setAttribute("transform", `rotate(${rotation} 50 50)`);
    roseLoaderPath.setAttribute("d", buildRosePath(detailScale));

    particles.forEach((node, index) => {
      const tailOffset = index / (roseConfig.particleCount - 1);
      const point = getRosePoint(normalizeProgress(progress - tailOffset * roseConfig.trailSpan), detailScale);
      const fade = Math.pow(1 - tailOffset, 0.56);
      node.setAttribute("cx", point.x.toFixed(2));
      node.setAttribute("cy", point.y.toFixed(2));
      node.setAttribute("r", (0.9 + fade * 2.7).toFixed(2));
      node.setAttribute("opacity", (0.04 + fade * 0.96).toFixed(3));
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function preparePageEntry() {
  document.querySelectorAll("[data-enter]").forEach((element, index) => {
    element.style.setProperty("--enter-order", String(index));
  });
}

function revealPageContent(reduceMotion = false) {
  document.querySelectorAll("[data-enter]").forEach((element, index) => {
    window.setTimeout(() => {
      element.classList.add("has-entered");
    }, reduceMotion ? 0 : index * 90 + 720);
  });
}

function finishSplash(reduceMotion = false) {
  if (!splashScreen) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    revealPageContent(reduceMotion);
    return;
  }

  splashScreen.classList.add("is-exiting");
  document.body.classList.add("is-ready");
  revealPageContent(reduceMotion);

  window.setTimeout(() => {
    splashScreen.remove();
    document.body.classList.remove("is-loading");
  }, reduceMotion ? 0 : 680);
}

let copyResetTimer;
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    // Clipboard access can be blocked on non-secure local previews; keep the action visible.
  }
  showToast(`Copied ${email}`);
  if (copyButton) {
    copyButton.textContent = "Copied!";
    copyButton.classList.add("is-copied");
    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(() => {
      copyButton.textContent = "Copy email";
      copyButton.classList.remove("is-copied");
    }, 1800);
  }
}

preparePageEntry();
setTheme(initialTheme());
updateClock();
window.setInterval(updateClock, 1000);
startRoseLoader();

updatePageReveal();
let revealTicking = false;
function onRevealScroll() {
  if (revealTicking) return;
  revealTicking = true;
  window.requestAnimationFrame(() => {
    updatePageReveal();
    revealTicking = false;
  });
}
window.addEventListener("scroll", onRevealScroll, { passive: true });
window.addEventListener("resize", updatePageReveal);

function startTypewriter() {
  const el = document.querySelector(".type-word");
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const words = ["build?", "ship?", "design?", "automate?", "launch?"];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  function step() {
    const word = words[wordIndex];
    if (deleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }
    el.textContent = word.slice(0, charIndex);

    let delay = deleting ? 60 : 120;
    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 1900;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 380;
    }
    window.setTimeout(step, delay);
  }

  window.setTimeout(step, 1900);
}

startTypewriter();

document.querySelectorAll(".case-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const caseEl = btn.closest(".case");
    if (!caseEl) return;
    const open = caseEl.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    btn.firstChild.textContent = open ? "Hide case study" : "View case study";
  });
});

window.addEventListener("load", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => finishSplash(reduceMotion), reduceMotion ? 0 : 1200);
});

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

copyButton?.addEventListener("click", copyEmail);

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

  if (!isTyping && event.key.toLowerCase() === "c" && !event.metaKey && !event.ctrlKey) {
    copyEmail();
  }
});

console.log("%cAfham Syahir", "font:600 22px Geist, sans-serif; color:#eb8c43");
console.log("%cFront-End Developer · Kuala Lumpur. Press C anywhere to copy my email.", "color:#888; font:13px 'Geist Mono', monospace;");
