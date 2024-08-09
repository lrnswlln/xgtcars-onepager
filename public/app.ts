type EventHandler = (event: Event) => void;

const helper = {
    getDelta(event: WheelEvent): number {
        if (event.deltaY) {
            return -event.deltaY;
        } else {
            // Fallback für ältere Browser
            return -event.detail;
        }
    },

    throttle(method: Function, delay: number, context: any): EventHandler {
        let inThrottle = false;
        return function(...args: any[]) {
            if (!inThrottle) {
                inThrottle = true;
                method.apply(context, args);
                setTimeout(() => {
                    inThrottle = false;
                }, delay);
            }
        };
    },

    debounce(method: Function, delay: number, context: any): EventHandler {
        let timeout: number | null = null;
        return function(...args: any[]) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = window.setTimeout(() => {
                method.apply(context, args);
            }, delay);
        };
    }
};

class ScrollPages {
    private currentPageNumber: number;
    private totalPageNumber: number;
    private pages: HTMLElement;
    private viewHeight: number;
    private navDots: HTMLElement[] = [];
    private startY: number = 0;
    private isScrolling: boolean = false;  // Neue Variable hinzufügen

    constructor(currentPageNumber: number, totalPageNumber: number, pages: HTMLElement) {
        this.currentPageNumber = currentPageNumber;
        this.totalPageNumber = totalPageNumber;
        this.pages = pages;
        this.viewHeight = document.documentElement.clientHeight;
    }

    private mouseScroll(event: WheelEvent): void {
        if (this.isScrolling) return;  // Verhindern, dass Scrollen während eines Scrollvorgangs ausgeführt wird

        const delta = helper.getDelta(event);
        if (delta < 0) {
            this.scrollDown();
        } else {
            this.scrollUp();
        }
    }

    private scrollDown(): void {
        if (this.currentPageNumber < this.totalPageNumber) {
            this.isScrolling = true;  // Scrollvorgang starten
            this.pages.style.top = `-${this.viewHeight * this.currentPageNumber}px`;
            this.currentPageNumber++;
            this.updateNav();
            this.textFadeInOut();
            setTimeout(() => { this.isScrolling = false; }, 1200);  // Scrollvorgang nach 1200ms beenden
        }
    }

    private scrollUp(): void {
        if (this.currentPageNumber > 1) {
            this.isScrolling = true;  // Scrollvorgang starten
            this.pages.style.top = `-${this.viewHeight * (this.currentPageNumber - 2)}px`;
            this.currentPageNumber--;
            this.updateNav();
            this.textFadeInOut();
            setTimeout(() => { this.isScrolling = false; }, 1200);  // Scrollvorgang nach 1200ms beenden
        }
    }

    private scrollTo(targetPageNumber: number): void {
        while (this.currentPageNumber !== targetPageNumber) {
            if (this.currentPageNumber > targetPageNumber) {
                this.scrollUp();
            } else {
                this.scrollDown();
            }
        }
    }

    public scrollToFirstPage(): void {
        this.scrollTo(1);
    }

    private createNav(): void {
        const pageNav = document.createElement('div');
        pageNav.className = 'nav-dot-container';
        this.pages.appendChild(pageNav);

        for (let i = 0; i < this.totalPageNumber; i++) {
            pageNav.innerHTML += '<p class="nav-dot"><span></span></p>';
        }

        const navDots = this.pages.getElementsByClassName('nav-dot');
        this.navDots = Array.prototype.slice.call(navDots) as HTMLElement[];
        this.navDots[0].classList.add('dot-active');

        this.navDots.forEach((e, index) => {
            e.addEventListener('click', () => {
                this.scrollTo(index + 1);
                this.navDots.forEach(dot => dot.classList.remove('dot-active'));
                e.classList.add('dot-active');
            });
        });
    }

    private updateNav(): void {
        this.navDots.forEach(e => e.classList.remove('dot-active'));
        this.navDots[this.currentPageNumber - 1].classList.add('dot-active');
    }

    private resize(): void {
        this.viewHeight = document.documentElement.clientHeight;
        this.pages.style.height = `${this.viewHeight}px`;
        this.pages.style.top = `-${this.viewHeight * (this.currentPageNumber - 1)}px`;
    }

    private textFadeInOut(): void {
        const containersDom = this.pages.getElementsByClassName('text-container');
        const textContainers = Array.prototype.slice.call(containersDom) as HTMLElement[];

        textContainers.forEach(e => e.classList.remove('in-sight'));

        const textContainerInSight = textContainers[this.currentPageNumber - 1];
        if (textContainerInSight) {
            textContainerInSight.classList.add('in-sight');
        }
    }

    public init(): void {
        const handleMouseWheel = helper.throttle(this.mouseScroll.bind(this), 500, this);
        const handleResize = helper.debounce(this.resize.bind(this), 500, this);

        this.pages.style.height = `${this.viewHeight}px`;
        this.createNav();
        this.textFadeInOut();

        if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
            this.pages.addEventListener('wheel', handleMouseWheel);
        } else {
            this.pages.addEventListener('DOMMouseScroll', handleMouseWheel);
        }

        this.pages.addEventListener('touchstart', (event: TouchEvent) => {
            this.startY = event.touches[0].pageY;
        });

        this.pages.addEventListener('touchend', (event: TouchEvent) => {
            const endY = event.changedTouches[0].pageY;
            if (this.startY - endY < 0) {
                this.scrollUp();
            }
            if (this.startY - endY > 0) {
                this.scrollDown();
            }
        });

        this.pages.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();
        });

        window.addEventListener('resize', handleResize);

        // Hier werden beide Buttons initialisiert
        const scrollButton = document.getElementById('scroll-button') as HTMLButtonElement;
        if (scrollButton) {
            scrollButton.addEventListener('click', () => this.scrollDown());
        }

        const scrollButton1 = document.getElementById('scroll-button-1') as HTMLButtonElement;
        if (scrollButton1) {
            scrollButton1.addEventListener('click', () => this.scrollDown());
        }
    }}


document.addEventListener('DOMContentLoaded', () => {
    const element1 = document.getElementById('all-pages') as HTMLElement;
    const element2 = document.getElementById('all-pages-1') as HTMLElement;

    if (element1) {
        const s1 = new ScrollPages(1, 5, element1);
        s1.init();

        const clickableElement1 = document.getElementById('scroll-to-first-1') as HTMLElement;
        if (clickableElement1) {
            clickableElement1.onclick = () => s1.scrollToFirstPage();
        }
    }

    if (element2) {
        const s2 = new ScrollPages(1, 5, element2);
        s2.init();

        const clickableElement2 = document.getElementById('scroll-to-first-2') as HTMLElement;
        if (clickableElement2) {
            clickableElement2.onclick = () => s2.scrollToFirstPage();
        }
    }
});
function scrollToAnchor(anchorId: string): void {
    const element = document.getElementById(anchorId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.error(`Element with ID "${anchorId}" not found.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Bereich für GT3 Touring
    const colorBoxesTouring = document.querySelectorAll<HTMLDivElement>('#all-pages .color-box');
    const carImageTouring = document.querySelector('#all-pages #car-image') as HTMLImageElement;

    colorBoxesTouring.forEach(box => {
        box.addEventListener('click', () => {
            // Entferne die 'selected'-Klasse von allen Farbboxen
            colorBoxesTouring.forEach(b => b.classList.remove('selected'));

            // Füge die 'selected'-Klasse zur angeklickten Farbbox hinzu
            box.classList.add('selected');

            const color = box.getAttribute('data-color');
            if (color) {
                const newImageSrc = `assets/media/img/product/touring/sport_car_${color}.jpg`;

                // Bildquelle für das Touring Bild ändern
                carImageTouring.classList.remove('show');

                setTimeout(() => {
                    carImageTouring.src = newImageSrc;
                    carImageTouring.classList.add('show');
                }, 500);
            }
        });
    });

    // Bereich für GT3 Track
    const colorBoxesTrack = document.querySelectorAll<HTMLDivElement>('#all-pages-1 .color-box');
    const carImageTrack = document.querySelector('#all-pages-1 #car-image-1') as HTMLImageElement;

    colorBoxesTrack.forEach(box => {
        box.addEventListener('click', () => {
            colorBoxesTrack.forEach(b => b.classList.remove('selected'));

            box.classList.add('selected');

            const color = box.getAttribute('data-color');
            if (color) {
                const newImageSrc1 = `assets/media/img/product/racecar/car_rs_${color}.jpg`;
                carImageTrack.classList.remove('show');
                setTimeout(() => {
                    carImageTrack.src = newImageSrc1;
                    carImageTrack.classList.add('show');
                }, 500);
            }
        });
    });
});
