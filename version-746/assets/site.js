(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function toggleMenu() {
        var button = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function localFilter() {
        var input = document.querySelector("[data-page-filter]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        input.addEventListener("input", function () {
            var q = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent).toLowerCase();
                card.classList.toggle("is-filtered-out", q && text.indexOf(q) === -1);
            });
        });
    }

    function globalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
        if (!forms.length || !window.SEARCH_INDEX) {
            return;
        }
        forms.forEach(function (form) {
            var input = form.querySelector("input[type='search']");
            var box = form.querySelector("[data-global-results]");
            if (!input || !box) {
                return;
            }
            var render = function () {
                var q = input.value.trim().toLowerCase();
                if (!q) {
                    box.classList.remove("open");
                    box.innerHTML = "";
                    return;
                }
                var results = window.SEARCH_INDEX.filter(function (item) {
                    return item.keywords.indexOf(q) !== -1;
                }).slice(0, 10);
                if (!results.length) {
                    box.classList.add("open");
                    box.innerHTML = "<a><strong>未找到匹配内容</strong><span>换个关键词试试</span></a>";
                    return;
                }
                box.classList.add("open");
                box.innerHTML = results.map(function (item) {
                    return "<a href='" + item.href + "'><strong>" + item.title + "</strong><span>" + item.meta + "</span></a>";
                }).join("");
            };
            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            form.addEventListener("submit", function (event) {
                var q = input.value.trim().toLowerCase();
                if (!q) {
                    event.preventDefault();
                    return;
                }
                var hit = window.SEARCH_INDEX.find(function (item) {
                    return item.keywords.indexOf(q) !== -1;
                });
                if (hit) {
                    event.preventDefault();
                    window.location.href = hit.href;
                }
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    box.classList.remove("open");
                }
            });
        });
    }

    function attachPlayer() {
        var box = document.querySelector(".player-box");
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var overlay = box.querySelector(".play-overlay");
        var stream = box.getAttribute("data-stream");
        var hls = null;
        var started = false;
        var message = document.createElement("div");
        message.className = "player-message";
        message.textContent = "播放暂时无法打开";
        box.appendChild(message);

        function showMessage() {
            message.classList.add("open");
        }

        function start() {
            if (!video || !stream) {
                showMessage();
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (started) {
                video.play().catch(showMessage);
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.play().catch(showMessage);
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(showMessage);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage();
                    }
                });
                return;
            }
            video.src = stream;
            video.play().catch(showMessage);
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        toggleMenu();
        localFilter();
        globalSearch();
        attachPlayer();
    });
})();
