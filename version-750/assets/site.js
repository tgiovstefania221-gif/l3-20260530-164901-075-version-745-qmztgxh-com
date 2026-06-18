(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-control.prev');
    var next = hero.querySelector('.hero-control.next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterForm && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.filter-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var qInput = filterForm.querySelector('input[name="q"]');
    var yearSelect = filterForm.querySelector('select[name="year"]');
    var regionSelect = filterForm.querySelector('select[name="region"]');
    var typeSelect = filterForm.querySelector('select[name="type"]');

    function uniqueValues(name) {
      var values = cards.map(function (card) {
        return card.getAttribute('data-' + name) || '';
      }).filter(Boolean);
      return Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(yearSelect, uniqueValues('year'));
    fillSelect(regionSelect, uniqueValues('region'));
    fillSelect(typeSelect, uniqueValues('type'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
      var query = normalize(qInput ? qInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    filterForm.addEventListener('input', runFilter);
    filterForm.addEventListener('change', runFilter);
    runFilter();
  }
})();

function initializeMoviePlayer(streamUrl) {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var cover = player.querySelector('.player-cover');
  var hls = null;
  var prepared = false;

  function prepareVideo() {
    if (prepared || !video) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function playVideo() {
    prepareVideo();
    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
