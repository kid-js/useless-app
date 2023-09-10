class EpisodesUI {
    static #instance = null;

    constructor() {
        if (EpisodesUI.#instance) {
            return EpisodesUI.#instance;
        }

        this.episodesList = document.getElementById('episodes-list');
        this.emptyEpisodesList = document.getElementById('empty-list');
        this.demoLink = document.getElementById('demo-link');
        this.toTopButton = document.getElementById('to-top');

        EpisodesUI.#instance = this;
    }

    setEpisodesOverlay() {
        this.episodesOverlay = document.createElement('div');
        this.episodesOverlay.classList.add('episodes-overlay');

        this.episodesList.prepend(this.episodesOverlay);
    }

    unsetEpisodesOverlay() {
        this.episodesOverlay.classList.add('hide-episodes-overlay');

        // Delay to support the overlay animation
        setTimeout(() => {
            this.episodesOverlay.remove();
            this.episodesOverlay = null;
        }, 135);
    }

    toggleEpisodesListsView() {
        this.episodesList.hidden = !this.episodesList.hidden;
        this.emptyEpisodesList.hidden = !this.emptyEpisodesList.hidden;
    }

    toggleListBtnsView(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.toggle('hidden');
        });
    }

    getTemplate(episode = {}) {
        return `
            <div class="episode" data-id=${episode.id}>
                <div class="episode__body ${episode.type}"></div>

                <p class="episode__time ${episode.type}">
                    ${episode.time} min.
                </p>

                <div class="list-btns">
                    <button class="btn edit-btn" data-el="edit-btn"></button>
                    <button class="btn remove-btn" data-el="del-btn"></button>
                </div>
            </div>
        `;
    }

    renderEpisode(episode = {}) {
        this.episodesList.insertAdjacentHTML(
            'beforeend', this.getTemplate(episode)
        );

        const episodeBodyDiv = document
            .querySelector(`[data-id="${episode.id}"]`)
            .querySelector('.episode__body');

        episode.paragraphs.forEach((pText, i, arr) => {
            if (pText === '') { return; }

            const pTag = document.createElement('p');

            pTag.textContent = pText;
            pTag.classList.add('episode__p');

            // Render text into HTML the exact way it has been inputted
            // by user - add margin if there is extra line break after 
            // paragraph (each one is represented as '' in array)
            if (arr[i + 1] === '') {
                pTag.classList.add('margin-bottom-16');
            }

            episodeBodyDiv.append(pTag);
        });
    }
}

const episodesUI = new EpisodesUI();

export { episodesUI };