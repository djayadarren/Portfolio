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
let sectionIntent = "";
let sectionIntentTimer = null;

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

function setSectionIntent(targetId) {
  if (sectionIntentTimer) {
    window.clearTimeout(sectionIntentTimer);
    sectionIntentTimer = null;
  }

  sectionIntent = targetId || "";

  if (!sectionIntent) {
    delete body.dataset.sectionIntent;
    return;
  }

  body.dataset.sectionIntent = sectionIntent;
  body.dataset.activeSection = sectionIntent;

  sectionIntentTimer = window.setTimeout(() => {
    sectionIntent = "";
    delete body.dataset.sectionIntent;
    sectionIntentTimer = null;
  }, 1600);
}

function setActiveNav(sectionId) {
  if (sectionIntent && sectionId === sectionIntent) {
    setSectionIntent("");
  }

  body.dataset.activeSection = sectionIntent || sectionId || "";
  navLinks.forEach((link) => {
    const isMatch = Boolean(sectionId) && link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isMatch);
    link.setAttribute("aria-current", isMatch ? "page" : "false");
  });
}

function initNavIntentState() {
  navLinks.forEach((link) => {
    const applyIntent = () => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      setSectionIntent(targetId || "");
    };

    link.addEventListener("pointerdown", applyIntent);
    link.addEventListener("click", () => {
      applyIntent();
    });
  });
}

function initNavObserver() {
  if (!("IntersectionObserver" in window) || sections.length === 0) {
    return;
  }

  const visibilityBySection = new Map(
    sections.map((section) => [section.id, 0])
  );

  const syncActiveNav = () => {
    let bestId = "";
    let bestRatio = 0;

    visibilityBySection.forEach((ratio, id) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    });

    setActiveNav(bestId);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibilityBySection.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      syncActiveNav();
    },
    {
      threshold: [0, 0.08, 0.16, 0.24, 0.32, 0.4],
      rootMargin: "-20% 0px -38% 0px"
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
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.16) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: [0, 0.16],
      rootMargin: "0px 0px -6% 0px"
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

function initCompanyTrainOneShot() {
  const companyTrain = document.querySelector(".company-train");
  const trailLines = Array.from(document.querySelectorAll("[data-about-line]"));
  if (!companyTrain) {
    return;
  }

  const markCompanyGone = () => {
    companyTrain.classList.remove("is-running");
    companyTrain.classList.add("is-gone");
  };

  const revealAllTrailLines = () => {
    trailLines.forEach((line) => {
      const text = line.querySelector(".about-trail-text");
      line.classList.add("is-done");
      line.classList.remove("is-revealing");
      if (text) {
        text.style.clipPath = "inset(0 0 0 0)";
        text.style.opacity = "1";
      }
    });
  };

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  ) {
    markCompanyGone();
    revealAllTrailLines();
    return;
  }

  let hasStarted = false;
  let trailStarted = false;
  let handoffTimer = null;

  const trailTrainSpeedPxPerMs = 0.48;

  const animateTrailLine = (line, speedPxPerMs) =>
    new Promise((resolve) => {
      const text = line.querySelector(".about-trail-text");
      const train = line.querySelector(".about-trail-train");

      if (!text || !train) {
        line.classList.add("is-done");
        resolve();
        return;
      }

      line.classList.add("is-revealing");
      text.style.opacity = "1";

      const textWidth = Math.max(text.scrollWidth, 1);
      const lineWidth = Math.max(line.clientWidth, textWidth, 1);
      const trainWidth = Math.max(train.offsetWidth, 1);
      const startAnchorPx = -56;
      const startX = -trainWidth + startAnchorPx;
      const endX = lineWidth + trainWidth * 1.35;
      const travelDistance = Math.max(1, endX - startX);
      const revealDurationMs = 320;
      const totalDurationMs = travelDistance / Math.max(speedPxPerMs, 0.01);
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const revealProgress = Math.max(0, Math.min(1, elapsed / revealDurationMs));
        const progress = Math.max(0, Math.min(1, elapsed / totalDurationMs));
        const x = startX + travelDistance * progress;

        // Reveal from right-to-left so the train nose appears first, then body.
        train.style.clipPath = `inset(0 0 0 ${Math.max(0, (1 - revealProgress) * 100)}%)`;
        train.style.left = `${x}px`;

        const revealRatio = Math.max(0, Math.min(1, (x + trainWidth * 0.38) / textWidth));
        text.style.clipPath = `inset(0 ${100 - revealRatio * 100}% 0 0)`;

        if (progress < 1) {
          window.requestAnimationFrame(step);
          return;
        }

        line.classList.remove("is-revealing");
        line.classList.add("is-done");
        train.style.left = `${endX}px`;
        train.style.clipPath = "inset(0 0 0 0)";
        text.style.clipPath = "inset(0 0 0 0)";
        window.requestAnimationFrame(() => {
          train.style.opacity = "0";
          resolve();
        });
      };

      window.requestAnimationFrame(step);
    });

  const runTrailSequence = async () => {
    if (trailStarted) {
      return;
    }

    trailStarted = true;
    if (handoffTimer) {
      window.clearTimeout(handoffTimer);
      handoffTimer = null;
    }
    markCompanyGone();

    for (let i = 0; i < trailLines.length; i += 1) {
      await animateTrailLine(trailLines[i], trailTrainSpeedPxPerMs);
    }
  };

  const startAnimation = () => {
    if (hasStarted || companyTrain.classList.contains("is-running") || companyTrain.classList.contains("is-gone")) {
      return;
    }

    hasStarted = true;
    companyTrain.classList.add("is-running");

    // Start the line-trail handoff earlier so the first train phase
    // feels snappier without changing its speed/acceleration profile.
    handoffTimer = window.setTimeout(() => {
      runTrailSequence();
    }, 1650);
  };

  companyTrain.addEventListener("click", (event) => {
    if (!companyTrain.classList.contains("is-gone")) {
      event.preventDefault();
      startAnimation();
    }
  });

  companyTrain.addEventListener(
    "keydown",
    (event) => {
      if ((event.key === "Enter" || event.key === " ") && !companyTrain.classList.contains("is-gone")) {
        event.preventDefault();
        startAnimation();
      }
    }
  );

  companyTrain.addEventListener("animationend", (event) => {
    if (event.animationName === "company-train-exit") {
      runTrailSequence();
    }
  });
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

function initContactLetterRoll() {
  const contactWord = document.querySelector(".contact-word");
  if (
    !contactWord ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const sourceText = (contactWord.textContent || "").trim();
  if (!sourceText) {
    return;
  }

  contactWord.setAttribute("aria-label", sourceText);
  contactWord.textContent = "";

  const letters = [];
  const fragment = document.createDocumentFragment();

  Array.from(sourceText).forEach((char) => {
    const span = document.createElement("span");
    span.className = "contact-letter";
    span.textContent = char;
    span.dataset.char = char;
    fragment.appendChild(span);
    letters.push(span);
  });

  contactWord.appendChild(fragment);

  let pointerX = -9999;
  let pointerY = -9999;
  let pointerActive = false;
  let letterCenters = [];
  let rafId = null;
  const radius = 140;

  const updateCenters = () => {
    letterCenters = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
  };

  const draw = () => {
    if (!pointerActive) {
      letters.forEach((letter) => letter.style.setProperty("--roll", "0"));
      return;
    }

    letters.forEach((letter, index) => {
      const center = letterCenters[index];
      if (!center) {
        letter.style.setProperty("--roll", "0");
        return;
      }

      const dx = pointerX - center.x;
      const dy = pointerY - center.y;
      const distance = Math.hypot(dx, dy);
      const intensity = Math.max(0, 1 - distance / radius);
      letter.style.setProperty("--roll", intensity.toFixed(3));
    });
  };

  const requestDraw = () => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      draw();
    });
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
      requestDraw();
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    pointerActive = false;
    requestDraw();
  });

  window.addEventListener(
    "scroll",
    () => {
      updateCenters();
      requestDraw();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    updateCenters();
    requestDraw();
  });

  updateCenters();
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
  let pointerX = x;
  let pointerY = y;
  let pointerInside = false;
  let vx = 0;
  let vy = 0;

  const stiffness = 0.06;
  const damping = 0.82;
  const maxSpeed = 42;
  const interactiveSelector = "a, button, [data-open-video='true']";

  const updateOrbActiveState = () => {
    if (!pointerInside) {
      orb.classList.remove("is-active");
      return;
    }

    const elementAtPointer = document.elementFromPoint(pointerX, pointerY);
    const interactiveTarget = elementAtPointer?.closest(interactiveSelector);
    orb.classList.toggle("is-active", Boolean(interactiveTarget));
  };

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
    pointerInside = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    targetX = event.clientX;
    targetY = event.clientY;
    orb.classList.add("is-visible");
    updateOrbActiveState();
  });

  document.addEventListener("mouseleave", () => {
    pointerInside = false;
    orb.classList.remove("is-visible", "is-active");
  });

  document.addEventListener("mousedown", () => {
    orb.classList.add("is-active");
  });

  document.addEventListener("mouseup", () => {
    window.requestAnimationFrame(updateOrbActiveState);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (pointerInside) {
        updateOrbActiveState();
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (pointerInside) {
      updateOrbActiveState();
    }
  });
}

renderWorkItems();
setFooterYear();
initThemeToggle();
initClickChime();
initNavIntentState();
startClock();
initCompanyTrainOneShot();
initContactLetterRoll();
initCursorOrb();
updateHeaderShadow();
window.addEventListener("scroll", updateHeaderShadow, { passive: true });
initNavObserver();
initReveal();
initModal();
