const workItems = [
  {
    id: "riscv-pipeline",
    number: "01",
    title: "5-Stage Pipelined RISC-V Processor",
    impact: "Designing a classic 5-stage core with forwarding and hazard handling for clean instruction flow.",
    summary:
      "Current work focuses on stage integration, pipeline control, and validation of hazard scenarios including load-use stalls and branch behavior.",
    tech: ["RISC-V", "Pipeline Control", "Hazard Detection", "SystemVerilog"],
    links: {},
    media: {}
  },
  {
    id: "simple-gpgpu",
    number: "02",
    title: "Simple GPGPU (In Progress)",
    impact: "Building a lightweight parallel compute architecture to explore SIMT-style execution fundamentals.",
    summary:
      "This project is focused on core scheduling ideas, memory behavior, and a minimal toolflow for testing parallel kernels on custom hardware logic.",
    tech: ["Computer Architecture", "Parallel Compute", "RTL Design"],
    links: {},
    media: {}
  },
  {
    id: "self-balancing-robot",
    number: "03",
    title: "Self-Balancing Robot",
    impact: "Built a two-wheel balancing platform that stabilizes itself in real time using closed-loop control.",
    summary:
      "Designed the sensing and control pipeline to fuse IMU data, estimate tilt, and continuously correct motor output for stable upright motion.",
    tech: ["Control Systems", "Embedded C/C++", "IMU Sensor Fusion", "Motor Control"],
    links: { youtube: "https://www.youtube.com/watch?v=1SRvt5VAaLs" },
    media: {}
  },
  {
    id: "metal-detecting-robot",
    number: "04",
    title: "Metal Detecting Robot",
    impact: "Developed a mobile robot that scans and flags potential metal targets while navigating test areas.",
    summary:
      "Integrated a detection module with drive control logic and tuned traversal behavior to improve detection consistency and repeatability.",
    tech: ["Robotics", "Embedded Systems", "Sensor Integration", "Prototyping"],
    links: { youtube: "https://youtu.be/dmAkMjtUFdI" },
    media: {}
  }
];

const THEMES = {
  morning: { label: "Morning" },
  day: { label: "Day" },
  evening: { label: "Evening" },
  midnight: { label: "Midnight" }
};

const THEME_ORDER = ["auto", "midnight", "evening", "day", "morning"];

const body = document.body;
const header = document.getElementById("main-header");
const workList = document.getElementById("work-list");
const modeLabel = document.getElementById("mode-label");
const currentTimeNode = document.getElementById("current-time");
const themeToggle = document.getElementById("theme-toggle");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const sections = ["work", "about", "contact"].map((id) => document.getElementById(id)).filter(Boolean);

const modal = document.getElementById("video-modal");
const modalCloseButton = document.getElementById("video-modal-close");
const modalIframe = document.getElementById("video-modal-iframe");
const modalTitle = document.getElementById("video-modal-title");
const modalLink = document.getElementById("video-modal-link");

let lastFocusedElement = null;
let themePreference = localStorage.getItem("themePreference") || "auto";
let chimeAudioContext = null;
let nextChimeLowToHigh = true;

function themeForHour(hour) {
  if (hour >= 5 && hour < 11) {
    return "morning";
  }
  if (hour >= 11 && hour < 17) {
    return "day";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "midnight";
}

function activeTheme(now = new Date()) {
  if (themePreference !== "auto") {
    return themePreference;
  }
  return themeForHour(now.getHours());
}

function applyTheme(now = new Date()) {
  const theme = activeTheme(now);
  body.dataset.theme = theme;

  if (modeLabel) {
    modeLabel.textContent = THEMES[theme]?.label || "Midnight";
  }

  if (themeToggle) {
    const text = themePreference === "auto" ? "Theme: Auto" : `Theme: ${THEMES[theme]?.label || "Midnight"}`;
    themeToggle.textContent = text;
  }
}

function rotateThemePreference() {
  const currentIndex = THEME_ORDER.indexOf(themePreference);
  themePreference = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
  localStorage.setItem("themePreference", themePreference);
  applyTheme(new Date());
}

function updateTime(now = new Date()) {
  if (!currentTimeNode) {
    return;
  }
  currentTimeNode.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function startClock() {
  const tick = () => {
    const now = new Date();
    updateTime(now);
    applyTheme(now);
  };

  tick();
  window.setInterval(tick, 1000);
}

function setFooterYear() {
  const yearNode = document.getElementById("copyright-year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

function createLink(label, href) {
  const link = document.createElement("a");
  link.className = "work-link";
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function createWorkItem(item) {
  const article = document.createElement("article");
  article.className = "work-item reveal";

  const number = document.createElement("span");
  number.className = "work-item__number";
  number.textContent = item.number;

  const title = document.createElement("h3");
  title.className = "work-item__title";
  title.textContent = item.title;

  const impact = document.createElement("p");
  impact.className = "work-item__impact";
  impact.textContent = item.impact;

  const summary = document.createElement("p");
  summary.className = "work-item__summary";
  summary.textContent = item.summary;

  const tags = document.createElement("ul");
  tags.className = "work-item__tags";
  item.tech.forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    tags.appendChild(li);
  });

  const actions = document.createElement("div");
  actions.className = "work-item__actions";

  if (item.links.youtube) {
    actions.appendChild(createLink("YouTube", item.links.youtube));
  }

  if (item.media?.videoEmbed) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "work-button";
    button.textContent = "View Demo";
    button.dataset.openVideo = "true";
    button.dataset.videoEmbed = item.media.videoEmbed;
    button.dataset.videoLink = item.links.youtube || "";
    button.dataset.videoTitle = `${item.title} Demo`;
    actions.appendChild(button);
  }

  article.append(number, title, impact, summary, tags);
  if (actions.children.length > 0) {
    article.appendChild(actions);
  }

  return article;
}

function renderWorkItems() {
  if (!workList) {
    return;
  }

  workList.innerHTML = "";
  workItems.forEach((item) => {
    workList.appendChild(createWorkItem(item));
  });
}

function updateHeaderShadow() {
  if (!header) {
    return;
  }
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isMatch);
    link.setAttribute("aria-current", isMatch ? "page" : "false");
  });
}

function initNavObserver() {
  if (!("IntersectionObserver" in window) || sections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    {
      threshold: 0.52,
      rootMargin: "-25% 0px -45% 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));

  if (
    items.length === 0 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  items.forEach((item) => observer.observe(item));
}

function autoplayUrl(url) {
  if (!url) {
    return "";
  }
  return `${url}${url.includes("?") ? "&" : "?"}autoplay=1&rel=0`;
}

function openVideoModal(embedUrl, fallbackUrl, titleText) {
  if (!modal || !modalIframe || !modalTitle || !modalLink || !embedUrl) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modalIframe.src = autoplayUrl(embedUrl);
  modalTitle.textContent = titleText || "Project Demo";

  if (fallbackUrl) {
    modalLink.href = fallbackUrl;
    modalLink.hidden = false;
  } else {
    modalLink.hidden = true;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
}

function closeVideoModal() {
  if (!modal || !modalIframe) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalIframe.src = "";
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function trapModalFocus(event) {
  if (event.key !== "Tab" || !modal?.classList.contains("is-open")) {
    return;
  }

  const focusable = modal.querySelectorAll("button, a[href], iframe");
  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initModal() {
  document.addEventListener("click", (event) => {
    const openTrigger = event.target.closest("[data-open-video='true']");
    if (openTrigger) {
      openVideoModal(
        openTrigger.dataset.videoEmbed,
        openTrigger.dataset.videoLink,
        openTrigger.dataset.videoTitle
      );
      return;
    }

    if (
      event.target.closest("[data-close-modal='true']") ||
      event.target.closest("#video-modal-close")
    ) {
      closeVideoModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) {
      closeVideoModal();
    }
    trapModalFocus(event);
  });
}

function initThemeToggle() {
  if (themeToggle) {
    themeToggle.addEventListener("click", rotateThemePreference);
  }
}

function getChimeAudioContext() {
  if (!chimeAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    chimeAudioContext = new AudioCtx();
  }
  return chimeAudioContext;
}

function playChime() {
  const ctx = getChimeAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const duration = 0.12;
  const lowFreq = 560;
  const highFreq = 1420;
  const startFreq = nextChimeLowToHigh ? lowFreq : highFreq;
  const endFreq = nextChimeLowToHigh ? highFreq : lowFreq;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.88);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.start(now);
  osc.stop(now + duration + 0.01);

  nextChimeLowToHigh = !nextChimeLowToHigh;
}

function initClickChime() {
  const clickTargets = document.querySelectorAll("[data-nav-link], #theme-toggle");
  clickTargets.forEach((target) => {
    target.addEventListener("click", playChime);
  });
}

function initCursorOrb() {
  if (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const orb = document.createElement("div");
  orb.className = "cursor-orb";
  orb.setAttribute("aria-hidden", "true");
  document.body.appendChild(orb);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;
  let vx = 0;
  let vy = 0;

  const stiffness = 0.06;
  const damping = 0.82;
  const maxSpeed = 42;

  const tick = () => {
    const ax = (targetX - x) * stiffness;
    const ay = (targetY - y) * stiffness;

    vx = (vx + ax) * damping;
    vy = (vy + ay) * damping;

    if (Math.abs(vx) > maxSpeed) {
      vx = Math.sign(vx) * maxSpeed;
    }

    if (Math.abs(vy) > maxSpeed) {
      vy = Math.sign(vy) * maxSpeed;
    }

    x += vx;
    y += vy;
    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);

  document.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    orb.classList.add("is-visible");

    const interactiveTarget = event.target.closest("a, button, [data-open-video='true']");
    orb.classList.toggle("is-active", Boolean(interactiveTarget));
  });

  document.addEventListener("mouseleave", () => {
    orb.classList.remove("is-visible", "is-active");
  });

  document.addEventListener("mousedown", () => {
    orb.classList.add("is-active");
  });

  document.addEventListener("mouseup", (event) => {
    const interactiveTarget = event.target.closest("a, button, [data-open-video='true']");
    orb.classList.toggle("is-active", Boolean(interactiveTarget));
  });
}

renderWorkItems();
setFooterYear();
initThemeToggle();
initClickChime();
startClock();
initCursorOrb();
updateHeaderShadow();
window.addEventListener("scroll", updateHeaderShadow, { passive: true });
initNavObserver();
initReveal();
initModal();
