const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");
const header = document.getElementById("header");
const typed = document.getElementById("typed");
const year = document.getElementById("year");
const toTop = document.getElementById("to-top");

const start = new Date(2015, 7, 1);
function yearsSince(from) {
  const now = new Date();
  let y = now.getFullYear() - from.getFullYear();
  if (now.getMonth() < from.getMonth() || (now.getMonth() === from.getMonth() && now.getDate() < from.getDate())) y -= 1;
  return Math.max(y, 0);
}
document.documentElement.classList.add("js");

const years = yearsSince(start);
document.querySelectorAll("[data-exp]").forEach((el) => { el.textContent = String(years); });
document.querySelectorAll("[data-count][data-exp]").forEach((el) => { el.dataset.count = String(years); });
if (year) year.textContent = String(new Date().getFullYear());

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const particleHost = document.querySelector(".bg-blobs");
if (particleHost && !reducedMotion) {
  for (let i = 0; i < 28; i += 1) {
    const p = document.createElement("i");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDuration = `${10 + Math.random() * 16}s`;
    p.style.animationDelay = `${Math.random() * 6}s`;
    p.style.opacity = String(0.28 + Math.random() * 0.4);
    p.style.width = p.style.height = `${4 + Math.round(Math.random() * 4)}px`;
    particleHost.appendChild(p);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("zk-v2-theme", theme);
}
applyTheme(localStorage.getItem("zk-v2-theme") || "light");
themeBtn?.addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

menuBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));

const navLinks = [...(nav?.querySelectorAll("a") || [])];

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 12);
  toTop?.classList.toggle("show", y > 500);
  let currentId = "home";
  navLinks.forEach((link) => {
    const id = (link.getAttribute("href") || "").replace("#", "");
    const el = document.getElementById(id);
    if (el && el.offsetTop - 140 <= y) currentId = id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const roles = ["Full-Stack Developer", "Laravel Engineer", "AI Integrator", "Team Lead"];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
function typeLoop() {
  if (!typed) return;
  const current = roles[roleIndex];
  typed.textContent = current.slice(0, charIndex);
  if (!deleting && charIndex < current.length) {
    charIndex += 1;
    setTimeout(typeLoop, 70);
  } else if (!deleting) {
    deleting = true;
    setTimeout(typeLoop, 1200);
  } else if (charIndex > 0) {
    charIndex -= 1;
    setTimeout(typeLoop, 36);
  } else {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeLoop, 240);
  }
}
typeLoop();

const bars = document.querySelectorAll(".bar span");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      bars.forEach((bar) => { bar.style.width = bar.dataset.width; });
      io.disconnect();
    }
  });
}, { threshold: 0.3 });
const about = document.getElementById("about");
if (about) io.observe(about);

function animateCount(el, target) {
  const end = Number(target);
  if (!Number.isFinite(end)) return;
  if (reducedMotion) {
    el.textContent = String(end);
    return;
  }
  const startVal = 0;
  const duration = 1100;
  const t0 = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(startVal + (end - startVal) * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll("[data-count]");
const countIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target, entry.target.dataset.count);
    countIo.unobserve(entry.target);
  });
}, { threshold: 0.4 });
counters.forEach((el) => countIo.observe(el));

const revealEls = document.querySelectorAll(
  ".section .center, .section .card, .section .job, .about-grid > *, .contact-layout > *, .counters"
);
const revealIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    revealIo.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
revealEls.forEach((el, i) => {
  const kind = el.matches(".about-grid > *:first-child, .contact-layout > *:first-child, .job-meta") ? "reveal-left"
    : el.matches(".about-grid > *:last-child, .contact-layout > *:last-child") ? "reveal-right"
    : "reveal";
  el.classList.add(kind);
  el.style.transitionDelay = reducedMotion ? "0s" : `${Math.min(i % 6, 5) * 70}ms`;
  const alreadyVisible = el.getBoundingClientRect().top < window.innerHeight * 0.92;
  if (reducedMotion || alreadyVisible) el.classList.add("in");
  else revealIo.observe(el);
});

const projectModal = document.getElementById("project-modal");
const projectModalCover = document.getElementById("project-modal-cover");
const projectModalBody = document.getElementById("project-modal-body");
let lastProjectFocus = null;

function openProjectModal(card) {
  const detail = card.querySelector(".project-detail");
  const cover = card.querySelector(".project-cover");
  if (!detail || !projectModal || !projectModalBody) return;
  lastProjectFocus = document.activeElement;
  if (projectModalCover && cover) {
    projectModalCover.className = `project-modal-cover ${[...cover.classList].filter((cls) => cls !== "project-cover").join(" ")}`;
    projectModalCover.innerHTML = cover.innerHTML;
  }
  projectModalBody.innerHTML = detail.innerHTML;
  const heading = projectModalBody.querySelector("h2");
  if (heading) heading.id = "project-modal-title";
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  projectModal.querySelector("[data-close-modal]")?.focus();
}

function closeProjectModal() {
  if (!projectModal?.classList.contains("open")) return;
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastProjectFocus?.focus?.();
}

document.getElementById("projects")?.addEventListener("click", (e) => {
  const card = e.target.closest("[data-project-modal]");
  if (!card) return;
  e.preventDefault();
  openProjectModal(card);
});

projectModal?.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) closeProjectModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProjectModal();
});
