var helper = {
    getDelta: function (event) {
        if (event.deltaY) {
            return -event.deltaY;
        }
        else {
            // Fallback für ältere Browser
            return -event.detail;
        }
    },
    throttle: function (method, delay, context) {
        var inThrottle = false;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!inThrottle) {
                inThrottle = true;
                method.apply(context, args);
                setTimeout(function () {
                    inThrottle = false;
                }, delay);
            }
        };
    },
    debounce: function (method, delay, context) {
        var timeout = null;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = window.setTimeout(function () {
                method.apply(context, args);
            }, delay);
        };
    }
};
var ScrollPages = /** @class */ (function () {
    function ScrollPages(currentPageNumber, totalPageNumber, pages) {
        this.navDots = [];
        this.startY = 0;
        this.isScrolling = false; // Neue Variable hinzufügen
        this.currentPageNumber = currentPageNumber;
        this.totalPageNumber = totalPageNumber;
        this.pages = pages;
        this.viewHeight = document.documentElement.clientHeight;
    }
    ScrollPages.prototype.mouseScroll = function (event) {
        if (this.isScrolling)
            return; // Verhindern, dass Scrollen während eines Scrollvorgangs ausgeführt wird
        var delta = helper.getDelta(event);
        if (delta < 0) {
            this.scrollDown();
        }
        else {
            this.scrollUp();
        }
    };
    ScrollPages.prototype.scrollDown = function () {
        var _this = this;
        if (this.currentPageNumber < this.totalPageNumber) {
            this.isScrolling = true; // Scrollvorgang starten
            this.pages.style.top = "-".concat(this.viewHeight * this.currentPageNumber, "px");
            this.currentPageNumber++;
            this.updateNav();
            this.textFadeInOut();
            setTimeout(function () { _this.isScrolling = false; }, 1200); // Scrollvorgang nach 1200ms beenden
        }
    };
    ScrollPages.prototype.scrollUp = function () {
        var _this = this;
        if (this.currentPageNumber > 1) {
            this.isScrolling = true; // Scrollvorgang starten
            this.pages.style.top = "-".concat(this.viewHeight * (this.currentPageNumber - 2), "px");
            this.currentPageNumber--;
            this.updateNav();
            this.textFadeInOut();
            setTimeout(function () { _this.isScrolling = false; }, 1200); // Scrollvorgang nach 1200ms beenden
        }
    };
    ScrollPages.prototype.scrollTo = function (targetPageNumber) {
        while (this.currentPageNumber !== targetPageNumber) {
            if (this.currentPageNumber > targetPageNumber) {
                this.scrollUp();
            }
            else {
                this.scrollDown();
            }
        }
    };
    ScrollPages.prototype.scrollToFirstPage = function () {
        this.scrollTo(1);
    };
    ScrollPages.prototype.createNav = function () {
        var _this = this;
        var pageNav = document.createElement('div');
        pageNav.className = 'nav-dot-container';
        this.pages.appendChild(pageNav);
        for (var i = 0; i < this.totalPageNumber; i++) {
            pageNav.innerHTML += '<p class="nav-dot"><span></span></p>';
        }
        var navDots = this.pages.getElementsByClassName('nav-dot');
        this.navDots = Array.prototype.slice.call(navDots);
        this.navDots[0].classList.add('dot-active');
        this.navDots.forEach(function (e, index) {
            e.addEventListener('click', function () {
                _this.scrollTo(index + 1);
                _this.navDots.forEach(function (dot) { return dot.classList.remove('dot-active'); });
                e.classList.add('dot-active');
            });
        });
    };
    ScrollPages.prototype.updateNav = function () {
        this.navDots.forEach(function (e) { return e.classList.remove('dot-active'); });
        this.navDots[this.currentPageNumber - 1].classList.add('dot-active');
    };
    ScrollPages.prototype.resize = function () {
        this.viewHeight = document.documentElement.clientHeight;
        this.pages.style.height = "".concat(this.viewHeight, "px");
        this.pages.style.top = "-".concat(this.viewHeight * (this.currentPageNumber - 1), "px");
    };
    ScrollPages.prototype.textFadeInOut = function () {
        var containersDom = this.pages.getElementsByClassName('text-container');
        var textContainers = Array.prototype.slice.call(containersDom);
        textContainers.forEach(function (e) { return e.classList.remove('in-sight'); });
        var textContainerInSight = textContainers[this.currentPageNumber - 1];
        if (textContainerInSight) {
            textContainerInSight.classList.add('in-sight');
        }
    };
    ScrollPages.prototype.init = function () {
        var _this = this;
        var handleMouseWheel = helper.throttle(this.mouseScroll.bind(this), 500, this);
        var handleResize = helper.debounce(this.resize.bind(this), 500, this);
        this.pages.style.height = "".concat(this.viewHeight, "px");
        this.createNav();
        this.textFadeInOut();
        if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
            this.pages.addEventListener('wheel', handleMouseWheel);
        }
        else {
            this.pages.addEventListener('DOMMouseScroll', handleMouseWheel);
        }
        this.pages.addEventListener('touchstart', function (event) {
            _this.startY = event.touches[0].pageY;
        });
        this.pages.addEventListener('touchend', function (event) {
            var endY = event.changedTouches[0].pageY;
            if (_this.startY - endY < 0) {
                _this.scrollUp();
            }
            if (_this.startY - endY > 0) {
                _this.scrollDown();
            }
        });
        this.pages.addEventListener('touchmove', function (event) {
            event.preventDefault();
        });
        window.addEventListener('resize', handleResize);
        // Hier werden beide Buttons initialisiert
        var scrollButton = document.getElementById('scroll-button');
        if (scrollButton) {
            scrollButton.addEventListener('click', function () { return _this.scrollDown(); });
        }
        var scrollButton1 = document.getElementById('scroll-button-1');
        if (scrollButton1) {
            scrollButton1.addEventListener('click', function () { return _this.scrollDown(); });
        }
    };
    return ScrollPages;
}());
document.addEventListener('DOMContentLoaded', function () {
    var element1 = document.getElementById('all-pages');
    var element2 = document.getElementById('all-pages-1');
    if (element1) {
        var s1_1 = new ScrollPages(1, 5, element1);
        s1_1.init();
        var clickableElement1 = document.getElementById('scroll-to-first-1');
        if (clickableElement1) {
            clickableElement1.onclick = function () { return s1_1.scrollToFirstPage(); };
        }
    }
    if (element2) {
        var s2_1 = new ScrollPages(1, 5, element2);
        s2_1.init();
        var clickableElement2 = document.getElementById('scroll-to-first-2');
        if (clickableElement2) {
            clickableElement2.onclick = function () { return s2_1.scrollToFirstPage(); };
        }
    }
});
function scrollToAnchor(anchorId) {
    var element = document.getElementById(anchorId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else {
        console.error("Element with ID \"".concat(anchorId, "\" not found."));
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // Bereich für GT3 Touring
    var colorBoxesTouring = document.querySelectorAll('#all-pages .color-box');
    var carImageTouring = document.querySelector('#all-pages #car-image');
    colorBoxesTouring.forEach(function (box) {
        box.addEventListener('click', function () {
            // Entferne die 'selected'-Klasse von allen Farbboxen
            colorBoxesTouring.forEach(function (b) { return b.classList.remove('selected'); });
            // Füge die 'selected'-Klasse zur angeklickten Farbbox hinzu
            box.classList.add('selected');
            var color = box.getAttribute('data-color');
            if (color) {
                var newImageSrc_1 = "assets/media/img/product/touring/sport_car_".concat(color, ".jpg");
                // Bildquelle für das Touring Bild ändern
                carImageTouring.classList.remove('show');
                setTimeout(function () {
                    carImageTouring.src = newImageSrc_1;
                    carImageTouring.classList.add('show');
                }, 500);
            }
        });
    });
    // Bereich für GT3 Track
    var colorBoxesTrack = document.querySelectorAll('#all-pages-1 .color-box');
    var carImageTrack = document.querySelector('#all-pages-1 #car-image-1');
    colorBoxesTrack.forEach(function (box) {
        box.addEventListener('click', function () {
            colorBoxesTrack.forEach(function (b) { return b.classList.remove('selected'); });
            box.classList.add('selected');
            var color = box.getAttribute('data-color');
            if (color) {
                var newImageSrc1_1 = "assets/media/img/product/racecar/car_rs_".concat(color, ".jpg");
                carImageTrack.classList.remove('show');
                setTimeout(function () {
                    carImageTrack.src = newImageSrc1_1;
                    carImageTrack.classList.add('show');
                }, 500);
            }
        });
    });
});
