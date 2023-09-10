import { config } from '../config/config.js';

export function getStatsHtml(stats = {}) {
    const { totals, typesData } = stats;
    let statsTableHtml = '';

    const renderStatRow = (key) => {
        typesData.forEach(typeStats => {
            statsTableHtml += `
                <p class="stat-element${key === 'type' ? '-title' : ''}">
                    ${typeStats[key]}
                <p>
            `;
        });
    };

    config.statisticKeys.forEach(key => renderStatRow(key));

    return `
        <div class="stats-table">
            <p class="stat-element total-elems">
                Total episodes: <span id="total-elems">
                    ${totals.episodes} ~ ${totals.time} min.
                </span>
            </p>
            ${statsTableHtml}
        </div>
    `;
}