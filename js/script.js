// =====================================================
// BOOTSTRAP
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  anchor()
  scrollToTop()
  mobileNav()
  videoPlay()
  initCounter()
  initSlider()
})

window.addEventListener('load', () => {
  document.documentElement.classList.add('loaded')
})

// =====================================================
// COMMON UI
// =====================================================

function anchor() {
  const links = document.querySelectorAll('.anchor')
  if (!links.length) return

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      
      const href = link.getAttribute('href')
      const offsetTop = document.querySelector(href).offsetTop

      scroll({
        top: offsetTop,
        behavior: 'smooth'
      })
    })
  })
}

function scrollToTop() {
  const btn = document.querySelector('#scrollToTop')
  if (!btn) return

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
}

function mobileNav() {
  const header = document.querySelector('.header')
  if (!header) return

  const hamburger = header.querySelector('.hamburger')
  const nav = header.querySelector('.navigation')
  const body = document.querySelector('body')

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active')
    nav.classList.toggle('visible')
    body.classList.toggle('overflow-hidden')
  })

  const updateNavTransition = () => {
    window.innerWidth < 992 
      ? nav.style.setProperty('--transition-duration', '.3s') 
      : nav.style.removeProperty('--transition-duration')
  }

  updateNavTransition()
  window.addEventListener('resize', updateNavTransition)
}

function videoPlay() {
  const video = document.querySelector('.section-1 video');
  if (!video) return

  video.muted = true;
  video.playsInline = true;

  video.addEventListener('canplay', () => {
    video.play().catch(() => {});
  });
}

// =====================================================
// COUNTERS
// =====================================================

function initCounter() {
  const counters = document.querySelectorAll('.counter')
  if (!counters.length) return

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      animateCounter(entry.target)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.5 })

  counters.forEach(counter => observer.observe(counter))
}

function animateCounter(el, duration = 1500) {
  const text = el.textContent.trim()
  const match = text.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return

  const target = parseFloat(match[1])
  const suffix = match[2] || ''
  const startTime = performance.now()

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1)
    const value = Math.floor(progress * target)

    el.textContent = value + suffix
    progress < 1 ? requestAnimationFrame(update) : el.textContent = target + suffix
  }

  requestAnimationFrame(update)
}

// =====================================================
// SLIDER DATA
// =====================================================

const slidesData = [
  { 
    src: 'images/fcp-euro.webp',
    icon: 'images/fcp-euro-logo.svg',
    description: 'FCP Euro — premium European auto parts supplier specializing in OEM-quality replacement parts for German and European vehicles.'
  },
  { 
    src: 'images/fibra-inn.webp',
    icon: 'images/fibra-inn-logo.svg',
    description: 'Fibra Inn — hospitality investment platform operating a diversified portfolio of hotel assets across key business and leisure destinations.'
  },
  { 
    src: 'images/inver-cap.webp',
    icon: 'images/inver-cap-logo.svg',
    description: 'InverCap — investment management company providing financial planning, retirement solutions, and asset management services.'
  },
  { 
    src: 'images/ctg.webp',
    icon: 'images/ctg-logo.svg',
    description: 'CTG — corporate technology group delivering enterprise-level digital transformation solutions, including software engineering.'
  },
  { 
    src: 'images/wedderspoon.webp',
    icon: 'images/wedderspoon-logo.svg',
    description: 'Wedderspoon — premium Manuka honey brand known for its raw, unpasteurized honey sourced from sustainable New Zealand apiaries.'
  },
];

// =====================================================
// SLIDER DOM
// =====================================================

const DOM = {
  sliderWrap: document.querySelector('.slider-wrap'),
  slider: document.querySelector('.slider'),
  slidesWrap: document.querySelector('.slides'),
  sliderDescription: document.querySelector('.slider-description'),
  sliderText: document.querySelector('.slider-text'),
  nextBtn: document.querySelector('.next'),
  prevBtn: document.querySelector('.prev'),
};

const slots = [
  document.querySelector('.slot-a'),
  document.querySelector('.slot-b'),
  document.querySelector('.slot-c'),
  document.querySelector('.slot-d'),
  document.querySelector('.slot-e'),
];

const SLOT = {
  FIRST: 0,
  SECOND: 1,
  THIRD: 2,
  BUFFER: 3,
  FAR_BUFFER: 4,
};

const SLOT_NAMES = [
  'first',
  'second',
  'third',
  'rightHidden',
  'farRightHidden',
];

const BUFFER_COUNT = 2;
const VISIBLE_COUNT = 3;
const SLOT_COUNT = VISIBLE_COUNT + BUFFER_COUNT;

// =====================================================
// SLIDER STATE
// =====================================================

let currentIndex = 0;
let positions = {};
let isAnimating = false;
let isPausedByHover = false;

let resizePending = false;
let swipeEnabled = false;

let touchStartX = 0;
let touchStartY = 0;

let autoplayTween = null;

// =====================================================
// SLIDER CONFIG
// =====================================================

const ANIMATION_DURATION = 0.8;
const AUTOPLAY_DELAY = 4;
const SWIPE_THRESHOLD = 50;

// =====================================================
// SLIDER HELPERS
// =====================================================

function getIndex(index) {
  const total = slidesData.length;
  return ((index % total) + total) % total;
}

function applyPosition(el, pos) {
  gsap.set(el, {
    x: pos.x,
    y: pos.y,
    width: pos.width,
    height: pos.height,
  });
}

function syncSlotsToPositions() {
  SLOT_NAMES.forEach((positionName, index) => {
    applyPosition(
      slots[index],
      positions[positionName]
    );
  });
}

function syncSlotStates() {
  SLOT_NAMES.forEach((stateName, index) => {
    applyState(
      slots[index],
      stateName
    );
  });
}

function getIcon(slot) {
  return slot.querySelector('.slide-icon');
}

function setSlotContent(slot, imageIndex) {
  const data = slidesData[getIndex(imageIndex)];

  const img = slot.querySelector('.slide-img');
  const icon = slot.querySelector('.slide-icon img');

  img.src = data.src;
  icon.src = data.icon;
}

function show(...elements) {
  gsap.set(elements, {
    autoAlpha: 1,
  });
}

function hideBuffers() {
  gsap.set([slots[SLOT.BUFFER], slots[SLOT.FAR_BUFFER]], {
    autoAlpha: 0,
  });
}

function startAnimation() {
  stopAutoplay();
  isAnimating = true;
}

function finishAnimation() {
  isAnimating = false;

  if (resizePending) {
    resizePending = false;
    handleResize();
  }

  if (!isPausedByHover) {
    queueNextSlide();
  }
}

const getFarBufferImageIndex = () => currentIndex + SLOT_COUNT - 1;
const getPrevBufferIndex = () => currentIndex - 1;

// =====================================================
// SLIDER LAYOUT
// =====================================================

function calculateLayout() {
  const wrapWidth = DOM.sliderWrap.getBoundingClientRect().width;

  const isMobile = window.innerWidth <= 575;

  const slide1Width = isMobile ? wrapWidth : wrapWidth * 2 / 3;
  const slide2Width = wrapWidth / 3;
  const slide3Width = slide2Width / 2;

  const slide1Height = slide1Width;
  const slide2Height = slide1Width;
  const slide3Height = slide3Width * 1.75;

  positions = {
    leftHidden: {
      x: -slide1Width,
      y: 0,
      width: slide1Width,
      height: slide1Height,
    },

    first: {
      x: 0,
      y: 0,
      width: slide1Width,
      height: slide1Height,
    },

    second: {
      x: slide1Width,
      y: slide2Height / 4,
      width: slide2Width,
      height: slide2Height,
    },

    third: {
      x: isMobile ? slide1Width + slide2Width : wrapWidth,
      y: slide1Height,
      width: slide3Width,
      height: slide3Height,
    },

    rightHidden: {
      x: wrapWidth + slide3Width,
      y: slide1Height,
      width: slide3Width,
      height: slide3Height,
    },

    farRightHidden: {
      x: wrapWidth + slide3Width * 2,
      y: slide1Height,
      width: slide3Width,
      height: slide3Height,
    },
  };

  DOM.slidesWrap.style.height =
    `${slide1Height + slide3Height}px`;

  DOM.slider.style.width =
    `${slide1Width + slide2Width + slide3Width}px`;
}

function updateSliderTextPosition() {
  const rect = slots[SLOT.FIRST].getBoundingClientRect();
  const sliderRect = DOM.slider.getBoundingClientRect();

  DOM.sliderText.style.top =
    `${rect.bottom - sliderRect.top + 20}px`;
}

// =====================================================
// SLIDER STATES
// =====================================================

const positionStates = {
  first: {
    overlay: 0,
    cursor: 'default',

    icon: {
      x: 0,
      opacity: 1,
    }
  },

  second: {
    overlay: 0.4,
    cursor: 'pointer',

    icon: {
      x: 200,
      opacity: 0,
    }
  },

  third: {
    overlay: 0.6,
    cursor: 'pointer',

    icon: {
      x: 200,
      opacity: 0,
    }
  },

  rightHidden: {
    overlay: 0.6,
    cursor: 'default',

    icon: {
      x: 200,
      opacity: 0,
    }
  },

  farRightHidden: {
    overlay: 0,
    cursor: 'default',

    icon: {
      x: 200,
      opacity: 0,
    }
  },

  leftHidden: {
    overlay: 0,
    cursor: 'default',

    icon: {
      x: 0,
      opacity: 0,
    }
  },
};

function applyState(slot, stateName) {
  const state = positionStates[stateName];
  const icon = getIcon(slot);

  gsap.set(slot, {
    '--overlay-opacity': state.overlay,
  });

  slot.style.cursor = state.cursor;

  gsap.set(icon, {
    x: state.icon.x,
    opacity: state.icon.opacity,
  });
}

// =====================================================
// SLIDER RENDER
// =====================================================

function fillSlots(startIndex = currentIndex) {
  slots.forEach((slot, index) => {
    setSlotContent(
      slot,
      startIndex + index
    );
  });
}

function renderInitial() {
  fillSlots();
  syncSlotsToPositions();
  syncSlotStates();
  hideBuffers();

  DOM.sliderDescription.textContent =
    slidesData[getIndex(currentIndex)].description;

  gsap.set(DOM.sliderDescription, {
    opacity: 1,
  });
}

// =====================================================
// SLIDER AUTOPLAY
// =====================================================

function stopAutoplay() {
  autoplayTween?.kill();
  autoplayTween = null;
}

function queueNextSlide() {
  stopAutoplay();

  autoplayTween = gsap.delayedCall(AUTOPLAY_DELAY, () => {
    if (!isAnimating) {
      next();
    }
  });
}

// =====================================================
// SLIDER ROTATION
// =====================================================

function rotateNext() {
  slots.push(slots.shift());
}

function rotatePrev() {
  slots.unshift(slots.pop());
}

// =====================================================
// SLIDER ANIMATIONS
// =====================================================

function animateToPositionState(
  tl,
  slot,
  stateName,
  positionName,
  at = 0
) {
  const state = positionStates[stateName];
  const position = positions[positionName];
  const icon = getIcon(slot);

  slot.style.cursor = state.cursor;

  tl.to(slot, {
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height,
    '--overlay-opacity': state.overlay,
    duration: ANIMATION_DURATION,
    ease: 'power3.inOut',
  }, at)
  .to(icon, {
    x: state.icon.x,
    opacity: state.icon.opacity,
    duration: ANIMATION_DURATION,
    ease: 'power3.inOut',
  }, at);
}

function crossfadeDescription(tl, fromIndex, toIndex, startAt = 0) {
  const from = slidesData[getIndex(fromIndex)].description;
  const to = slidesData[getIndex(toIndex)].description;

  gsap.set(DOM.sliderDescription, { opacity: 1 });

  tl.to(DOM.sliderDescription, {
    opacity: 0,
    duration: ANIMATION_DURATION * 0.35,
    ease: 'power2.inOut',
  }, startAt);

  tl.add(() => {
    DOM.sliderDescription.textContent = to;
  }, startAt + ANIMATION_DURATION * 0.35);

  tl.to(DOM.sliderDescription, {
    opacity: 1,
    duration: ANIMATION_DURATION * 0.45,
    ease: 'power2.inOut',
  }, startAt + ANIMATION_DURATION * 0.35);
}

// =====================================================
// SLIDER NAVIGATION
// =====================================================

// move slider one position forward
function next() {
  if (isAnimating) return;

  startAnimation();

  applyState(
    slots[SLOT.BUFFER],
    'rightHidden'
  );

  show(slots[SLOT.BUFFER]);

  const tl = gsap.timeline({
    defaults: {
      duration: ANIMATION_DURATION,
      ease: 'power3.inOut',
    },

    onComplete() {
      currentIndex++;

      rotateNext();

      setSlotContent(
        slots[SLOT.FAR_BUFFER],
        getFarBufferImageIndex()
      );

      syncSlotsToPositions();
      hideBuffers();
      syncSlotStates();
      finishAnimation();
    }
  });

  crossfadeDescription(tl, currentIndex, currentIndex + 1);

  animateToPositionState(
    tl,
    slots[SLOT.FIRST],
    'leftHidden',
    'leftHidden'
  );

  animateToPositionState(
    tl,
    slots[SLOT.SECOND],
    'first',
    'first'
  );

  animateToPositionState(
    tl,
    slots[SLOT.THIRD],
    'second',
    'second'
  );

  animateToPositionState(
    tl,
    slots[SLOT.BUFFER],
    'third',
    'third'
  );
}

// move slider one position backward
function prev() {
  if (isAnimating) return;

  startAnimation();

  setSlotContent(
    slots[SLOT.FAR_BUFFER],
    getPrevBufferIndex()
  );

  applyPosition(
    slots[SLOT.FAR_BUFFER],
    positions.leftHidden
  );

  applyState(
    slots[SLOT.FAR_BUFFER],
    'leftHidden'
  );

  show(slots[SLOT.FAR_BUFFER]);

  const tl = gsap.timeline({
    defaults: {
      duration: ANIMATION_DURATION,
      ease: 'power3.inOut',
    },

    onComplete() {
      currentIndex--;

      rotatePrev();

      setSlotContent(
        slots[SLOT.FAR_BUFFER],
        getPrevBufferIndex()
      );

      syncSlotsToPositions();
      hideBuffers();
      syncSlotStates();
      finishAnimation();
    }
  });

  crossfadeDescription(tl, currentIndex, currentIndex - 1);

  animateToPositionState(
    tl,
    slots[SLOT.FAR_BUFFER],
    'first',
    'first'
  );

  animateToPositionState(
    tl,
    slots[SLOT.FIRST],
    'second',
    'second'
  );

  animateToPositionState(
    tl,
    slots[SLOT.SECOND],
    'third',
    'third'
  );

  animateToPositionState(
    tl,
    slots[SLOT.THIRD],
    'rightHidden',
    'rightHidden'
  );
}

// skip directly to the third visible slide
function jumpToThird() {
  if (isAnimating) return;

  startAnimation();

  show(
    slots[SLOT.BUFFER],
    slots[SLOT.FAR_BUFFER]
  );

  const tl = gsap.timeline({
    defaults: {
      duration: ANIMATION_DURATION,
      ease: 'power3.inOut',
    },

    onComplete() {
      currentIndex += 2;

      slots.push(slots.shift());
      slots.push(slots.shift());

      setSlotContent(
        slots[SLOT.BUFFER],
        currentIndex + 3
      );

      setSlotContent(
        slots[SLOT.FAR_BUFFER],
        currentIndex + 4
      );

      syncSlotsToPositions();
      hideBuffers();
      syncSlotStates();
      finishAnimation();
    }
  });

  crossfadeDescription(tl, currentIndex, currentIndex + 2);

  animateToPositionState(
    tl,
    slots[SLOT.FIRST],
    'leftHidden',
    'leftHidden'
  );

  animateToPositionState(
    tl,
    slots[SLOT.SECOND],
    'leftHidden',
    'leftHidden'
  );

  animateToPositionState(
    tl,
    slots[SLOT.THIRD],
    'first',
    'first'
  );

  animateToPositionState(
    tl,
    slots[SLOT.BUFFER],
    'second',
    'second'
  );

  animateToPositionState(
    tl,
    slots[SLOT.FAR_BUFFER],
    'third',
    'third'
  );
}

// =====================================================
// SLIDER SWIPE
// =====================================================

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  if (isAnimating) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaY) > Math.abs(deltaX)) return;

  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

  if (deltaX < 0) {
    next();
  } else {
    prev();
  }
}

function enableSwipe() {
  if (swipeEnabled) return;

  DOM.slider.addEventListener(
    'touchstart',
    handleTouchStart,
    { passive: true }
  );

  DOM.slider.addEventListener(
    'touchend',
    handleTouchEnd,
    { passive: true }
  );

  swipeEnabled = true;
}

function disableSwipe() {
  if (!swipeEnabled) return;

  DOM.slider.removeEventListener(
    'touchstart',
    handleTouchStart
  );

  DOM.slider.removeEventListener(
    'touchend',
    handleTouchEnd
  );

  swipeEnabled = false;
}

function updateSwipeState() {
  if (window.innerWidth <= 575) {
    enableSwipe();
  } else {
    disableSwipe();
  }
}

// =====================================================
// SLIDER RESIZE
// =====================================================

// recalculate slide positions after resize
function handleResize() {
  calculateLayout();
  syncSlotsToPositions();
  syncSlotStates();
  updateSliderTextPosition();
  updateSwipeState();
}

const resizeObserver = new ResizeObserver(() => {
  if (isAnimating) {
    resizePending = true;
    return;
  }

  handleResize();
});

resizeObserver.observe(DOM.sliderWrap);

// =====================================================
// SLIDER EVENTS
// =====================================================

DOM.nextBtn.addEventListener('click', next);
DOM.prevBtn.addEventListener('click', prev);

DOM.slidesWrap.addEventListener('click', e => {
  const slide = e.target.closest('.slide');

  if (!slide || isAnimating) return;

  if (slide === slots[SLOT.SECOND]) {
    next();
  }

  if (slide === slots[SLOT.THIRD]) {
    jumpToThird();
  }
});

DOM.slidesWrap.addEventListener('mouseenter', (e) => {
  const slide = e.target.closest('.slide');
  if (!slide) return;

  isPausedByHover = true;
  stopAutoplay();
}, true);

DOM.slidesWrap.addEventListener('mouseleave', (e) => {
  const slide = e.target.closest('.slide');
  if (!slide) return;

  isPausedByHover = false;

  if (!isAnimating) {
    queueNextSlide();
  }
}, true);

// =====================================================
// SLIDER INIT
// =====================================================

function initSlider() {
  calculateLayout();
  renderInitial();
  updateSliderTextPosition();
  updateSwipeState();
  queueNextSlide();
}