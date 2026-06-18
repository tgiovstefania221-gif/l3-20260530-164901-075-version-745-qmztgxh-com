(function () {
  function getSearchParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      window.clearInterval(timer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var query = getSearchParam("q").trim();
    var input = document.getElementById("search-input");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var movies = window.SEARCH_MOVIES.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
    });
    if (title) {
      title.textContent = query ? "搜索：" + query + "（" + movies.length + "）" : "全部影片（" + movies.length + "）";
    }
    results.innerHTML = movies.slice(0, 240).map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-gradient"></span>',
        '<span class="poster-play">▶</span>',
        '<span class="poster-year">' + movie.year + '</span>',
        '<span class="poster-region">' + escapeHtml(movie.region) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
    if (!movies.length) {
      results.innerHTML = '<p class="empty-result">没有找到匹配影片。</p>';
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearchPage();
  });
})();
