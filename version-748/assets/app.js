(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function next() {
        show(current + 1);
      }

      function start() {
        stop();
        timer = window.setInterval(next, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      var nextButton = carousel.querySelector('[data-hero-next]');
      var prevButton = carousel.querySelector('[data-hero-prev]');

      if (nextButton) {
        nextButton.addEventListener('click', function () {
          next();
          start();
        });
      }

      if (prevButton) {
        prevButton.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    function initFilterSection(section) {
      var list = section.querySelector('[data-sortable-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var searchInput = section.querySelector('#site-search');
      var regionButtons = Array.prototype.slice.call(section.querySelectorAll('[data-filter-region]'));
      var sortSelect = section.querySelector('#sort-select');
      var emptyState = section.querySelector('.empty-state');

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var activeButton = section.querySelector('[data-filter-region].active');
        var region = activeButton ? activeButton.getAttribute('data-filter-region') : 'all';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardRegion = card.getAttribute('data-region') || '';
          var matchesText = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = region === 'all' || cardRegion === region;
          var showCard = matchesText && matchesRegion;
          card.classList.toggle('is-hidden', !showCard);
          if (showCard) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');
        if (queryParam) {
          searchInput.value = queryParam;
        }
        searchInput.addEventListener('input', applyFilters);
      }

      regionButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          regionButtons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          applyFilters();
        });
      });

      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          var mode = sortSelect.value;
          var sorted = cards.slice().sort(function (a, b) {
            var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
            var by = parseInt(b.getAttribute('data-year'), 10) || 0;
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';
            if (mode === 'year-desc') {
              return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'year-asc') {
              return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'title-asc') {
              return at.localeCompare(bt, 'zh-Hans-CN');
            }
            return 0;
          });
          sorted.forEach(function (card) {
            list.appendChild(card);
          });
          applyFilters();
        });
      }

      if (cards.length) {
        applyFilters();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('.content-section')).forEach(initFilterSection);

    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-cover');
      var url = player.getAttribute('data-stream-url');
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !video || !url) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          player._hls = hls;
          return;
        }
        video.src = url;
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  });
})();
