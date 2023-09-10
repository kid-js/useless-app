export function formatNumber(num = 0) {
    // Round the number and cut any unneeded 
    // zeros after the decimal point
    if (num % 1 !== 0) {
        num = Number(num).toFixed(1);

        if (num % 1 === 0) {
            return formatNumber(num);
        }
        return +num;
    } 
    else {
        return Math.trunc(num);
    }
}