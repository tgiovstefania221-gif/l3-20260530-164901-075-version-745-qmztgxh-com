(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var categorySelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));

    filterInputs.forEach(function(input) {
      if (query && !input.value) {
        input.value = query;
      }
    });

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function runFilter() {
      var text = normalize(filterInputs.map(function(input) {
        return input.value;
      }).join(" "));
      var category = normalize(categorySelects.map(function(select) {
        return select.value;
      }).join(" "));
      var year = normalize(yearSelects.map(function(select) {
        return select.value;
      }).join(" "));

      cards.forEach(function(card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchText = !text || search.indexOf(text) !== -1;
        var matchCategory = !category || cardCategory === category;
        var matchYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchText && matchCategory && matchYear));
      });
    }

    filterInputs.forEach(function(input) {
      input.addEventListener("input", runFilter);
    });
    categorySelects.forEach(function(select) {
      select.addEventListener("change", runFilter);
    });
    yearSelects.forEach(function(select) {
      select.addEventListener("change", runFilter);
    });
    if (cards.length) {
      runFilter();
    }
  });
})();
