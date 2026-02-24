const workItems = [
  {
    id: "simple-gpgpu",
    number: "01",
    title: "Simple GPGPU (In Progress)",
    impact: "Building a lightweight parallel compute architecture to explore SIMT-style execution fundamentals.",
    summary:
      "This project is focused on core scheduling ideas, memory behavior, and a minimal toolflow for testing parallel kernels on custom hardware logic.",
    tech: ["Computer Architecture", "Parallel Compute", "RTL Design"],
    links: { github: "https://github.com/your-username/simple-gpgpu" },
    media: {}
  },
  {
    id: "riscv-pipeline",
    number: "02",
    title: "5-Stage Pipelined RISC-V Processor",
    impact: "Designed and completed a classic 5-stage core with forwarding and hazard handling for clean instruction flow.",
    summary:
      "Completed stage integration, pipeline control, and validation of hazard scenarios including load-use stalls and branch behavior.",
    tech: ["RISC-V", "Pipeline Control", "Hazard Detection", "SystemVerilog"],
    links: { github: "https://github.com/your-username/riscv-pipeline" },
    media: {}
  },
  {
    id: "rc4-cracker-circuit",
    number: "03",
    title: "RC4 Cracker\nCircuit",
    impact: "Built a parallel RC4 decryption architecture and achieved an 8x speedup with multi-core processing.",
    summary:
      "Engineered multiple FSMs in SystemVerilog for a DE1-SoC decryption pipeline, created ModelSim testbenches for module-level verification, and used SignalTap to debug synchronization on hardware.",
    tech: ["SystemVerilog", "Cryptography", "Parallel Processing", "FSM Design", "DE1-SoC", "ModelSim", "SignalTap"],
    links: {},
    media: {}
  },
  {
    id: "self-balancing-robot",
    number: "04",
    title: "Self-Balancing\nRobot",
    impact: "Built a two-wheel balancing platform that stabilizes itself in real time using closed-loop control.",
    summary:
      "Designed the sensing and control pipeline to fuse IMU data, estimate tilt, and continuously correct motor output for stable upright motion.",
    tech: ["Control Systems", "Embedded C/C++", "IMU Sensor Fusion", "Motor Control"],
    links: { youtube: "https://www.youtube.com/watch?v=1SRvt5VAaLs" },
    media: {}
  },
  {
    id: "metal-detecting-robot",
    number: "05",
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
  if (item.id === "simple-gpgpu") {
    const progressMatch = item.title.match(/\((?:in progress|In Progress)\)/);
    if (progressMatch?.index !== undefined) {
      const prefix = item.title.slice(0, progressMatch.index).trimEnd();
      title.append(document.createTextNode(`${prefix} `));

      const status = document.createElement("span");
      status.className = "work-item__title-status";
      status.textContent = progressMatch[0];
      title.appendChild(status);
    } else {
      title.textContent = item.title;
    }
  } else {
    title.textContent = item.title;
  }

  if (item.id === "rc4-cracker-circuit") {
    title.classList.add("work-item__title--rc4");
  } else if (item.id === "self-balancing-robot") {
    title.classList.add("work-item__title--self-balance");
  }

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

  if (item.links.github) {
    actions.appendChild(createLink("GitHub", item.links.github));
  }

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

function initMobileWelcome() {
  const popup = document.getElementById("mobile-welcome");
  const dismissButton = document.getElementById("mobile-welcome-dismiss");
  if (!popup || !dismissButton) {
    return;
  }

  const closeTargets = Array.from(popup.querySelectorAll("[data-mobile-welcome-close='true']"));
  const storageKey = "mobileWelcomeDismissedV1";
  const mobileWidthQuery = window.matchMedia("(max-width: 820px)");
  const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
  const portraitQuery = window.matchMedia("(orientation: portrait)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const isDismissed = () => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  };

  const markDismissed = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage failures (private mode / blocked storage).
    }
  };

  const shouldShowOnDevice = () => {
    const mobileLike = mobileWidthQuery.matches || coarsePointerQuery.matches;
    return mobileLike && portraitQuery.matches;
  };

  let isOpen = false;

  const setOpenState = (open) => {
    isOpen = open;
    popup.classList.toggle("is-open", open);
    popup.setAttribute("aria-hidden", open ? "false" : "true");
    body.classList.toggle("mobile-welcome-open", open);
    if (open) {
      dismissButton.focus({ preventScroll: true });
    }
  };

  const closePopup = ({ remember = true } = {}) => {
    if (remember) {
      markDismissed();
    }
    setOpenState(false);
  };

  closeTargets.forEach((target) => {
    target.addEventListener("click", () => closePopup({ remember: true }));
  });

  dismissButton.addEventListener("click", () => closePopup({ remember: true }));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      closePopup({ remember: true });
    }
  });

  const closeWhenNotMobile = () => {
    if (!shouldShowOnDevice() && isOpen) {
      closePopup({ remember: false });
    }
  };

  mobileWidthQuery.addEventListener("change", closeWhenNotMobile);
  coarsePointerQuery.addEventListener("change", closeWhenNotMobile);
  portraitQuery.addEventListener("change", closeWhenNotMobile);

  if (isDismissed() || !shouldShowOnDevice()) {
    return;
  }

  const openDelayMs = reducedMotionQuery.matches ? 40 : 620;
  window.setTimeout(() => {
    if (isDismissed() || !shouldShowOnDevice()) {
      return;
    }
    setOpenState(true);
  }, openDelayMs);
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
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

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

  if (isReducedMotion) {
    markCompanyGone();
    revealAllTrailLines();
    return;
  }

  let hasStarted = false;
  let trailStarted = false;
  let handoffTimer = null;

  const trailTrainSpeedPxPerMs = (isCoarsePointer ? 0.36 : 0.48) * 1.15;
  // Train art visible bounds within its 140px-tall viewBox (includes stroke/wheels):
  // top ~= 30px, bottom ~= 124px.
  const TRAIN_VISIBLE_TOP_RATIO = 30 / 140;
  const TRAIN_VISIBLE_BOTTOM_RATIO = 124 / 140;
  const TRAIN_VISIBLE_HEIGHT_RATIO = TRAIN_VISIBLE_BOTTOM_RATIO - TRAIN_VISIBLE_TOP_RATIO;
  const TRAIN_TRANSLATE_Y_RATIO = 0.5;
  const UPPER_PASS_Y_OFFSET_PX = -19;
  const BOTTOM_PASS_Y_OFFSET_PX = -2.5;
  // Slight oversize so each pass fully covers its chunk including cap-height edges.
  const TRAIN_CHUNK_OVERSIZE = 1.18;
  const TRAIN_START_ANCHOR_PX = -56;
  const TRAIN_EXIT_EXTRA_WIDTH_RATIO = 1.35;
  const SECOND_PASS_START_PROGRESS = 0.3;
  const RIGHT_CAVE_MOUTH_OFFSET_PX = 0;
  const RIGHT_PASS_START_OFFSET_PX = 0;
  // Back (left) inset for the right-facing train art due to viewBox side padding.
  const TRAIN_BACK_INSET_RATIO = 36 / 760;
  // Small lead to remove the visible gap between train back and text trail.
  const TRAIL_TIGHTEN_PX = 2;
  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const setTopBottomRevealClip = (text, passIndex, passCount, ratio, curvePct = 0, fromRight = false) => {
    const pct = clamp01(ratio) * 100;
    if (passCount === 2) {
      if (ratio <= 0) {
        if (passIndex === 0) {
          text.style.clipPath = "polygon(0 0, 0 0, 0 50%, 0 50%)";
          return;
        }
        text.style.clipPath = "polygon(0 0, 100% 0, 100% 50%, 0 50%)";
        return;
      }

      const clampPct = (value) => Math.max(0, Math.min(100, value));
      const passStart = (100 / passCount) * passIndex;
      const passEnd = (100 / passCount) * (passIndex + 1);
      const passMid = (passStart + passEnd) * 0.5;
      const halfBand = (passEnd - passStart) * 0.5;

      // Keep tail curvature radius constant through the reveal so edge speed
      // stays uniform instead of feeling like it accelerates late.
      const activeCurvePct = Math.max(0, curvePct);
      const direction = fromRight ? -1 : 1;
      const edgeCenter = clampPct(fromRight ? 100 - pct : pct);
      const edgeInner = clampPct(edgeCenter + direction * activeCurvePct * 0.28);
      const edgeShoulder = clampPct(edgeCenter + direction * activeCurvePct * 0.72);
      const edgeOuter = clampPct(edgeCenter + direction * activeCurvePct);

      const yUpperOuter = passStart;
      const yUpperShoulder = passStart + halfBand * 0.22;
      const yUpperInner = passStart + halfBand * 0.46;
      const yCenter = passMid;
      const yLowerInner = passEnd - halfBand * 0.46;
      const yLowerShoulder = passEnd - halfBand * 0.22;
      const yLowerOuter = passEnd;

      if (passIndex === 0) {
        text.style.clipPath = `polygon(
          0 0,
          ${edgeOuter}% ${yUpperOuter}%,
          ${edgeShoulder}% ${yUpperShoulder}%,
          ${edgeInner}% ${yUpperInner}%,
          ${edgeCenter}% ${yCenter}%,
          ${edgeInner}% ${yLowerInner}%,
          ${edgeShoulder}% ${yLowerShoulder}%,
          ${edgeOuter}% ${yLowerOuter}%,
          0 ${passEnd}%
        )`;
        return;
      }

      // Keep previous passes fully visible, then apply curved reveal for this pass.
      if (fromRight) {
        text.style.clipPath = `polygon(
          0 0,
          100% 0,
          100% 100%,
          ${edgeOuter}% ${yLowerOuter}%,
          ${edgeShoulder}% ${yLowerShoulder}%,
          ${edgeInner}% ${yLowerInner}%,
          ${edgeCenter}% ${yCenter}%,
          ${edgeInner}% ${yUpperInner}%,
          ${edgeShoulder}% ${yUpperShoulder}%,
          ${edgeOuter}% ${yUpperOuter}%,
          0 ${passStart}%
        )`;
      } else {
        text.style.clipPath = `polygon(
          0 0,
          100% 0,
          100% ${passStart}%,
          ${edgeOuter}% ${yUpperOuter}%,
          ${edgeShoulder}% ${yUpperShoulder}%,
          ${edgeInner}% ${yUpperInner}%,
          ${edgeCenter}% ${yCenter}%,
          ${edgeInner}% ${yLowerInner}%,
          ${edgeShoulder}% ${yLowerShoulder}%,
          ${edgeOuter}% ${yLowerOuter}%,
          0 ${passEnd}%
        )`;
      }
      return;
    }
    // Fallback for any non-2-pass setup.
    text.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  };

  const animateTrailLine = (
    line,
    speedPxPerMs,
    passIndex = 0,
    passCount = 2,
    isFinalPass = true,
    trainHeightPx = null,
    trainCenterRatio = 0.5
  ) =>
    new Promise((resolve) => {
      const text = line.querySelector(".about-trail-text");
      const trainTemplate = line.querySelector(".about-trail-train");

      if (!text || !trainTemplate) {
        line.classList.add("is-done");
        resolve();
        return;
      }

      const train = trainTemplate.cloneNode(false);
      train.classList.add("about-trail-train--active");
      train.setAttribute("aria-hidden", "true");
      line.appendChild(train);

      const isReversePass = passCount === 2 && passIndex === passCount - 1;
      const canWriteClip = () => !(passIndex === 0 && line.dataset.aboutPass2Started === "1");

      const activeRevealCount = Number(line.dataset.aboutRevealCount || "0") + 1;
      line.dataset.aboutRevealCount = String(activeRevealCount);
      line.classList.add("is-revealing");
      text.style.opacity = "1";
      if (canWriteClip()) {
        setTopBottomRevealClip(text, passIndex, passCount, 0, 0, isReversePass);
      }
      train.style.opacity = "0.98";
      train.style.top = `${Math.max(0, Math.min(1, trainCenterRatio)) * 100}%`;
      train.style.backgroundImage = isReversePass
        ? 'url("assets/skytrain-side-alt-right.svg")'
        : 'url("assets/skytrain-side-colored-right.svg")';
      train.style.transform = isReversePass ? "translateY(-52%) scaleX(-1)" : "translateY(-52%)";

      const computedLineHeight = parseFloat(window.getComputedStyle(line).lineHeight) || 0;
      const dynamicTrainHeight = Math.max(24, trainHeightPx ?? computedLineHeight * 1.25);
      const dynamicTrainWidth = dynamicTrainHeight * 4.92;
      train.style.height = `${dynamicTrainHeight}px`;
      train.style.width = `${dynamicTrainWidth}px`;

      const textWidth = Math.max(text.getBoundingClientRect().width, 1);
      const lineWidth = Math.max(line.clientWidth || textWidth, 1);
      const trainWidth = Math.max(train.offsetWidth, 1);
      const lineRect = line.getBoundingClientRect();
      const shellRect = line.closest(".site-shell")?.getBoundingClientRect() || null;
      const rightBoundaryX = shellRect ? shellRect.right - lineRect.left : lineWidth;
      const rightCaveMouthX = rightBoundaryX + RIGHT_CAVE_MOUTH_OFFSET_PX;
      const startX = isReversePass ? rightCaveMouthX + RIGHT_PASS_START_OFFSET_PX : -trainWidth + TRAIN_START_ANCHOR_PX;
      const endX = isReversePass ? -trainWidth * TRAIN_EXIT_EXTRA_WIDTH_RATIO : lineWidth + trainWidth * TRAIN_EXIT_EXTRA_WIDTH_RATIO;
      const travelDistance = Math.max(1, Math.abs(endX - startX));
      const totalDurationMs = travelDistance / Math.max(speedPxPerMs, 0.01);
      const startTime = performance.now();
      const caveMouthX = isReversePass ? rightCaveMouthX : 0;
      const visibleTrainHeightPx = dynamicTrainHeight * TRAIN_VISIBLE_HEIGHT_RATIO;
      const tailCurvePct = ((visibleTrainHeightPx * 0.48) / Math.max(lineWidth, 1)) * 100;
      let finished = false;

      const finishTrail = () => {
        if (finished) {
          return;
        }
        finished = true;
        const nextCount = Math.max(0, Number(line.dataset.aboutRevealCount || "1") - 1);
        line.dataset.aboutRevealCount = String(nextCount);
        if (nextCount === 0) {
          line.classList.remove("is-revealing");
        }
        if (train.parentElement) {
          train.remove();
        }
        resolve();
      };

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.max(0, Math.min(1, elapsed / totalDurationMs));
        const x = isReversePass ? startX - travelDistance * progress : startX + travelDistance * progress;

        // Keep cave mouths fixed in world space so trains emerge from the same anchors.
        if (isReversePass) {
          const hiddenLeftPx = Math.max(0, Math.min(trainWidth, x + trainWidth - caveMouthX));
          const hiddenLeftPct = (hiddenLeftPx / trainWidth) * 100;
          train.style.clipPath = `inset(0 0 0 ${hiddenLeftPct}%)`;
        } else {
          const hiddenLeftPx = Math.max(0, Math.min(trainWidth, caveMouthX - x));
          const hiddenLeftPct = (hiddenLeftPx / trainWidth) * 100;
          train.style.clipPath = `inset(0 0 0 ${hiddenLeftPct}%)`;
        }
        train.style.left = `${x}px`;

        let backProgress = 0;
        if (isReversePass) {
          const visualTrainBackX = x + trainWidth * (1 - TRAIN_BACK_INSET_RATIO);
          const tunedTrainBackX = visualTrainBackX - TRAIL_TIGHTEN_PX;
          backProgress = clamp01((caveMouthX - tunedTrainBackX) / Math.max(lineWidth, 1));
        } else {
          const visualTrainBackX = x + trainWidth * TRAIN_BACK_INSET_RATIO;
          const tunedTrainBackX = visualTrainBackX + TRAIL_TIGHTEN_PX;
          backProgress = clamp01((tunedTrainBackX - caveMouthX) / Math.max(lineWidth, 1));
        }
        if (canWriteClip()) {
          setTopBottomRevealClip(text, passIndex, passCount, backProgress, tailCurvePct, isReversePass);
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
          return;
        }

        if (isFinalPass) {
          line.classList.add("is-done");
        }
        train.style.left = `${endX}px`;
        train.style.clipPath = "inset(0 0 0 0)";
        if (isFinalPass) {
          text.style.clipPath = "inset(0 0 0 0)";
        } else if (canWriteClip()) {
          setTopBottomRevealClip(text, passIndex, passCount, 1, tailCurvePct, isReversePass);
        }
        window.requestAnimationFrame(() => {
          finishTrail();
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
      const line = trailLines[i];
      const text = line.querySelector(".about-trail-text");
      const passCount = 2;
      const textBlockHeight = Math.max(text?.getBoundingClientRect().height || line.getBoundingClientRect().height, 1);
      const baseChunkHeight = textBlockHeight / passCount;
      const chunkHeight = baseChunkHeight * TRAIN_CHUNK_OVERSIZE;
      const chunkTrainHeight = chunkHeight / TRAIN_VISIBLE_HEIGHT_RATIO;
      const centerOffsetPx = (TRAIN_TRANSLATE_Y_RATIO - TRAIN_VISIBLE_TOP_RATIO) * chunkTrainHeight;
      const passTopPx0 = UPPER_PASS_Y_OFFSET_PX;
      const passTopPx1 = baseChunkHeight + BOTTOM_PASS_Y_OFFSET_PX;
      const trainCenterRatio0 = clamp01((passTopPx0 + centerOffsetPx) / textBlockHeight);
      const trainCenterRatio1 = clamp01((passTopPx1 + centerOffsetPx) / textBlockHeight);

      const lineWidth = Math.max(line.clientWidth, text?.getBoundingClientRect().width || 1, 1);
      const trainWidth = Math.max(chunkTrainHeight * 4.92, 1);
      const pass0StartX = -trainWidth + TRAIN_START_ANCHOR_PX;
      const pass0EndX = lineWidth + trainWidth * TRAIN_EXIT_EXTRA_WIDTH_RATIO;
      const pass0Distance = Math.max(1, Math.abs(pass0EndX - pass0StartX));
      const pass0DurationMs = pass0Distance / Math.max(trailTrainSpeedPxPerMs, 0.01);
      const overlapDelayMs = Math.max(80, pass0DurationMs * SECOND_PASS_START_PROGRESS);

      const pass0Promise = animateTrailLine(
        line,
        trailTrainSpeedPxPerMs,
        0,
        passCount,
        false,
        chunkTrainHeight,
        trainCenterRatio0
      );

      await new Promise((resolveDelay) => {
        window.setTimeout(resolveDelay, overlapDelayMs);
      });
      line.dataset.aboutPass2Started = "1";

      const pass1Promise = animateTrailLine(
        line,
        trailTrainSpeedPxPerMs,
        1,
        passCount,
        true,
        chunkTrainHeight,
        trainCenterRatio1
      );

      await Promise.all([pass0Promise, pass1Promise]);
      delete line.dataset.aboutPass2Started;
      delete line.dataset.aboutRevealCount;
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

function initRc4CryptoTitle() {
  const title = document.querySelector(".work-item__title--rc4");
  if (!title || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const rc4Card = title.closest(".work-item");
  const hoverTarget = rc4Card || title;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  const sourceText = (title.textContent || "").trim();
  if (!sourceText) {
    return;
  }

  const glyphs = "01#%&*<>[]{}=/\\|+-";
  const crackDurationMs = (620 * 12.2) / 1.15;
  const crackedHoldMs = 1800;
  const solvedFontStates = [
    { family: "\"Space Grotesk\", sans-serif", weight: "700", spacing: "-0.008em" },
    { family: "\"Fira Code\", ui-monospace, monospace", weight: "600", spacing: "0.004em" },
    { family: "\"Segoe UI\", \"Trebuchet MS\", sans-serif", weight: "700", spacing: "-0.003em" },
    { family: "\"Arial\", sans-serif", weight: "700", spacing: "-0.006em" }
  ];
  const fontStates = [
    { family: "\"Fira Code\", ui-monospace, monospace", weight: "500", spacing: "0.012em" },
    { family: "\"Wingdings\", \"Webdings\", \"Segoe UI Symbol\", sans-serif", weight: "400", spacing: "0.02em" },
    { family: "\"Rubik Glitch\", \"Space Grotesk\", sans-serif", weight: "400", spacing: "0.014em" },
    { family: "\"UnifrakturMaguntia\", \"Times New Roman\", serif", weight: "400", spacing: "0.012em" },
    { family: "\"Monoton\", \"Arial Black\", sans-serif", weight: "400", spacing: "0.018em" },
    { family: "\"Zapf Dingbats\", \"Segoe UI Symbol\", serif", weight: "400", spacing: "0.024em" },
    { family: "\"Symbol\", \"Segoe UI Symbol\", serif", weight: "400", spacing: "0.02em" },
    { family: "\"Space Grotesk\", sans-serif", weight: "700", spacing: "-0.008em" }
  ];
  const solvedFontSwitchIntervalMs = 360;
  const fontSwitchIntervalMs = 420;
  const tickIntervalMs = 72;
  let isAnimating = false;
  let isHovering = false;
  let hasUnlocked = false;
  let progress = 0;
  let holdStartedAt = 0;
  let loopId = null;
  let animationStartAt = 0;
  let animationStartProgress = 0;

  const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
  const randomFontState = () => fontStates[Math.floor(Math.random() * fontStates.length)];
  const applyFontState = (node, fontState) => {
    node.style.fontFamily = fontState.family;
    node.style.fontWeight = fontState.weight;
    node.style.letterSpacing = fontState.spacing;
    node.style.display = "inline";
    node.style.whiteSpace = "normal";
  };

  const renderFrame = (revealChars, noiseLevel, elapsedMs) => {
    const baseFontIndex = Math.floor(elapsedMs / fontSwitchIntervalMs) % fontStates.length;
    const baseFontState = fontStates[baseFontIndex];
    const solvedFontIndex = Math.floor(elapsedMs / solvedFontSwitchIntervalMs) % solvedFontStates.length;
    const solvedFontState = solvedFontStates[solvedFontIndex];
    const fragment = document.createDocumentFragment();

    Array.from(sourceText).forEach((char, index) => {
      const isLineBreak = char === "\n";
      const isSpacer = char === " ";
      const isSeparator = char === "-" || char === "/";
      const isLockedChar = isLineBreak || isSpacer || isSeparator;
      const isSolved = !isLockedChar && index < revealChars;
      let outputChar = char;

      if (!isLockedChar && index >= revealChars && Math.random() < noiseLevel) {
        outputChar = randomGlyph();
      }

      if (isLineBreak) {
        fragment.appendChild(document.createElement("br"));
        return;
      }

      if (isSpacer) {
        outputChar = "\u00A0";
      }

      const span = document.createElement("span");
      const fontState = isSolved
        ? solvedFontState
        : isLockedChar
          ? solvedFontState
          : Math.random() < 0.72
            ? randomFontState()
            : baseFontState;
      applyFontState(span, fontState);
      span.textContent = outputChar;
      fragment.appendChild(span);
    });

    title.replaceChildren(fragment);
  };

  const renderSolved = () => {
    title.textContent = sourceText;
  };

  const setActiveVisual = (isActive) => {
    title.classList.toggle("is-crypto-active", isActive);
  };

  const pausePartial = () => {
    if (loopId !== null) {
      window.clearInterval(loopId);
      loopId = null;
    }
    isAnimating = false;
    setActiveVisual(false);
  };

  const settleSolved = () => {
    if (loopId !== null) {
      window.clearInterval(loopId);
      loopId = null;
    }
    isAnimating = false;
    progress = 1;
    holdStartedAt = 0;
    setActiveVisual(false);
    renderSolved();
  };

  const paint = () => {
    if (!isAnimating) {
      return;
    }

    const now = performance.now();

    if (progress < 1) {
      progress = Math.min(1, animationStartProgress + (now - animationStartAt) / crackDurationMs);

      if (progress >= 1) {
        hasUnlocked = true;
        holdStartedAt = now;
        renderSolved();
      } else {
        const eased = 1 - Math.pow(1 - progress, 2.3);
        const revealChars = Math.floor(sourceText.length * eased);
        const noiseLevel = Math.max(0.24, 0.9 - progress * 0.68);
        renderFrame(revealChars, noiseLevel, now);
      }
    } else if (isCoarsePointer) {
      settleSolved();
    } else if (!isHovering) {
      settleSolved();
    } else {
      if (!holdStartedAt) {
        holdStartedAt = now;
      }
      if (now - holdStartedAt >= crackedHoldMs) {
        progress = 0;
        animationStartAt = now;
        animationStartProgress = 0;
        holdStartedAt = 0;
        renderFrame(0, 1, now);
      } else {
        renderSolved();
      }
    }
  };

  const startAnimation = ({ resume = false } = {}) => {
    if (isAnimating) {
      return;
    }

    if (hasUnlocked && !resume) {
      progress = 0;
    }

    holdStartedAt = 0;
    isAnimating = true;
    setActiveVisual(true);
    animationStartAt = performance.now();
    animationStartProgress = progress;

    if (progress <= 0) {
      renderFrame(0, 1, animationStartAt);
    }

    if (loopId !== null) {
      window.clearInterval(loopId);
      loopId = null;
    }
    loopId = window.setInterval(paint, tickIntervalMs);
    paint();
  };

  const onEnter = () => {
    if (isCoarsePointer) {
      return;
    }
    isHovering = true;

    if (hasUnlocked) {
      startAnimation({ resume: false });
      return;
    }

    startAnimation({ resume: true });
  };

  const onLeave = () => {
    if (isCoarsePointer) {
      return;
    }
    isHovering = false;

    if (hasUnlocked) {
      settleSolved();
      return;
    }

    // Before first full solve, keep the exact partial state and pause.
    pausePartial();
  };

  const onActivate = (event) => {
    if (event?.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if (event?.type === "keydown") {
      event.preventDefault();
    }

    if (isCoarsePointer) {
      if (hasUnlocked) {
        settleSolved();
        return;
      }
      startAnimation({ resume: true });
      return;
    }

    if (hasUnlocked) {
      startAnimation({ resume: false });
      return;
    }

    startAnimation({ resume: true });
  };

  const suspendForHiddenState = () => {
    if (hasUnlocked) {
      settleSolved();
      return;
    }
    pausePartial();
  };

  // Initial state: fully scrambled with mixed fonts.
  renderFrame(0, 1, performance.now());

  hoverTarget.addEventListener("pointerenter", onEnter);
  hoverTarget.addEventListener("pointerleave", onLeave);
  hoverTarget.addEventListener("click", onActivate);
  title.addEventListener("focus", onEnter);
  title.addEventListener("blur", onLeave);
  title.addEventListener("keydown", onActivate);

  window.addEventListener("blur", suspendForHiddenState);
  window.addEventListener("pagehide", suspendForHiddenState);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      suspendForHiddenState();
    }
  });
}

const ROUND_WHEEL_FALLBACK_POOL = ["o", "O", "0", "a", "e", "g", "b", "p", "q", "d"];

const SELF_BALANCE_TOWER_TEMPLATE = [
  { order: 0, role: "wheel_left", xN: 0.31, yN: 0.9, rot: -3.2 },
  { order: 1, role: "wheel_right", xN: 0.71, yN: 0.9, rot: 3.2 },
  { order: 2, role: "base", xN: 0.5, yN: 0.82, rot: -11.5 },
  { order: 3, role: "base", xN: 0.6, yN: 0.78, rot: 10.1 },
  { order: 4, role: "lower_mid", xN: 0.44, yN: 0.74, rot: -12.4 },
  { order: 5, role: "lower_mid", xN: 0.56, yN: 0.7, rot: 11.6 },
  { order: 6, role: "mid", xN: 0.46, yN: 0.66, rot: -11.1 },
  { order: 7, role: "mid", xN: 0.54, yN: 0.62, rot: 10.4 },
  { order: 8, role: "spine", xN: 0.47, yN: 0.58, rot: -9.8 },
  { order: 9, role: "spine", xN: 0.54, yN: 0.54, rot: 8.9 },
  { order: 10, role: "spine_high", xN: 0.48, yN: 0.5, rot: -8.6 },
  { order: 11, role: "upper_mid", xN: 0.53, yN: 0.46, rot: 7.8 },
  { order: 12, role: "upper_mid", xN: 0.47, yN: 0.42, rot: -7.3 },
  { order: 13, role: "upper", xN: 0.52, yN: 0.37, rot: 6.8 },
  { order: 14, role: "upper", xN: 0.48, yN: 0.32, rot: -6.3 },
  { order: 15, role: "top", xN: 0.51, yN: 0.27, rot: 5.9 },
  { order: 16, role: "top", xN: 0.49, yN: 0.22, rot: -5.5 },
  { order: 17, role: "top", xN: 0.5, yN: 0.17, rot: 5.1 }
];

const SELF_BALANCE_ROLE_SCORE = {
  base: { hyphen: 10, round: 6, wide: 4, stem: 1 },
  lower_mid: { hyphen: 2, round: 8, wide: 5, stem: 2 },
  mid: { hyphen: 1, round: 7, wide: 4, stem: 3 },
  spine: { hyphen: 0, round: 2, wide: 2, stem: 9 },
  spine_high: { hyphen: 0, round: 1, wide: 1, stem: 10 },
  upper_mid: { hyphen: 0, round: 2, wide: 2, stem: 9 },
  upper: { hyphen: 0, round: 1, wide: 1, stem: 9 },
  top: { hyphen: 1, round: 0, wide: -1, stem: 10 }
};

const SELF_BALANCE_MANUAL_LAYOUT = {
  enabled: true,
  widthN: 0.5,
  heightScale: 10.2,
  offsetXN: 0.5,
  baseTiltDeg: -1.85,
  letters: [
    // Source text: "Self-Balancing\nRobot"
    // Tweak these values: xN (0..1), yN (relative vertical), rot (deg)
    { index: 9, char: "n", xN: 0.47, yN: 0.96, rot: -80 },
    { index: 10, char: "c", xN: 0.25, yN: 1.1, rot: -90 },
    { index: 12, char: "n", xN: 0.42, yN: 0.94, rot: 10 },
    { index: 13, char: "g", xN: 0.5, yN: 1.041, rot: 90 },
    { index: 6, char: "a", xN: 0.49, yN: 0.885, rot: -35 },
    { index: 8, char: "a", xN: 0.55, yN: 0.87, rot: 20 },
    { index: 19, char: "t", xN: 0.23, yN: 1.005, rot: 40 },
    { index: 11, char: "i", xN: 0.63, yN: 1.02, rot: 0 },
    { index: 2, char: "l", xN: 0.68, yN: 0.95, rot: -120 },
    { index: 3, char: "f", xN: 0.16, yN: 1.04, rot: 57 },
    { index: 7, char: "l", xN: 0.58, yN: 1.0775, rot: -90 },
    { index: 1, char: "e", xN: 0.62, yN: 0.95, rot: -45 },
    { index: 15, char: "R", xN: 0.3, yN: 1.065, rot: -83 },
    { index: 17, char: "b", xN: 0.62, yN: 0.901, rot: -65 },
    { index: 5, char: "B", xN: 0.51, yN: 1.007, rot: -74 },
    { index: 0, char: "S", xN: 0.37, yN: 1.072, rot: 6 },
    { index: 4, char: "-", xN: 0.66, yN: 1.072, rot: -90 },
    { index: 16, char: "o", xN: 0.34, yN: 1.12, rot: -2 },
    { index: 18, char: "o", xN: 0.55, yN: 1.12, rot: 2 }
  ]
};

function computeTemplateLayout(template, width, height, xOffset = 0) {
  return template
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((slot) => ({
      ...slot,
      x: xOffset + slot.xN * width,
      y: slot.yN * height
    }));
}

function isRoundGlyph(char) {
  return /[o0aegbpqdmrs]/i.test(char);
}

function contactGapPx(above, below, averageCharHeight) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isHyphenPair = /[-_]/.test(above.char) || /[-_]/.test(below.char);
  const minHeight = Math.max(1, Math.min(above.height || 0, below.height || 0));
  let overlap = Math.min(minHeight * 0.78, averageCharHeight * 0.72);

  if (isHyphenPair) {
    overlap = Math.min(minHeight * 0.64, averageCharHeight * 0.58);
  } else if (isRoundGlyph(above.char)) {
    overlap = Math.min(minHeight * 0.7, averageCharHeight * 0.64);
  }

  return clamp(overlap, Math.max(10, averageCharHeight * 0.36), Math.max(16, minHeight * 0.9));
}

function compactTowerStack(placedEntries, averageCharHeight, towerCenterX) {
  if (!Array.isArray(placedEntries) || placedEntries.length === 0) {
    return { compactHeight: null };
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wheelRoles = new Set(["wheel_left", "wheel_right"]);

  const wheels = placedEntries
    .filter((entry) => wheelRoles.has(entry.role))
    .sort((a, b) => a.order - b.order);
  const body = placedEntries
    .filter((entry) => !wheelRoles.has(entry.role))
    .sort((a, b) => a.order - b.order);

  if (wheels.length === 0 || body.length === 0) {
    return { compactHeight: null };
  }

  const wheelTopY = Math.min(...wheels.map((wheel) => wheel.y));
  const wheelToBaseOverlapPx = clamp(0.52 * averageCharHeight, 10, 28);

  const firstBody = body[0];
  firstBody.y = wheelTopY - firstBody.height + wheelToBaseOverlapPx;
  firstBody.x = firstBody.x * 0.88 + towerCenterX * 0.12;

  const lowBandCount = Math.min(7, body.length);

  for (let i = 1; i < body.length; i += 1) {
    const below = body[i - 1];
    const above = body[i];
    const overlap = contactGapPx(above, below, averageCharHeight);
    above.y = below.y - above.height + overlap;

    if (i < lowBandCount) {
      above.x = above.x * 0.56 + below.x * 0.29 + towerCenterX * 0.15;
    }
  }

  let minTop = Infinity;
  let maxBottom = -Infinity;
  placedEntries.forEach((entry) => {
    minTop = Math.min(minTop, entry.y);
    maxBottom = Math.max(maxBottom, entry.y + entry.height);
  });

  if (!Number.isFinite(minTop) || !Number.isFinite(maxBottom)) {
    return { compactHeight: null };
  }

  const topPadding = Math.max(averageCharHeight * 0.16, 8);
  const bottomPadding = Math.max(averageCharHeight * 0.2, 10);
  const shiftY = topPadding - minTop;
  placedEntries.forEach((entry) => {
    entry.y += shiftY;
  });

  const compactHeight = (maxBottom - minTop) + topPadding + bottomPadding;
  return {
    compactHeight: Number.isFinite(compactHeight) && compactHeight > 0 ? compactHeight : null
  };
}

function assignCharsToTemplateSlots(charEntries, templateSlots, wheelFallbackPool = ROUND_WHEEL_FALLBACK_POOL) {
  const remaining = charEntries
    .slice()
    .sort((a, b) => a.index - b.index);

  const takeByPredicate = (predicate) => {
    const idx = remaining.findIndex(predicate);
    if (idx === -1) {
      return null;
    }
    return remaining.splice(idx, 1)[0];
  };

  const takeByCharPreference = (pool) => {
    for (const preferred of pool) {
      const picked = takeByPredicate((candidate) => candidate.char.toLowerCase() === preferred.toLowerCase());
      if (picked) {
        return picked;
      }
    }
    return null;
  };

  const getTraits = (char) => ({
    round: /[o0aegbpqdmrs]/i.test(char),
    stem: /[iltfjrkh]/i.test(char),
    wide: /[mwncsb]/i.test(char),
    hyphen: /[-_]/.test(char)
  });

  const scoreForRole = (entry, role) => {
    const weights = SELF_BALANCE_ROLE_SCORE[role] || SELF_BALANCE_ROLE_SCORE.mid;
    const traits = getTraits(entry.char);
    const prefersLowerSupport = role === "base" || role === "lower_mid";
    let score = 0;
    score += traits.hyphen ? weights.hyphen : 0;
    score += traits.round ? weights.round : 0;
    score += traits.wide ? weights.wide : 0;
    score += traits.stem ? weights.stem : 0;

    if (traits.hyphen && role === "base") {
      score += 20;
    } else if (traits.hyphen && role === "lower_mid") {
      score += 12;
    }

    if (/[s]/i.test(entry.char) && prefersLowerSupport) {
      score += 10;
    }

    return score;
  };

  const takeBestForRole = (role) => {
    if (!remaining.length) {
      return null;
    }

    let bestIndex = 0;
    let bestScore = scoreForRole(remaining[0], role);

    for (let i = 1; i < remaining.length; i += 1) {
      const score = scoreForRole(remaining[i], role);
      if (score > bestScore || (score === bestScore && remaining[i].index < remaining[bestIndex].index)) {
        bestIndex = i;
        bestScore = score;
      }
    }

    return remaining.splice(bestIndex, 1)[0];
  };

  const orderedSlots = templateSlots
    .slice()
    .sort((a, b) => a.order - b.order);

  const wheelSlots = orderedSlots.filter((slot) => slot.role === "wheel_left" || slot.role === "wheel_right");
  const nonWheelSlots = orderedSlots.filter((slot) => slot.role !== "wheel_left" && slot.role !== "wheel_right");
  const assignments = [];

  wheelSlots.forEach((slot) => {
    let entry = takeByPredicate((candidate) => /[oO0]/.test(candidate.char));
    if (!entry) {
      entry = takeByCharPreference(wheelFallbackPool);
    }
    if (!entry) {
      entry = remaining.shift() || null;
    }
    if (entry) {
      assignments.push({ entry, slot });
    }
  });

  nonWheelSlots.forEach((slot) => {
    const entry = takeBestForRole(slot.role) || remaining.shift() || null;
    if (entry) {
      assignments.push({ entry, slot });
    }
  });

  return assignments.sort((a, b) => a.slot.order - b.slot.order);
}

function initSelfBalancingTitle() {
  const title = document.querySelector(".work-item__title--self-balance");
  if (!title) {
    return;
  }

  const sourceText = (title.textContent || "").trim();
  if (!sourceText) {
    return;
  }

  const chars = Array.from(sourceText);
  const LINE_ZAP_STEP_MS = 33;
  const LINE_ZAP_BASE_DURATION_MS = 510;
  const LINE_ZAP_PANEL_DELAY_EXTRA_MS = 90;
  const LINE_ZAP_PANEL_DURATION_MS = 680;
  const LINE_ZAP_RANDOM_JITTER = 3.2;
  const zapLetterCount = chars.filter((char) => char !== " " && char !== "\n").length;
  const lineZapLettersDurationMs =
    LINE_ZAP_BASE_DURATION_MS + Math.max(0, zapLetterCount - 1) * LINE_ZAP_STEP_MS;
  const lineZapPanelDelayMs = lineZapLettersDurationMs + LINE_ZAP_PANEL_DELAY_EXTRA_MS;
  const lineZapTotalMs = lineZapPanelDelayMs + LINE_ZAP_PANEL_DURATION_MS + 120;
  let isTowerMode = true;
  let resizeTimer = null;
  let lineZapTimer = null;

  title.setAttribute("role", "button");
  title.setAttribute("tabindex", "0");
  title.setAttribute("aria-label", sourceText);
  title.style.setProperty("--line-zap-panel-delay", `${lineZapPanelDelayMs}ms`);
  title.style.setProperty("--line-zap-panel-duration", `${LINE_ZAP_PANEL_DURATION_MS}ms`);

  const applyModeClass = () => {
    title.classList.toggle("is-tower", isTowerMode);
    title.classList.toggle("is-line", !isTowerMode);
    title.setAttribute("aria-pressed", String(!isTowerMode));
  };

  const applyControlledRandomZapDelays = () => {
    const allChars = Array.from(title.querySelectorAll(".self-balance-char"));
    if (!allChars.length) {
      return;
    }

    const letters = allChars
      .filter((node) => !node.classList.contains("is-space"))
      .map((node) => ({
        node,
        sourceIndex: Number(node.dataset.charIndex || 0)
      }));

    if (!letters.length) {
      return;
    }

    // Controlled-random: preserve broad reading order while adding jitter.
    const randomized = letters
      .map((entry) => ({
        ...entry,
        score: entry.sourceIndex + (Math.random() * 2 - 1) * LINE_ZAP_RANDOM_JITTER
      }))
      .sort((a, b) => a.score - b.score);

    randomized.forEach((entry, order) => {
      entry.node.style.setProperty("--line-zap-delay", `${order * LINE_ZAP_STEP_MS}ms`);
    });

    let lastDelayMs = 0;
    allChars.forEach((node) => {
      if (node.classList.contains("is-space")) {
        node.style.setProperty("--line-zap-delay", `${lastDelayMs}ms`);
        return;
      }
      const rawDelay = node.style.getPropertyValue("--line-zap-delay");
      const parsed = Number.parseFloat(rawDelay);
      if (Number.isFinite(parsed)) {
        lastDelayMs = parsed;
      }
    });
  };

  const clearLineZapState = () => {
    if (lineZapTimer) {
      window.clearTimeout(lineZapTimer);
      lineZapTimer = null;
    }
    title.classList.remove("is-zap-to-line");
  };

  const triggerLineZapState = () => {
    clearLineZapState();
    applyControlledRandomZapDelays();
    title.classList.add("is-zap-to-line");
    lineZapTimer = window.setTimeout(() => {
      title.classList.remove("is-zap-to-line");
      lineZapTimer = null;
    }, lineZapTotalMs);
  };

  const buildLayout = () => {
    const measure = document.createElement("span");
    measure.className = "self-balance-measure";
    measure.style.maxWidth = "none";
    const measureChars = [];

    chars.forEach((char) => {
      const span = document.createElement("span");
      span.className = "self-balance-measure__char";
      span.textContent = char === " " ? "\u00A0" : char;
      measure.appendChild(span);
      measureChars.push(span);
    });

    title.textContent = "";
    title.appendChild(measure);

    const computed = window.getComputedStyle(title);
    const fontSize = parseFloat(computed.fontSize) || 16;
    const computedLineHeight = parseFloat(computed.lineHeight);
    const lineHeight = Number.isFinite(computedLineHeight) ? computedLineHeight : fontSize * 0.94;
    const lineBlockHeight = Math.max(measure.offsetHeight || lineHeight, lineHeight * 1.8);
    const lineWidth = Math.max(measure.offsetWidth || fontSize * chars.length * 0.45, fontSize * 5);
    const charMetrics = measureChars.map((node, index) => ({
      index,
      x: node.offsetLeft,
      y: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
      isActive: chars[index] !== " " && chars[index] !== "\n"
    }));
    const linePositions = charMetrics.map((metric) => ({ x: metric.x, y: metric.y }));

    title.removeChild(measure);

    const stack = document.createElement("span");
    stack.className = "self-balance-stack";
    stack.setAttribute("aria-hidden", "true");
    stack.style.setProperty("--tower-base-tilt", "-1.85deg");

    const activeEntries = chars
      .map((char, index) => ({ char, index }))
      .filter((entry) => entry.char !== " " && entry.char !== "\n");

    const activeMetrics = charMetrics.filter((metric) => metric.isActive);
    let averageCharHeight =
      activeMetrics.length > 0
        ? activeMetrics.reduce((sum, metric) => sum + metric.height, 0) / activeMetrics.length
        : fontSize * 0.92;
    let averageCharWidth =
      activeMetrics.length > 0
        ? activeMetrics.reduce((sum, metric) => sum + metric.width, 0) / activeMetrics.length
        : fontSize * 0.58;

    if (!Number.isFinite(averageCharHeight) || averageCharHeight <= 1) {
      averageCharHeight = fontSize * 0.92;
    }
    if (!Number.isFinite(averageCharWidth) || averageCharWidth <= 1) {
      averageCharWidth = fontSize * 0.58;
    }

    const activeCharCount = activeEntries.length;
    let towerHeight = Math.max(lineBlockHeight, averageCharHeight * 9.4 + lineHeight * 1.45);
    towerHeight = Math.max(towerHeight, lineHeight * 5.2);
    let towerWidth = Math.max(averageCharWidth * 4.6, lineWidth * 0.42);
    let towerOffsetX = (lineWidth - towerWidth) * 0.46;
    const metricsByIndex = new Map(charMetrics.map((metric) => [metric.index, metric]));

    const towerLayoutByIndex = new Map();
    let spaceAnchorX = lineWidth * 0.5;
    let spaceAnchorY = towerHeight * 0.58;
    let fallbackRotation = 0;
    let fallbackX = spaceAnchorX;
    let fallbackY = spaceAnchorY;

    if (SELF_BALANCE_MANUAL_LAYOUT.enabled) {
      const manual = SELF_BALANCE_MANUAL_LAYOUT;
      const widthN = Number.isFinite(manual.widthN) ? manual.widthN : 0.5;
      const heightScale = Number.isFinite(manual.heightScale) ? manual.heightScale : 10;
      const offsetXN = Number.isFinite(manual.offsetXN) ? manual.offsetXN : 0.5;
      const baseTilt = Number.isFinite(manual.baseTiltDeg) ? manual.baseTiltDeg : -1.85;
      stack.style.setProperty("--tower-base-tilt", `${baseTilt}deg`);

      towerWidth = Math.max(averageCharWidth * 5.2, lineWidth * widthN);
      towerHeight = Math.max(lineBlockHeight, averageCharHeight * heightScale, lineHeight * 5.2);
      towerOffsetX = (lineWidth - towerWidth) * offsetXN;

      const manualByIndex = new Map(
        (manual.letters || [])
          .filter((entry) => Number.isInteger(entry.index))
          .map((entry) => [entry.index, entry])
      );

      const placedEntries = activeEntries.map((entry, order) => {
        const metric = metricsByIndex.get(entry.index);
        const width = metric?.width && metric.width > 1 ? metric.width : averageCharWidth;
        const height = metric?.height && metric.height > 1 ? metric.height : averageCharHeight;
        const point = manualByIndex.get(entry.index);
        const xN = Number.isFinite(point?.xN) ? point.xN : 0.5;
        const yN = Number.isFinite(point?.yN) ? point.yN : Math.max(0.1, 0.9 - order * 0.045);
        const rotDeg = Number.isFinite(point?.rot) ? point.rot : 0;

        return {
          index: entry.index,
          char: entry.char,
          order,
          x: towerOffsetX + xN * towerWidth,
          y: yN * towerHeight,
          width,
          height,
          rotDeg
        };
      });

      let minTop = Infinity;
      let maxBottom = -Infinity;
      placedEntries.forEach((entry) => {
        minTop = Math.min(minTop, entry.y);
        maxBottom = Math.max(maxBottom, entry.y + entry.height);
      });

      if (Number.isFinite(minTop) && Number.isFinite(maxBottom)) {
        const topPadding = Math.max(averageCharHeight * 0.14, 8);
        const bottomPadding = Math.max(averageCharHeight * 0.2, 12);
        const shiftY = topPadding - minTop;
        placedEntries.forEach((entry) => {
          entry.y += shiftY;
        });
        maxBottom += shiftY;
        towerHeight = Math.max(lineBlockHeight, maxBottom + bottomPadding);
      }

      placedEntries.forEach((placed, order) => {
        towerLayoutByIndex.set(placed.index, {
          x: placed.x,
          y: placed.y,
          r: `${placed.rotDeg}deg`,
          delay: `${Math.min(180, order * 12)}ms`
        });
      });

      const fallbackPlaced = placedEntries[Math.max(0, Math.floor(placedEntries.length * 0.58))];
      if (fallbackPlaced) {
        spaceAnchorX = fallbackPlaced.x;
        spaceAnchorY = fallbackPlaced.y;
        fallbackRotation = fallbackPlaced.rotDeg;
        fallbackX = fallbackPlaced.x;
        fallbackY = fallbackPlaced.y;
      }
    } else {
      const templateForCount = SELF_BALANCE_TOWER_TEMPLATE.slice();
      while (templateForCount.length < activeCharCount) {
        const last = templateForCount[templateForCount.length - 1];
        templateForCount.push({
          order: last.order + 1,
          role: "top",
          xN: 0.5,
          yN: Math.max(0.06, last.yN - 0.045),
          rot: Math.max(-4.5, Math.min(4.5, last.rot * 0.86))
        });
      }

      const towerCenterX = towerOffsetX + towerWidth * 0.5;
      const towerSlots = computeTemplateLayout(
        templateForCount.slice(0, activeCharCount),
        towerWidth,
        towerHeight,
        towerOffsetX
      );

      const assignments = assignCharsToTemplateSlots(activeEntries, towerSlots, ROUND_WHEEL_FALLBACK_POOL);

      const placedEntries = assignments
        .map(({ entry, slot }) => {
          const metric = metricsByIndex.get(entry.index);
          const width = metric?.width && metric.width > 1 ? metric.width : averageCharWidth;
          const height = metric?.height && metric.height > 1 ? metric.height : averageCharHeight;

          return {
            index: entry.index,
            char: entry.char,
            role: slot.role,
            order: slot.order,
            x: slot.x,
            y: slot.y,
            width,
            height,
            rotDeg: slot.rot
          };
        })
        .sort((a, b) => a.order - b.order);

      const { compactHeight } = compactTowerStack(placedEntries, averageCharHeight, towerCenterX);
      if (compactHeight) {
        towerHeight = Math.max(lineBlockHeight, compactHeight);
      }

      const fallbackPlaced = placedEntries[Math.max(0, Math.floor(placedEntries.length * 0.58))];
      const fallbackSlot = fallbackPlaced || towerSlots[Math.max(0, Math.floor(towerSlots.length * 0.58))] || {
        x: lineWidth * 0.5,
        y: towerHeight * 0.58,
        rot: 0
      };
      fallbackRotation = "rotDeg" in fallbackSlot ? fallbackSlot.rotDeg : (fallbackSlot.rot || 0);
      spaceAnchorX = fallbackSlot.x;
      spaceAnchorY = fallbackSlot.y;
      fallbackX = fallbackSlot.x;
      fallbackY = fallbackSlot.y;

      placedEntries.forEach((placed, order) => {
        towerLayoutByIndex.set(placed.index, {
          x: placed.x,
          y: placed.y,
          r: `${placed.rotDeg}deg`,
          delay: `${Math.min(180, order * 12)}ms`
        });
      });
    }

    let zapOrder = 0;
    chars.forEach((char, index) => {
      if (char === "\n") {
        return;
      }

      const span = document.createElement("span");
      span.className = "self-balance-char";
      span.dataset.charIndex = String(index);
      if (char === " ") {
        span.classList.add("is-space");
      }
      span.textContent = char === " " ? "\u00A0" : char;
      if (char === " ") {
        const spaceDelay = Math.max(0, zapOrder - 1) * LINE_ZAP_STEP_MS;
        span.style.setProperty("--line-zap-delay", `${spaceDelay}ms`);
      } else {
        const zapDelay = zapOrder * LINE_ZAP_STEP_MS;
        span.style.setProperty("--line-zap-delay", `${zapDelay}ms`);
        zapOrder += 1;
      }

      const linePosition = linePositions[index] || { x: 0, y: 0 };
      span.style.setProperty("--line-x", `${linePosition.x}px`);
      span.style.setProperty("--line-y", `${linePosition.y}px`);

      if (char === " ") {
        span.style.setProperty("--tower-x", `${spaceAnchorX}px`);
        span.style.setProperty("--tower-y", `${spaceAnchorY}px`);
        span.style.setProperty("--tower-r", "0deg");
        span.style.setProperty("--tower-delay", "0ms");
      } else {
        const towerLayout = towerLayoutByIndex.get(index) || {
          x: fallbackX,
          y: fallbackY,
          r: `${fallbackRotation}deg`,
          delay: "0ms"
        };
        span.style.setProperty("--tower-x", `${towerLayout.x}px`);
        span.style.setProperty("--tower-y", `${towerLayout.y}px`);
        span.style.setProperty("--tower-r", towerLayout.r);
        span.style.setProperty("--tower-delay", towerLayout.delay);
      }

      stack.appendChild(span);
    });

    title.appendChild(stack);
    title.style.setProperty("--self-balance-width", `${lineWidth}px`);
    title.style.setProperty("--self-balance-line-height", `${lineBlockHeight}px`);
    title.style.setProperty("--self-balance-tower-height", `${towerHeight}px`);
    applyModeClass();
  };

  const toggleMode = () => {
    const wasTowerMode = isTowerMode;
    isTowerMode = !isTowerMode;
    if (wasTowerMode && !isTowerMode) {
      triggerLineZapState();
    } else {
      clearLineZapState();
    }
    applyModeClass();
  };

  title.addEventListener("click", toggleMode);
  title.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    toggleMode();
  });

  window.addEventListener("resize", () => {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(buildLayout, 120);
  });

  buildLayout();
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
initRc4CryptoTitle();
initSelfBalancingTitle();
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
initMobileWelcome();
