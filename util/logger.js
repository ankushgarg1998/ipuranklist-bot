// Prepend zeroes for 2 digit numbers.
function pz(num) {
    return ('0' + num).slice(-2);
}

// logger
function log(str) {
    let currentdate = new Date();
    let datetime = pz(currentdate.getDate()) + "/"
        + pz(currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + pz(currentdate.getHours()) + ":"
        + pz(currentdate.getMinutes()) + ":"
        + pz(currentdate.getSeconds());
    console.log(`${datetime} -> ${str}`);
}

module.exports = { log }