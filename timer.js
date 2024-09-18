function minutesTimer(minutes, everySecond, atEnd) {
    const start = Date.now().valueOf();
    const totalSeconds = minutes * 60;
    var secondsRemaining = totalSeconds;
    const tick = function() {
        const now = Date.now().valueOf();
        const elapsed = Math.floor(now - start)/1000;
        while ( elapsed + secondsRemaining > totalSeconds && secondsRemaining > 0) {
            secondsRemaining--;
            everySecond(secondsRemaining);
        }
        if(secondsRemaining <= 0) {
            atEnd();
            return;
        }
        const next = start + (1 + elapsed)*1000;
        window.setTimeout(tick, start - next);
    };
    window.setTimeout(tick, 1000);
}

function secondsTimer(seconds, numberTicks, everyTick, atEnd) {
    const everyMs = seconds * 1000/numberTicks;

    var handle;
    var func;

    func = function() {
        numberTicks--;
        if(numberTicks < 0) {
            atEnd();
        } else {
            everyTick(numberTicks);
            handle = window.setTimeout(func, everyMs);
        }
    };
    handle = window.setTimeout(func, everyMs);
    return {
        "cancel": function() {
            window.clearTimeout(handle);
        }
    };
}

export { minutesTimer, secondsTimer };