"use strict";
// aos
AOS.init({
  duration: 1500,
  once: true,
});

// Fancybox
Fancybox.bind("[data-fancybox]", {
  // Your custom options
});


// footer copyright year
let copyrightCurrentyear = document.querySelector(".current-year");
copyrightCurrentyear
  ? (copyrightCurrentyear.innerHTML = new Date().getFullYear())
  : null;

// sticky header
class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector("header");
    this.headerIsAlwaysSticky =
      this.getAttribute("data-sticky-type") === "always" ||
      this.getAttribute("data-sticky-type") === "reduce-logo-size";
    this.headerBounds = {};

    this.setHeaderHeight();

    window
      .matchMedia("(max-width: 990px)")
      .addEventListener("change", this.setHeaderHeight.bind(this));

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add("header-sticky");
    }

    this.currentScrollTop = 0;
    this.preventReveal = false;

    this.onScrollHandler = this.onScroll.bind(this);
    window.addEventListener("scroll", this.onScrollHandler, false);

    this.createObserver();
  }

  setHeaderHeight() {
    document.documentElement.style.setProperty(
      "--header-height",
      `${this.header.offsetHeight}px`
    );
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.onScrollHandler);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add("scrolled-past-header");
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add("scrolled-past-header");
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove("scrolled-past-header");
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add("header-hidden", "header-sticky");
  }

  reveal() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add("header-sticky", "animate");
    this.header.classList.remove("header-hidden");
  }

  reset() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.remove("header-hidden", "header-sticky", "animate");
  }
}

customElements.define("sticky-header", StickyHeader);

// Scroll up button
class ScrollTop extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector(".scroll-to-top");
  }

  connectedCallback() {
    this.onScroll();
    this.button.addEventListener("click", this.onClick.bind(this));
  }

  onScroll() {
    window.addEventListener("scroll", function () {
      const scrollToTopButton = document.querySelector(".scroll-to-top");
      const footer = document.querySelector("footer");

      const scrollThreshold = 200;
      const footerHeight = footer ? footer.offsetHeight : 0;
      const distanceFromFooter = 50;

      const scrollY = window.scrollY || window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Show/Hide logic
      if (scrollY > scrollThreshold) {
        scrollToTopButton.classList.add("show");
      } else {
        scrollToTopButton.classList.remove("show");
      }

      // Stop before footer logic
      if (footer) {
        const footerTop = footer.offsetTop;
        const buttonBottomRelativeToViewport =
          viewportHeight - scrollToTopButton.getBoundingClientRect().bottom;
        const distanceToFooterTop =
          documentHeight - scrollY - viewportHeight - footerHeight;

        if (distanceToFooterTop < distanceFromFooter) {
          scrollToTopButton.style.transform = "scale(0)";
          scrollToTopButton.style.bottom = `${
            footerHeight +
            distanceFromFooter -
            (viewportHeight - buttonBottomRelativeToViewport)
          }px`;
        } else {
          scrollToTopButton.style.transform = "scale(1)";
          scrollToTopButton.style.bottom = "20px";
        }
      }
    });
  }

  onClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

customElements.define("scroll-top", ScrollTop);

// Drawer Opener
class DrawerOpener extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", this.toggle.bind(this));
  }

  toggle() {
    const ref = this.getAttribute("data-drawer");
    document.querySelector(ref).classList.toggle("show");
    document.body.classList.toggle("scroll-lock");
    if (ref != ".modal-search") {
      this.showOverlay(ref);
    }
  }

  showOverlay(ref) {
    const overlaySelector = document.querySelector("#drawer-overlay");
    if (overlaySelector.classList.contains("show")) {
      overlaySelector.classList.remove("show");
      overlaySelector.removeAttribute("data-drawer");
    } else {
      overlaySelector.classList.add("show");
      overlaySelector.setAttribute("data-drawer", ref);
    }
  }
}

customElements.define("drawer-opener", DrawerOpener);

// Mobile Menu
class DrawerMenu extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll(".menu-accrodion");
    this.windowWidth = window.innerWidth;
  }

  connectedCallback() {
    this.action = this.buttons.forEach((button) => {
      button.addEventListener("click", this.toggle.bind(this));
    });

    window.addEventListener("resize", this.action);
  }

  toggle(event) {
    if (this.windowWidth > 991) return;

    let sibling = event.target.nextElementSibling;

    if (sibling) {
      event.preventDefault();
      event.target.classList.toggle("active");

      let hasGrandmenu = sibling.querySelector(".header-grandmenu");

      if (event.target.classList.contains("active")) {
        // expand
        if (hasGrandmenu) {
          sibling.style.maxHeight =
            sibling.scrollHeight + hasGrandmenu.scrollHeight + "px";
        } else {
          sibling.style.maxHeight = sibling.scrollHeight + "px";
        }
      } else {
        // collapse
        sibling.style.maxHeight = null;
      }
    }
  }
}

customElements.define("drawer-menu", DrawerMenu);

// Accordion
class AccordionHorizontal extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll(".accordion-title");
  }

  connectedCallback() {
    const mediaQuery = window.matchMedia("(min-width: 992px)");
    this.buttons.forEach((button) => {
      if (mediaQuery.matches) {
        button
          .closest(".accordion-li")
          .style.setProperty("--width", `${button.offsetWidth}px`);
        button.addEventListener("click", this.toggleWidth.bind(this));
      } else {
        button.addEventListener("click", this.toggleHeight.bind(this));
      }
    });

    this.buttons[0].click();
  }

  toggleWidth(event) {
    this.buttons.forEach((elem) =>
      elem.closest(".accordion-li").classList.remove("active")
    );
    event.target.closest(".accordion-li").classList.add("active");
  }

  toggleHeight(event) {
    this.buttons.forEach((elem) => {
      elem.closest(".accordion-li").classList.remove("active");
      elem.nextElementSibling.style.maxHeight = null;
    });

    event.target.closest(".accordion-li").classList.add("active");
    let sibling = event.target.nextElementSibling;
    sibling.style.maxHeight = sibling.scrollHeight + "px";
  }
}

customElements.define("accordion-horizontal", AccordionHorizontal);

// Counter Up
class CounterUp extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
  }

  connectedCallback() {
    this.initObserver();
  }

  initObserver() {
    if (this.observer) return;

    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startCounters();
            observer.unobserve(this);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this);
  }

  startCounters() {
    const counters = this.querySelectorAll(".counter-item .heading");

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      let current = 0;
      const speed = 100; // bigger = slower
      const increment = target / speed;

      const update = () => {
        current += increment;
        if (current < target) {
          counter.childNodes[0].textContent = Math.ceil(current);
          requestAnimationFrame(update);
        } else {
          counter.childNodes[0].textContent = target;
        }
      };

      update();
    });
  }
}

customElements.define("counter-up", CounterUp);

// FAQ Accordion
class FaqAccordion extends HTMLElement {
  constructor() {
    super();
    this.opener = this.querySelectorAll(".accordion-opener");
  }

  connectedCallback() {
    this.opener.forEach((opener) => {
      opener.addEventListener("click", this.toggleHeight.bind(this));
    });

    this.firstBlock = this.querySelector(".accordion-block");
    if (this.firstBlock) {
      this.firstContent = this.firstBlock.querySelector(".accordion-content");
      this.firstBlock.classList.add("active");
      this.firstContent.style.maxHeight = this.firstContent.scrollHeight + "px";
    }
  }

  toggleHeight(event) {
    this.accBlock = event.target.closest(".accordion-block");
    this.accContent = this.accBlock.querySelector(".accordion-content");

    this.querySelectorAll(".accordion-block").forEach((block) => {
      this.content = block.querySelector(".accordion-content");

      if (block !== this.accBlock) {
        block.classList.remove("active");
        this.content.style.maxHeight = null;
      }
    });

    this.accBlock.classList.toggle("active");

    if (this.accBlock.classList.contains("active")) {
      this.accContent.style.maxHeight = this.accContent.scrollHeight + "px";
    } else {
      this.accContent.style.maxHeight = null;
    }
  }
}

customElements.define("faq-accordion", FaqAccordion);

// Click Dropdown
class NewDropdown extends HTMLElement {
  constructor() {
    super();
    this.wraps = this.querySelectorAll(".dropdown-wrap");
  }

  connectedCallback() {
    this.wraps.forEach((wrap) => {
      const button = wrap.querySelector(".dropdown-button");
      const menu = wrap.querySelector(".dropdown-list-wrap");
      const closeBtn = wrap.querySelector(".dropdown-list > li > .close-btn");

      button.addEventListener("click", (e) => {
        e.stopPropagation();
        wrap.classList.toggle("active");
        menu.style.maxHeight = wrap.classList.contains("active")
          ? menu.scrollHeight + "px"
          : null;
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          wrap.classList.remove("active");
          menu.style.maxHeight = wrap.classList.contains("active")
            ? menu.scrollHeight + "px"
            : null;
        });
      }
    });
  }
}

customElements.define("new-dropdown", NewDropdown);

// Video Modal
class ModalVideo extends HTMLElement {
  constructor() {
    super();
    this.playBtn = this.querySelector(".open-video");
    this.modal = this.querySelector(".video-modal");
    this.videoFrame = this.querySelector(".video-frame");
    this.closeBtn = this.querySelector(".close");
  }

  connectedCallback() {
    // Open modal
    this.playBtn.addEventListener("click", () => this.open());

    // Close modal
    this.closeBtn.addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    this.modal.classList.add("active");
    this.videoFrame.play();
  }

  close() {
    this.modal.classList.remove("active");
    this.videoFrame.pause();
    this.videoFrame.currentTime = 0;
  }
}

customElements.define("modal-video", ModalVideo);

// Testimonial Slider
class TestimonialSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
    });
  }
}

customElements.define("testimonial-slider", TestimonialSlider);

// Featured Tab
class NewTab extends HTMLElement {
  constructor() {
    super();
    this.buttons = [];
    this.contents = [];
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll(".tab-btn");
    this.contents = this.querySelectorAll(".tab-item");

    this.buttons.forEach((btn) => {
      btn.addEventListener("click", this.init.bind(this));
    });

    if (!this.querySelector(".tab-btn.active") && this.buttons.length > 0) {
      this.buttons[0].classList.add("active");
      const target = this.buttons[0].getAttribute("data-tab");
      this.querySelectorAll(`.${target}`).forEach((item) => {
        item.classList.add("active");
      });
    }
  }

  init(event) {
    const button = event.currentTarget;
    const target = button.getAttribute("data-tab");

    this.buttons.forEach((item) => item.classList.remove("active"));

    button.classList.add("active");

    this.contents.forEach((item) => item.classList.remove("active"));

    this.querySelectorAll(`.${target}`).forEach((item) => {
      item.classList.add("active");
    });
  }
}

customElements.define("new-tab", NewTab);

// Destination Slider
class DestinationSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1.6,
          spaceBetween: 0,
        },
        425: {
          slidesPerView: 2,
          spaceBetween: 0,
        },
        601: {
          slidesPerView: 3,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
        992: {
          slidesPerView: 4.4,
          spaceBetween: 30,
        },
        1200: {
          slidesPerView: 5,
          spaceBetween: 30,
        },
        1440: {
          slidesPerView: 6,
          spaceBetween: 30,
        },
      },
    });
  }
}

customElements.define("destination-slider", DestinationSlider);

// Vlog Slider
class PackageSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        601: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    });
  }
}

customElements.define("package-slider", PackageSlider);

// Promotion Slider
class PromotionSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        601: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    });
  }
}

customElements.define("promotion-slider", PromotionSlider);

// Toogle Button
class ToggleBtn extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelector(".toogle-btn");

    if (this.button) {
      this.button.addEventListener("click", () => {
        this.button.classList.toggle("active");
      });
    }
  }
}

customElements.define("toggle-btn", ToggleBtn);

// New Testimonial
class NewTestimonial extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 24,
        },
        601: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });
  }
}

customElements.define("new-testimonial", NewTestimonial);

// Calender
class DatePicker extends HTMLElement {
  constructor() {
    super();
    this.currentDate = new Date();
    this.selectedDate = null;
  }

  connectedCallback() {
    this.dateInput = this.querySelector("[data-input]");
    this.calendar =
      this.querySelector("[data-calendar]") ||
      this.querySelector(".dropdown-list-wrap");
    this.daysContainer = this.querySelector("[data-days]");
    this.monthYear = this.querySelector("[data-monthyear]");
    this.prevBtn = this.querySelector("[data-prev]");
    this.nextBtn = this.querySelector("[data-next]");

    this.renderCalendar();

    this.prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    this.nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });
  }

  renderCalendar() {
    if (!this.daysContainer) return;
    this.daysContainer.innerHTML = "";

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      const el = document.createElement("div");
      el.classList.add("weekday");
      el.textContent = day;
      this.daysContainer.appendChild(el);
    });

    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    );

    this.monthYear.textContent = `${this.currentDate.toLocaleString("default", {
      month: "long",
    })} ${this.currentDate.getFullYear()}`;

    for (let i = 0; i < firstDay.getDay(); i++) {
      const empty = document.createElement("div");
      empty.classList.add("empty");
      this.daysContainer.appendChild(empty);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      this.createDayElement(day);
    }
  }

  createDayElement(day) {
    const date = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      day
    );
    const dayEl = document.createElement("div");
    dayEl.classList.add("day");

    if (date.toDateString() === new Date().toDateString())
      dayEl.classList.add("current");
    if (
      this.selectedDate &&
      date.toDateString() === this.selectedDate.toDateString()
    )
      dayEl.classList.add("selected");

    dayEl.textContent = day;

    dayEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selectedDate = date;
      this.dateInput.value = this.formatDate(date);
      this.renderCalendar();
    });

    this.daysContainer.appendChild(dayEl);
  }

  formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  }
}

customElements.define("date-picker", DatePicker);

// Increment , Decrement and Content Picker
class ContentPicker extends HTMLElement {
  constructor() {
    super();
    this.menu = null;
    this.label = null;
    this.input = null;
    this.icon = null;
  }

  connectedCallback() {
    this.menu = this.querySelector(".dropdown-list-wrap");
    this.label = this.querySelector(".dropdown-btn-text .text");
    this.input = this.querySelector("input");

    this.querySelectorAll(".traveler-number").forEach((numberWrap) => {
      const minus = numberWrap.querySelector(".minus");
      const plus = numberWrap.querySelector(".plus");
      const numberText = numberWrap.querySelector(".number");

      let count = parseInt(numberText.textContent, 10);

      minus?.addEventListener("click", () => {
        if (count > 0) {
          count--;
          numberText.textContent = count;
          this.updateTravelerLabel();
        }
      });

      plus?.addEventListener("click", () => {
        count++;
        numberText.textContent = count;
        this.updateTravelerLabel();
      });
    });

    // Destination list selection
    this.querySelectorAll(".dropdown-list li").forEach((item) => {
      const span = item.querySelector("span.text");
      if (!span) return;

      item.addEventListener("click", () => {
        const value = span.textContent.trim();
        this.updateDestination(value);
      });
    });
  }

  // === Traveler update ===
  updateTravelerLabel() {
    const numbers = this.querySelectorAll(".traveler-number .number");
    if (!numbers.length) return;

    const adults = parseInt(numbers[0].textContent, 10);
    const children = parseInt(numbers[1].textContent, 10);

    let total = adults + children;
    let text = "Choose Traveler";

    if (total > 0) {
      text = `${total} Traveler${total > 1 ? "s" : ""}`;
    }

    if (this.label) this.label.textContent = text;
    if (this.input) this.input.value = text;

    this.dispatchEvent(
      new CustomEvent("travelerChange", {
        detail: { adults, children, total },
        bubbles: true,
      })
    );
  }

  // === Destination update ===
  updateDestination(value) {
    if (this.input) this.input.value = value;
    if (this.label) this.label.textContent = value;

    this.dispatchEvent(
      new CustomEvent("destinationChange", {
        detail: { destination: value },
        bubbles: true,
      })
    );
  }
}

customElements.define("content-picker", ContentPicker);

// Sort Tab
class SortTab extends HTMLElement {
  constructor() {
    super();
    this.buttons = [];
    this.contents = [];
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll(".tab-button");
    this.contents = this.querySelectorAll(".tab-block");

    this.buttons.forEach((btn) => {
      btn.addEventListener("click", this.init.bind(this));
    });

    if (!this.querySelector(".tab-btn.show") && this.buttons.length > 0) {
      this.buttons[0].classList.add("show");
      const target = this.buttons[0].getAttribute("data-tab");
      this.querySelectorAll(`.${target}`).forEach((item) => {
        item.classList.add("show");
      });
    }
  }

  init(event) {
    const button = event.currentTarget;
    this.querySelector(".sort-tab > form > input").value =
      event.target.dataset.tab;
    const target = button.getAttribute("data-tab");

    this.buttons.forEach((item) => item.classList.remove("show"));

    button.classList.add("show");

    this.contents.forEach((item) => item.classList.remove("show"));

    this.querySelectorAll(`.${target}`).forEach((item) => {
      item.classList.add("show");
    });
  }
}

customElements.define("sort-tab", SortTab);

// Range Slider
class RangeSlider extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector(".label-range");
    this.fill = this.querySelector(".price-track-fill");
    this.minThumb = this.querySelector(".min-thumb");
    this.maxThumb = this.querySelector(".max-thumb");
    this.minLabel = this.querySelector(".price-min");
    this.maxLabel = this.querySelector(".price-max");
    this.minInput = this.querySelectorAll('input[type="range"]')[0];
    this.maxInput = this.querySelectorAll('input[type="range"]')[1];

    this.minValue = 0;
    this.maxValue = 0;
    this.minLimit = 0;
    this.maxLimit = 0;
    this.step = 1;
  }

  connectedCallback() {
    this.readLimits();
    this.updateTrack();
    this.dragThumb(this.minThumb, "min");
    this.dragThumb(this.maxThumb, "max");
  }

  readLimits() {
    this.minLimit = parseInt(this.minLabel.getAttribute("data-min")) || 0;
    this.maxLimit = parseInt(this.maxLabel.getAttribute("data-max")) || 1000;

    this.minValue = this.minLimit;
    this.maxValue = this.maxLimit;

    this.minLabel.textContent = this.minValue;
    this.maxLabel.textContent = this.maxValue;
  }

  dragThumb(thumb, type) {
    const move = (clientX) => {
      const rect = this.slider.getBoundingClientRect();
      const percent = Math.min(
        Math.max(0, (clientX - rect.left) / rect.width),
        1
      );
      let value =
        Math.round(
          this.minLimit +
            (percent * (this.maxLimit - this.minLimit)) / this.step
        ) * this.step;

      if (type === "min") value = Math.min(value, this.maxValue - this.step);
      if (type === "max") value = Math.max(value, this.minValue + this.step);

      if (type === "min") this.minValue = value;
      else this.maxValue = value;

      this.updateTrack();
    };

    const onMouseMove = (e) => move(e.clientX);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    thumb.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    thumb.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const onTouchMove = (ev) => move(ev.touches[0].clientX);
      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    });
  }

  updateTrack() {
    const percentMin =
      ((this.minValue - this.minLimit) / (this.maxLimit - this.minLimit)) * 100;
    const percentMax =
      ((this.maxValue - this.minLimit) / (this.maxLimit - this.minLimit)) * 100;

    this.minThumb.style.left = `calc(${percentMin}% - 12px)`;
    this.maxThumb.style.left = `calc(${percentMax}% - 12px)`;

    this.fill.style.left = `${percentMin}%`;
    this.fill.style.width = `${percentMax - percentMin}%`;

    this.minLabel.textContent = this.minValue;
    this.maxLabel.textContent = this.maxValue;

    this.minInput.value = this.minValue;
    this.maxInput.value = this.maxValue;
  }
}

customElements.define("range-slider", RangeSlider);

// Insta Slider
class InstaSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      breakpoints: {
        0: {
          slidesPerView: 2,
          spaceBetween: 0,
        },
        425: {
          slidesPerView: 3,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 0,
        },
        992: {
          slidesPerView: 5,
          spaceBetween: 0,
        },
        1200: {
          slidesPerView: 7,
          spaceBetween: 0,
        },
      },
    });
  }
}

customElements.define("insta-slider", InstaSlider);

// Show More
class ShowMore extends HTMLElement {
  constructor() {
    super();

    this.list = this.querySelectorAll(".dropdown-list li:not(.button-see-more)");
    this.toggleBtn = this.querySelector(".button-see-more");
    this.visibleContent = 5;   // first 5 items visible
    this.expanded = false;
  }

  connectedCallback() {
    this.updateList = () => {
      this.list.forEach((li, index) => {
        if (index < this.visibleContent) {
          li.style.display = "block";
        } else {
          li.style.display = this.expanded ? "block" : "none";
        }
      });

      this.toggleBtn.textContent = this.expanded ? "Show Less" : "Show More";
    };

    // initial state
    this.updateList();

    // toggle on click
    this.toggleBtn.addEventListener("click", () => {
      this.expanded = !this.expanded;
      this.updateList();
    });
  }
}

customElements.define("show-more", ShowMore);

// Hero Slider
class HeroSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      effect: "fade",
      loop: true,
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 3000,
      },
    });
  }
}

customElements.define("hero-slider", HeroSlider);

// Promotion Slider
class NewDestination extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1.5,
          spaceBetween: 16,
        },
        575: {
          slidesPerView: 2.5,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      },
    });
  }
}

customElements.define("new-destination", NewDestination);

// New Instagram Slider
class NewInstagram extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: false,
      coverflowEffect: {
        rotate: 20,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 3,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });
  }
}

customElements.define("new-instagram", NewInstagram);

// Countdown 
class CountDown extends HTMLElement {
  constructor() {
    super();

    this.countdown = this.querySelector(".countdown");
    this.days = this.querySelector(".days");
    this.hours = this.querySelector(".hours");
    this.minutes = this.querySelector(".minutes");
    this.seconds = this.querySelector(".seconds");
    this.targetDate = new Date(this.countdown.dataset.target).getTime();
    this.message = this.querySelector(".message");
    this.countItem = this.querySelectorAll(".count-item");

    this.init();
  }

  init() {
    this.countDown = setInterval(() => this.update(), 1000);
    this.update();
  }

  update() {
    const now = Date.now();
    const distance = this.targetDate - now;

    if (distance <= 0) {
      clearInterval(this.countDown);
      this.countItem.forEach(item => {
        item.style.display = 'none';
      })
      this.message.innerText = "Offer No Longer Available";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / (1000));

    this.days.innerText = days;
    this.hours.innerText = hours;
    this.minutes.innerText = minutes;
    this.seconds.innerText = seconds;
  }

}

customElements.define("count-down",  CountDown)


// featured Slider
class FeaturedSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        425: {
          slidesPerView: 1.3,
          spaceBetween: 24,
        },
        601: {
          slidesPerView: 1.8,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 2.3,
          spaceBetween: 30,
        },
        992: {
          slidesPerView: 2.7,
          spaceBetween: 30,
        },
        1199: {
          slidesPerView: 3,
          spaceBetween: 30,
        }
      },
    });
  }
}

customElements.define("featured-slider", FeaturedSlider);

// Promotion Slider
class TestiSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.navPrev = this.querySelector(".swiper-button-prev");
    this.navNext = this.querySelector(".swiper-button-next");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.navNext,
        prevEl: this.navPrev,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        }
      },
    });
  }
}

customElements.define("testi-slider", TestiSlider);