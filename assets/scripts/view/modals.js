import { removeUnwantedTags } from '../helpers/index.js';

class ModalManager {
    constructor() {
        if (new.target === ModalManager) {
            throw new TypeError('Instance of this class cannot be created');
        }
    }

    static create(type = '', options = {}) {
        this.modals = {
            confirm: ConfirmationModal,
            info: InfoModal,
        };
        this.builderSettings = {
            title: {
                confirm: ModalBuilder.confirmModalTitle,
                info: ModalBuilder.statsModalTitle,
            },
            content: {
                confirm: ModalBuilder.confirmModalBodyHtml,
                info: options.content || ModalBuilder.defaultContent,
            },
            controls: {
                confirm: ModalBuilder.confirmModalControls,
                info: ModalBuilder.infoModalControls,
            }
        };

        new this.modals[type]({
            className: type,
            title: this.builderSettings.title[type],
            content: this.builderSettings.content[type],
            controls: this.builderSettings.controls[type],
            subscriber: options.subscriber,
            callbackName: options.callbackName,
        });
    }
}

class ModalBuilder {
    constructor() {
        if (new.target === ModalBuilder) {
            throw new TypeError('Instance of this class cannot be created');
        }
    }

    static get statsModalTitle() {
        return 'Here is what we have';
    }

    static get confirmModalTitle() {
        return '💔 Delete this element forever?';
    }

    static get confirmModalBodyHtml() {
        return `
            <p class="confirm-modal__text">
                There will be no chance to undo!
            </p>
        `;
    }

    static get confirmModalControls() {
        return `
            <button class="btn confirm-btn" data-el="confirm">Yes</button>
            <button class="btn close-btn" data-el="close">Cancel</button>
        `;
    }

    static get infoModalControls() {
        return `
            <button class="btn close-btn" data-el="close">Close</button>
        `;
    }

    static get defaultContent() {
        return '';
    }
}

class Modal {
    constructor(modalData = {}) {
        Object.assign(this, modalData);

        this.controller = new AbortController();
        this.options = {
            signal: this.controller.signal,
        };
    }

    get modalTemplate() {
        return `
            <div class="modal-overlay"></div>
            <div class="modal ${this.className}-modal" data-el="modal">
                <h3 class="${this.className}-modal__title">
                    ${this.title}
                </h3>
                ${this.content || this.defaultContent()}
                ${this.controls}
            </div>
        `;
    }

    init() {
        this.insertModalTemplate();
        this.selectModalElements();
        this.addModalListeners();
    }

    insertModalTemplate() {
        document.body.insertAdjacentHTML('beforeend', this.modalTemplate);
    }

    selectModalElements() {
        this.modal = document.querySelector('[data-el="modal"]');
        this.closeButton = document.querySelector('[data-el="close"]');
        this.overlay = document.querySelector('.modal-overlay');
    }

    addModalListeners() {
        this.closeButton
            .addEventListener('click', this.onCloseBtnClick, this.options);
        this.overlay
            .addEventListener('click', this.onCloseBtnClick, this.options);
    }

    removeModalListeners() {
        this.controller.abort();
    }

    onCloseBtnClick = () => {
        if (this.subscriber) {
            this.subscriber[this.callbackName](this.userAction);
        }

        this.removeModalListeners();
        this.destroyModal();
    };

    destroyModal() {
        this.modal.classList.add('hide-modal');
        this.overlay.classList.add('hide-overlay');

        // Delay to support smooth modal window CSS animation
        setTimeout(() => {
            this.modal.remove();
            this.overlay.remove();

            for (const key in this) {
                this[key] = null;
            }
        }, 135);
    }
}

class InfoModal extends Modal {
    constructor(modalData = {}) {
        super(modalData);

        this.init();
    }

    get defaultContent() {
        return '';
    }

    init() {
        super.init();

        // Removing unwanted empty paragraphs which being
        // inserted by some browsers (it breaks styles)
        removeUnwantedTags(this.modal, 'p');
    }
}

class ConfirmationModal extends Modal {
    userAction = '';

    constructor(modalData = {}) {
        super(modalData);

        this.init();
    }

    get defaultContent() {
        return '';
    }

    selectModalElements() {
        super.selectModalElements();

        this.confirmButton = document.querySelector('[data-el="confirm"]');
    }

    addModalListeners() {
        super.addModalListeners();

        this.confirmButton
            .addEventListener('click', this.onConfirmButtonClick, this.options);
    }

    onConfirmButtonClick = () => {
        this.userAction = 'remove-episode';

        this.onCloseBtnClick();
    };
}

export { ModalManager };