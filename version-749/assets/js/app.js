(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  searchInputs.forEach(function (input) {
    var scope = input.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.classList.toggle('hidden', value !== '' && text.indexOf(value) === -1);
      });
    });
  });
})();

function initMoviePlayer(source) {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-toggle]');
  var errorBox = document.querySelector('[data-player-error]');

  if (!shell || !video || !source) {
    return;
  }

  var hls = null;
  var attached = false;

  function showError(message) {
    shell.classList.remove('is-loading');
    shell.classList.add('has-error');

    if (errorBox) {
      errorBox.textContent = message;
    }
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        showError('播放失败，请稍后重试');
      });
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  function startPlayback() {
    shell.classList.remove('has-error');
    shell.classList.add('is-loading');
    attachSource();

    var playResult = video.play();

    if (playResult && typeof playResult.then === 'function') {
      playResult.then(function () {
        shell.classList.remove('is-loading');
        shell.classList.add('is-playing');
      }).catch(function () {
        shell.classList.remove('is-loading');
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.remove('is-loading');
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  video.addEventListener('loadeddata', function () {
    shell.classList.remove('is-loading');
  });

  video.addEventListener('error', function () {
    showError('播放失败，请稍后重试');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
