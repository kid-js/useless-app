export function removeUnwantedTags(element, tagName) {
    for (const tag of element.getElementsByTagName(tagName)) {
        tag.innerText === '' && tag.remove();
    }
}