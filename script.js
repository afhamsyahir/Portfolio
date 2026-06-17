const root = document.documentElement;
const email = "afhamsyahir45@gmail.com";
const clock = document.querySelector("#clock");
const themeToggle = document.querySelector("#theme-toggle");
const copyButton = document.querySelector("#copy-email");
const toastRoot = document.querySelector("#toast");

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

function updateClock() {
  if (!clock) return;
  clock.textContent = `${new Date().toLocaleTimeString("en-GB", {
    hour12: false,
    timeZone: "Asia/Kuala_Lumpur",
  })} KL`;
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

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    // Clipboard access can be blocked on non-secure local previews; keep the action visible.
  }
  showToast(`Copied ${email}`);
}

setTheme(initialTheme());
updateClock();
window.setInterval(updateClock, 1000);

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
