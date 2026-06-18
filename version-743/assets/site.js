
(function() {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var mobileToggle = qs('[data-mobile-toggle]');
    var mobilePanel = qs('[data-mobile-panel]');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    qsa('.search-form').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            var input = qs('input[name="q"]', form);
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;
        var setSlide = function(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        var start = function() {
            timer = window.setInterval(function() {
                setSlide(current + 1);
            }, 5200);
        };
        var stop = function() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        qsa('[data-hero-next]', hero).forEach(function(button) {
            button.addEventListener('click', function() {
                stop();
                setSlide(current + 1);
            });
        });
        qsa('[data-hero-prev]', hero).forEach(function(button) {
            button.addEventListener('click', function() {
                stop();
                setSlide(current - 1);
            });
        });
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                stop();
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        setSlide(0);
        start();
    }

    qsa('[data-filter-list]').forEach(function(scope) {
        var input = qs('[data-filter-input]', scope);
        var region = qs('[data-filter-region]', scope);
        var year = qs('[data-filter-year]', scope);
        var cards = qsa('[data-card]', scope);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (scope.hasAttribute('data-search-page') && input && q) {
            input.value = q;
        }
        var apply = function() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedRegion = region ? region.value : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function(card) {
                var text = (card.getAttribute('data-keywords') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        };
        [input, region, year].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    });
})();

function initPlayer(src) {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-player-start]');
    if (!video || !src) {
        return;
    }
    var prepared = false;
    var hls = null;
    var prepare = function() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    };
    var start = function() {
        prepare();
        if (button) {
            button.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function() {});
        }
    };
    if (button) {
        button.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
        if (!prepared) {
            start();
        }
    });
    video.addEventListener('play', function() {
        if (button) {
            button.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function() {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
