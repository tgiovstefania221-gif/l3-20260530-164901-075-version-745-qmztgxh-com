(function () {
    var header = document.querySelector("[data-site-header]");
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var search = scope.querySelector("[data-filter-search]");
        var type = scope.querySelector("[data-filter-type]");
        var region = scope.querySelector("[data-filter-region]");
        var year = scope.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = scope.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
        }

        function apply() {
            var query = normalize(search && search.value);
            var typeValue = normalize(type && type.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var match = true;

                if (query && text.indexOf(query) === -1) {
                    match = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    match = false;
                }
                if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
                    match = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    match = false;
                }

                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [search, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-player-video");
    var button = document.getElementById("movie-play-button");
    var ready = false;
    var hls = null;

    if (!video || !button || !source) {
        return;
    }

    function attach() {
        if (!ready) {
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        button.classList.add("is-hidden");
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    button.addEventListener("click", attach);
    video.addEventListener("click", function () {
        if (video.paused) {
            attach();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
