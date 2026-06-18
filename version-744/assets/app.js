(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("no-scroll", panel.classList.contains("is-open"));
        });
    }

    function initSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero-slider");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        var activeIndex = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(activeIndex - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(activeIndex + 1);
                play();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function initFilters() {
        var bars = document.querySelectorAll(".filter-bar");
        bars.forEach(function (bar) {
            var scope = document.querySelector(bar.getAttribute("data-scope") || "body");
            if (!scope) {
                scope = document;
            }
            var input = bar.querySelector("input[type='search']");
            var region = bar.querySelector("select[data-filter='region']");
            var type = bar.querySelector("select[data-filter='type']");
            var reset = bar.querySelector(".filter-reset");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-keywords")
                    ].join(" ").toLowerCase();
                    var regionMatch = !regionValue || card.getAttribute("data-region") === regionValue;
                    var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    card.hidden = !(regionMatch && typeMatch && queryMatch);
                });
            }

            [input, region, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    window.setupMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-video");
        var cover = document.getElementById("movie-play-layer");
        if (!video || !cover || !sourceUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = sourceUrl;
        }

        function start() {
            attach();
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initFilters();
    });
})();
