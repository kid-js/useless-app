// This function extracts plain text out of paragraphs' array
export function reduceEpisodeText(paragraphs = []) {
    return [...paragraphs].reduce((string, pTag) => {
        string += pTag.innerText + '\n';

        // Add extra line break (if a paragraph has margin) 
        // to fill text into the form field the exact way 
        // it is represented on the page
        if (pTag.matches('.margin-bottom-16')) {
            string += '\n';
        }
        return string;
    }, '')
        .trim();
}