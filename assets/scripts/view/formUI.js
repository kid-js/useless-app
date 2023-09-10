import { formatNumber } from '../helpers/formatNumber.js';

class FormUI {
    #isFormValid = false;
    #issuesList = [];
    #formData = {};

    static #instance = null;

    constructor() {
        if (FormUI.#instance) {
            return FormUI.#instance;
        }

        this.form = document.forms.episode;
        this.addButton = document.getElementById('add-btn');
        this.saveButton = document.getElementById('save-btn');
        this.statsButton = document.getElementById('stats-btn');
        this.cancelButton = document.getElementById('cancel-btn');

        FormUI.#instance = this;
    }

    get isFormValid() { return this.#isFormValid; }
    get issuesList() { return this.#issuesList; }
    get formData() { return this.#formData; }

    validateFormData() {
        const re = /^\d+(\.\d+?)?$/;

        const text = this.form.description.value.trim();
        const time = this.form.time.value.replace(/,/, '.').trim();
        const type = this.form['episode-type'].value;

        if (text === '') {
            this.#issuesList.push('Text field is empty!');
        }
        if (!re.test(time)) {
            this.#issuesList.push('Time value must be a number!');
        }
        if (!type) {
            this.#issuesList.push('Episode type is not chosen!');
        }

        if (!this.#issuesList.length) {
            this.#isFormValid = true;

            this.#formData = {
                paragraphs: text.split('\n'),
                time: formatNumber(time),
                type: type,
            };
        }
    }

    toggleFormBtnsView() {
        this.addButton.hidden = !this.addButton.hidden;
        this.saveButton.hidden = !this.saveButton.hidden;
        this.cancelButton.hidden = !this.cancelButton.hidden;
        this.statsButton.hidden = !this.statsButton.hidden;
    }

    toggleStatsBtnView() {
        this.statsButton.hidden = !this.statsButton.hidden;
    }

    setFormBtnsContent(isScreenSmall) {
        this.addButton.textContent = `
            Add ${isScreenSmall ? '' : 'new episode'}
        `;
        this.statsButton.textContent = `
            ${isScreenSmall ? 'Stats' : 'Show stats'}
        `;
    }

    setTextareaResizeStyle(windowWidth) {
        windowWidth < 1025
            ? this.form.description.setAttribute('style', 'resize: none')
            : this.form.description.setAttribute('style', 'resize: vertical');
    }

    resetForm() {
        this.form.reset();
        this.#isFormValid = false;
    }

    wipeFormData() {
        this.#issuesList = [];
        this.#formData = {};
    }
}

const formUI = new FormUI();

export { formUI };