// Prepend zeroes for 2 digit numbers.
function pz(num) {
    return ('0' + num).slice(-2);
}

// logger
function log(str) {
    let currentDate = new Date();
    let datetime = pz(currentDate.getDate()) + "/"
        + pz(currentDate.getMonth() + 1) + "/"
        + currentDate.getFullYear() + " @ "
        + pz(currentDate.getHours()) + ":"
        + pz(currentDate.getMinutes()) + ":"
        + pz(currentDate.getSeconds());
    console.log(`${datetime} -> ${str}`);
}

export { log }
