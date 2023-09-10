import {
    generateTypeStats,
    getTotalTime,
} from '../helpers/index.js';
import { demoData } from './demo-data.js';
import { config } from '../config/config.js';

class Storage {
    #episodes = [];
    #lastStats = null;

    static #instance = null;

    constructor() {
        if (Storage.#instance) {
            return Storage.#instance;
        }

        this.#episodes = this.getParsedAppData() || [];

        Storage.#instance = this;
    }

    get episodes() { return this.#episodes; }
    get lastStats() { return this.#lastStats; }

    getParsedAppData() {
        return JSON.parse(localStorage.getItem('appData'));
    }

    getEpisodesNumber() {
        return localStorage.getItem('totalEpisodes') || 0;
    }

    generateStatistics() {
        const types = [...config.episodeTypes];

        this.#lastStats = {
            totals: {
                episodes: this.episodes.length,
                time: getTotalTime(this.episodes),
            },
            typesData: types.map(type => generateTypeStats(this.episodes, type))
        };
    }

    saveNewEpisode(episode, totalEpisodes) {
        this.#episodes.push(episode);

        this.updateStorage(totalEpisodes);
    }

    editAndSaveEpisode(newEpisode, id) {
        const index = this.episodes.findIndex(episode => episode.id === id);
        this.#episodes[index] = newEpisode;

        this.updateStorage();
    }

    removeEpisode(id) {
        this.#episodes = this.episodes.filter(episode => episode.id !== id);

        this.updateStorage();
    }

    removeAllEpisodes() {
        this.#episodes = [];

        this.updateStorage();
    }

    updateStorage(totalEpisodes) {
        this.#lastStats = null;

        if (!this.episodes.length) {
            return localStorage.removeItem('appData');
        }

        localStorage.setItem('appData', JSON.stringify(this.episodes));

        if (totalEpisodes) {
            localStorage.setItem('totalEpisodes', totalEpisodes);
        }
    }

    setupDemoContent() {
        this.#episodes = [...demoData];

        this.updateStorage(this.episodes.length);
    }
}

const storage = new Storage();

export { storage };