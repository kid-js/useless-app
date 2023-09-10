class NotificationManager {
    constructor() {
        if (new.target === NotificationManager) {
            throw new TypeError('Instance of this class cannot be created');
        }
    }

    static create(type = '', noticesList = []) {
        this.container = document.querySelector('.notifications-container');

        this.notifications = {
            error: ErrorNotification,
        };

        if (!this.container) {
            this.insertContainer();
        }

        noticesList.forEach(notice => {
            new this.notifications[type](this.container, notice);
        });
    }

    static insertContainer() {
        this.container = document.createElement('div');
        this.container.classList.add('notifications-container');

        document.body.append(this.container);
    }
}

class ErrorNotification {
    constructor(root, message = '') {
        this.root = root || document.body;
        this.message = message;
        this.delay = 3155;

        this.init();
    }

    get template() {
        return `
            <div
                class="notice error-notice"
                style="--delay:${this.delay}ms"
                data-el="notice"
            >
                <div class="notice-timer"></div>
                <div class="notice-body">
                    <p class="notice-text">
                        ${this.message}
                    </p>
                </div>
            </div>
        `;
    }

    init() {
        this.root.insertAdjacentHTML('beforeend', this.template);
        this.notice = document.querySelector('[data-el="notice"]:last-child');

        // Delay to support notification CSS animation
        setTimeout(() => {
            this.notice.remove();

            for (const key in this) {
                this[key] = null;
            }
        }, this.delay);
    }
}

export { NotificationManager };