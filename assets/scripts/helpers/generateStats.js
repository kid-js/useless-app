import { formatNumber } from './formatNumber.js';

function getTotalTime(episodes = []) {
    episodes = [...episodes];

    return episodes.reduce((acc, episode) => {
        return acc + episode.time * 10;
    }, 0) / 10;
}

function generateTypeStats(episodes = [], type = '') {
    episodes = [...episodes];

    const typeTotals = {};
    const typeTimeTotals = {};

    const getTypeTotal = (type) => {
        return episodes.reduce((acc, episode) => {
            return episode.type === type ? ++acc : acc;
        }, 0);
    };

    const getTypeTotalTime = (type) => {
        return episodes.reduce((acc, episode) => {
            return episode.type === type ? acc + episode.time * 10 : acc;
        }, 0) / 10;
    };

    const getTypeAvgTime = (type) => {
        const avg = typeTimeTotals[type] / typeTotals[type];

        return formatNumber(avg) || 0;
    };

    const getPercentage = (type) => {
        const percentage = typeTimeTotals[type] * 100 / getTotalTime(episodes);

        return formatNumber(percentage);
    };

    const getTypeStats = (type) => {
        typeTotals[type] = getTypeTotal(type);
        typeTimeTotals[type] = getTypeTotalTime(type);

        return {
            type,
            total: typeTotals[type] + ' total',
            minutes: typeTimeTotals[type] + ' min.',
            average: getTypeAvgTime(type) + ' avg.',
            percents: getPercentage(type) + '%',
        };
    };

    return getTypeStats(type);
}

export { getTotalTime, generateTypeStats };