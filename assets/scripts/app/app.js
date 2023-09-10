import {
    formUI,
    episodesUI,
    NotificationManager,
    ModalManager,
} from '../view/index.js';
import {
    getStatsHtml,
    reduceEpisodeText,
} from '../helpers/index.js';
import { storage } from '../storage/storage.js';
import { Episode } from './episode.js';

class App {
    #totalEpisodes;
    #isEditMode = false;
    #isInitialized = false;

    #observer = null;
    #observerTarget = null;
    #pickedEpisode = null;

    #btnsController = null;
    #editModeBtnsController = null;

    static #instance = null;

    constructor() {
        if (App.#instance) {
            return App.#instance;
        }

        this.#totalEpisodes = storage.getEpisodesNumber();

        App.#instance = this;
    }

    init() {
        if (storage.episodes.length) {
            storage.episodes.forEach(episode => {
                episodesUI.renderEpisode(episode);
            });

            if (this.#isInitialized) {
                this.#totalEpisodes = storage.getEpisodesNumber();

                this.turnOffBlankMode();
                return;
            }

            formUI.toggleStatsBtnView();
            this.addBtnsListeners();
        }
        else {
            this.initBlankMode();
        }

        this.addMainAppListeners();
        this.onScreenResize();

        this.#isInitialized = true;
    }

    onAddButtonClick = (e) => {
        e.preventDefault();

        formUI.validateFormData();

        if (!formUI.isFormValid) {
            this.showFormFieldsErrorNotice();

            formUI.wipeFormData();
            return;
        }

        if (!storage.episodes.length) {
            this.turnOffBlankMode();
        }

        const episode = new Episode(formUI.formData, ++this.#totalEpisodes);

        storage.saveNewEpisode(episode, this.#totalEpisodes);
        episodesUI.renderEpisode(episode);

        formUI.resetForm();
        formUI.wipeFormData();

        episodesUI.episodesList
            .querySelector('.episode:last-child')
            .scrollIntoView({ behavior: "smooth" });
    };

    onStatsButtonClick = () => {
        if (!storage.lastStats) {
            storage.generateStatistics();
        }

        this.showStatsModal();
    };

    onSaveButtonClick = (e) => {
        e.preventDefault();

        formUI.validateFormData();

        if (!formUI.isFormValid) {
            this.showFormFieldsErrorNotice();

            formUI.wipeFormData();
            return;
        }

        const episodeId = this.#pickedEpisode.dataset.id;
        const editedEpisode = new Episode(formUI.formData, episodeId);

        storage.editAndSaveEpisode(editedEpisode, episodeId);

        this.reRenderEpisodesList();
        this.supportEditModeAnimation(episodeId);
        this.turnOffEditMode();
    };

    onEpisodesListClick = (e) => {
        if (this.#isEditMode) { return; }

        this.#pickedEpisode = e.target.closest('.episode');

        if (e.target.dataset.el === 'edit-btn') {
            this.initEditMode();
        }
        if (e.target.dataset.el === 'del-btn') {
            this.showConfirmationModal();
        }
    };

    initEditMode() {
        this.#isEditMode = true;

        this.fillFormWithEpisodeData();
        this.addEditModeBtnsListeners();
        this.showEditModeElements();
    }

    turnOffEditMode = () => {
        formUI.resetForm();

        this.removeEditModeBtnsListeners();
        this.hideEditModeElements();

        this.#isEditMode = false;
    };

    fillFormWithEpisodeData() {
        const episodeBody = this.#pickedEpisode.querySelector('.episode__body');

        const episode = storage.episodes.find(episode => {
            return episode.id == this.#pickedEpisode.dataset.id;
        });

        const text = reduceEpisodeText(episodeBody.children);

        formUI.form.description.value = text;
        formUI.form.time.value = episode.time;
        formUI.form['episode-type'].value = episode.type;
    }

    reRenderEpisodesList() {
        episodesUI.episodesList.innerHTML = '';
        episodesUI.setEpisodesOverlay();

        storage.episodes.forEach(episode => {
            episodesUI.renderEpisode(episode);
        });
    }

    initEpisodeRemoval() {
        storage.removeEpisode(this.#pickedEpisode.dataset.id);

        this.#pickedEpisode.remove();
    }

    initBlankMode() {
        this.toggleBetweenModes();

        if (this.#isInitialized) {
            this.removeBtnsListeners();
        }

        episodesUI.demoLink.addEventListener('click', this.onDemoLinkClick);
    }

    turnOffBlankMode() {
        this.toggleBetweenModes();
        this.addBtnsListeners();

        episodesUI.demoLink.removeEventListener('click', this.onDemoLinkClick);
    }

    toggleBetweenModes() {
        episodesUI.toggleEpisodesListsView();

        if (this.#isInitialized) {
            formUI.toggleStatsBtnView();
        }
    }

    showFormFieldsErrorNotice() {
        NotificationManager.create('error', formUI.issuesList);
    }

    showConfirmationModal() {
        const modalOptions = {
            subscriber: this,
            callbackName: 'onConfirmModalClick',
        };

        ModalManager.create('confirm', modalOptions);
    }

    showStatsModal() {
        const modalOptions = {
            content: getStatsHtml(storage.lastStats),
        };

        ModalManager.create('info', modalOptions);
    }

    showEditModeElements() {
        episodesUI.toggleListBtnsView('.list-btns');
        episodesUI.setEpisodesOverlay();
        formUI.toggleFormBtnsView();

        // The class is needed to support overlay animation
        this.#pickedEpisode.classList.add('picked-episode');
    }

    hideEditModeElements() {
        episodesUI.toggleListBtnsView('.list-btns.hidden');
        episodesUI.unsetEpisodesOverlay();
        formUI.toggleFormBtnsView();

        // Delay to support overlay animation
        setTimeout(() => {
            this.#pickedEpisode.classList.remove('picked-episode');
            this.#pickedEpisode = null;
        }, 200);
    }

    onConfirmModalClick(userAction = '') {
        if (userAction === 'remove-episode') {
            this.initEpisodeRemoval();

            if (!storage.episodes.length) {
                this.initBlankMode();
            }
        }

        this.#pickedEpisode = null;
    }

    onDemoLinkClick = (e) => {
        e.preventDefault();

        storage.setupDemoContent();

        this.init();
    };

    onScreenResize = () => {
        const windowWidth = window.innerWidth;

        formUI.setFormBtnsContent(windowWidth < 601);
        formUI.setTextareaResizeStyle(windowWidth);

        windowWidth >= 729
            && !this.#observer
            && this.initIntersectionObserver();

        windowWidth < 729
            && this.#observer
            && this.killIntersectionObserver();
    };

    onKeyPress = (e) => {
        if (e.code === 'Delete' && e.altKey && e.shiftKey && !e.repeat) {
            this.hardReset();
        }
    };

    hardReset() {
        storage.removeAllEpisodes();

        episodesUI.episodesList.innerHTML = '';

        this.initBlankMode();
    }

    initIntersectionObserver() {
        const callback = (entries) => {
            entries[0].isIntersecting
                ? episodesUI.toTopButton.classList.remove('show-top-btn')
                : episodesUI.toTopButton.classList.add('show-top-btn');
        };

        this.#observerTarget = document.createElement('div');
        this.#observerTarget.id = 'observer-target';

        document.body.prepend(this.#observerTarget);

        const options = {
            threshold: 0,
            rootMargin: '116px',
        };

        this.#observer = new IntersectionObserver(callback, options);
        this.#observer.observe(this.#observerTarget);
    }

    killIntersectionObserver() {
        episodesUI.toTopButton.classList.remove('show-top-btn');

        this.#observer.unobserve(this.#observerTarget);
        this.#observerTarget.remove();

        this.#observerTarget = null;
        this.#observer = null;
    }

    supportEditModeAnimation(id) {
        // For smooth CSS animation when the Edit Mode is turning off
        this.#pickedEpisode = document.querySelector(`[data-id="${id}"]`);
        this.#pickedEpisode.classList.add('picked-episode');
    }

    addMainAppListeners() {
        formUI.addButton.addEventListener('click', this.onAddButtonClick);
        window.addEventListener('resize', this.onScreenResize);
    }

    addBtnsListeners() {
        this.#btnsController = new AbortController();

        const options = {
            signal: this.#btnsController.signal,
        };

        formUI.statsButton
            .addEventListener('click', this.onStatsButtonClick, options);
        episodesUI.episodesList
            .addEventListener('click', this.onEpisodesListClick, options);
        window.addEventListener('keydown', this.onKeyPress, options);
    }

    removeBtnsListeners() {
        this.#btnsController.abort();
        this.#btnsController = null;
    }

    addEditModeBtnsListeners() {
        this.#editModeBtnsController = new AbortController();

        const options = {
            signal: this.#editModeBtnsController.signal,
        };

        formUI.saveButton
            .addEventListener('click', this.onSaveButtonClick, options);
        formUI.cancelButton
            .addEventListener('click', this.turnOffEditMode, options);
    }

    removeEditModeBtnsListeners() {
        this.#editModeBtnsController.abort();
        this.#editModeBtnsController = null;
    }
}

const app = new App();

export { app };