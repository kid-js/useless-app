class Episode {
    constructor(episodeData = {}, id = Math.random()) {
        Object.assign(this, episodeData);

        this.id = id + '';
    }
}

export { Episode };