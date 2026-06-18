(function () {
    var menuButton = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
            showSlide(index);
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards(value) {
        var keyword = normalize(value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));

            card.classList.toggle('hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
        });
    }

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (query) {
            filterInput.value = query;
            filterCards(query);
        }

        filterInput.addEventListener('input', function () {
            filterCards(filterInput.value);
        });
    }

    var video = document.querySelector('[data-video-url]');
    var playButton = document.querySelector('[data-play-button]');
    var shell = document.querySelector('.video-shell');
    var hlsInstance = null;

    function attachVideo() {
        if (!video) {
            return;
        }

        var url = video.getAttribute('data-video-url');

        if (!url || video.getAttribute('data-ready') === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
        }

        video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
        attachVideo();

        if (shell) {
            shell.classList.add('playing');
        }

        if (video) {
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (shell) {
                        shell.classList.remove('playing');
                    }
                });
            }
        }
    }

    if (playButton && video) {
        playButton.addEventListener('click', playVideo);
        video.addEventListener('click', attachVideo);
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('playing');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
})();
