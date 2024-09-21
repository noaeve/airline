/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
function randomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomElement(arr) {
    if (arr.length == 0) {
        return null;
    }
    return arr[arr.length * Math.random() << 0];
}
/**
 * Returns true with a 1-in-{chance} probability
 */
function randomChance(chance) {
    return randomIntBetween(1, chance) == 1;
}
export { randomIntBetween, randomElement, randomChance };