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

// footer copyright year
let copyrightCurrentyear = document.querySelector(".current-year");
copyrightCurrentyear
  ? (copyrightCurrentyear.innerHTML = new Date().getFullYear())
  : null;

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