/**
* Web Demo by Philip Newborough
* More info: https://philipnewborough.co.uk/demos/emoji-slot-machine/
*/
$(document).ready(function () {
    // Set-up audio resources
    const sfxStart = new Howl({ src: './audio/start.mp3' });
    const sfxSpinning = new Howl({ src: './audio/spinning.mp3', loop: true });
    const sfxReelStop = new Howl({ src: './audio/reel-stop.mp3' });
    const sfxCoinUp = new Howl({ src: './audio/coin-up.mp3' });
    const sfxCoinDown = new Howl({ src: './audio/coin-down.mp3' });
    const sfxGameOver = new Howl({ src: './audio/game-over.mp3' });
    const sfxWin = new Howl({ src: './audio/win.mp3' });
    const sfxEpicWin = new Howl({ src: './audio/win-epic.mp3' });
    const sfxLose = new Howl({ src: './audio/lose.mp3' });
    const sfxPoop = new Howl({ src: './audio/poop.mp3' });
    let resetInfo = null; // timeout var
    // An array of wheels
    const wheels = ['0', '1', '2'];
    // Roll arrays for populating wheels
    const roll = [
        ['🌶️', '🍒', '💩', '🦄', '🍒', '💯', '🍇', '🥝', '🥔', '🍒', '💩', '🍉', '🌶️', '🍋', '🍒', '🍆', '🍒', '🌶️', '🍒'],
        ['🌶️', '🍋', '💩', '🥝', '🍉', '🍆', '🍇', '🥔', '🍒', '💩', '🌶️', '🍒', '💯', '🍒', '🍒', '🦄', '🍒', '🌶️', '🍒'],
        ['🍉', '💯', '💩', '🥔', '🦄', '🌶️', '🍋', '🍒', '🥝', '💩', '🍆', '🍇', '🍒'],
    ];
    // Use one of these to test for win/poop conditions
    // const roll = [
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    // ];
    // const roll = [
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    // ];
    // const roll = [
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    // ];
    // const roll = [
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    //     ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩'],
    //     ['🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄', '🦄'],
    // ];
    // Setup function to initially create the wheels
    function setup() {
        drawWheel(0);
        drawWheel(1);
        drawWheel(2);
        // Remove spinning class as applied by drawWheel function
        $('.wheel span').removeClass('spinning');
    }
    // Populate given wheel with matching roll
    function drawWheel(i) {
        wheelHtml = '';
        const item = roll[i].pop(); // Remove last array item
        roll[i].unshift(item); // Push item into the beginning of array
        for (let index = 0; index < roll[i].length; ++index) {
            wheelHtml += '<span class="spinning">' + roll[i][index] + '</span>';
        }
        $('#wheel' + i).html(wheelHtml);
    }
    function spin() {
        sfxSpinning.volume(0.3);
        sfxSpinning.play();
        // Spin roll 0 - draw the wheel every 125ms
        const spinner0 = setInterval(function () {
            drawWheel(0);
        }, 125);
        // Spin roll 1 - draw the wheel every 100ms (slightly faster)
        const spinner1 = setInterval(function () {
            drawWheel(1);
        }, 100);
        // Spin roll 2 - draw the wheel every 100ms (slightly faster again)
        const spinner2 = setInterval(function () {
            drawWheel(2);
        }, 75);
        // Create random time between 2 - 2.5 seconds.
        // This is how long the wheel will spin (setInterval drawWheel above).
        const t0 = Math.floor(Math.random() * 500) + 2000;
        // Create the timeout that clears the setInterval after above time (t0).
        setTimeout(function () {
            clearInterval(spinner0);
            sfxReelStop.play();
            $('#wheel0 span').removeClass('spinning');
        }, t0);
        // As above but for wheel 2
        const t1 = Math.floor(Math.random() * 500) + 3000;
        setTimeout(function () {
            clearInterval(spinner1);
            sfxReelStop.play();
            $('#wheel1 span').removeClass('spinning');
        }, t1);
        // As above but for wheel 3
        const t2 = Math.floor(Math.random() * 500) + 4000;
        setTimeout(function () {
            clearInterval(spinner2);
            sfxReelStop.play();
            sfxSpinning.stop();
            $('#wheel2 span').removeClass('spinning');
            spinFinished();
        }, t2);
    }
    // Function used to animate coin count.
    // oldCoins (int) = coins at start of turn
    // newCoins (int) = number of coins at time of calling the function
    // spinFinished (bool) = was called after a spin (true), or at the start?
    // msg (string) = message to show in info box, e.g. Epic Win!
    function countCoins(oldCoins, newCoins, spinFinished, msg) {
        // Show th message
        if (msg) {
            $('.info span').attr('class', 'flash-fast');
            $('.info span').html(msg);
        }
        // No more coins, game over
        if (spinFinished && newCoins <= 0) {
            if (oldCoins > 0) { // Still count down to 0, if we have some coins
                const intervalId = setInterval(function () {
                    oldCoins--;
                    sfxCoinDown.play();
                    $('.coins').text(oldCoins);
                    if (oldCoins === 0) {
                        clearInterval(intervalId);
                    }
                }, 100);
            }
            clearTimeout(resetInfo);
            sfxGameOver.play();
            $('.info span').attr('class', 'gameover');
            $('.info span').html('GAME OVER! 💀');
            $('#btn-spin').attr('class', 'btn gameover');
        } else if (oldCoins > newCoins) {
            // Spin tariff or 💩 happened
            const intervalId = setInterval(function () {
                oldCoins--;
                sfxCoinDown.play();
                $('.coins').text(oldCoins);
                if (oldCoins === newCoins || oldCoins === 0) {
                    clearInterval(intervalId);
                    if (spinFinished) {
                        if (newCoins >= 10) {
                            $('#btn-spin').toggleClass('ready');
                        } else {
                            clearTimeout(resetInfo);
                            sfxGameOver.play();
                            $('.info span').attr('class', 'gameover');
                            $('.info span').html('GAME OVER! 💀');
                            $('#btn-spin').attr('class', 'btn gameover');
                        }
                    }
                }
            }, 100);
        } else {
            // Win, count our bounty
            const intervalId = setInterval(function () {
                oldCoins++;
                sfxCoinUp.play();
                $('.coins').text(oldCoins);
                if (oldCoins === newCoins) {
                    clearInterval(intervalId);
                    if (spinFinished) {
                        $('#btn-spin').toggleClass('ready');
                    }
                }
            }, 100);
        }
        // Called by spinFinished - test we have enough
        // coins for another spin?
        if (spinFinished && newCoins >= 10) {
            resetInfo = setTimeout(function () {
                $('.info span').attr('class', 'flash');
                $('.info span').html('Press "PLAY" to spin!');
            }, 3000);
        }
    }
    // Spin/turn finished, call by setTimeout function on last wheel
    function spinFinished() {
        // Test for win here
        let msg = 'No win 😭'; // Set default info message
        const coins = parseInt($('.coins').text()); // Get coins now
        // Test for matching 3 emoji
        if (roll[0][3] === roll[1][3] && roll[1][3] === roll[2][3]) {
            // Epic win, or epic poop?
            // We know we've matched 3, so just test the first wheel/roll
            if (roll[0][3] === '💩') {
                sfxLose.play();
                msg = 'Epic Poop! 💩';
                newCoins = coins - 100;
                // if(newCoins < 0){
                //     newCoins = 0;
                // }
                countCoins(coins, newCoins, true, msg);
            } else {
                sfxEpicWin.play();
                msg = 'Epic Win! 🥳';
                countCoins(coins, coins + 100, true, msg);
            }
        } else if (roll[0][3] === roll[1][3]) {
            // Match 2 - Win, or poop?
            if (roll[0][3] === '💩') {
                sfxPoop.play();
                msg = 'Poop! 💩';
                newCoins = coins - 20;
                countCoins(coins, newCoins, true, msg);
            } else {
                sfxWin.play();
                msg = 'Win! 😁';
                countCoins(coins, coins + 20, true, msg);
            }
        } else {
            // No win
            $('.info span').attr('class', 'flash-fast');
            $('.info span').html(msg);
            resetInfo = setTimeout(function () {
                $('.info span').attr('class', 'flash');
                $('.info span').html('Press "PLAY" to spin!');
            }, 3000);
            // Do we have enough coins to spin again?
            if (coins >= 10) {
                sfxLose.play();
                $('#btn-spin').toggleClass('ready');
            } else {
                clearTimeout(resetInfo);
                sfxGameOver.play();
                $('.info span').attr('class', 'gameover');
                $('.info span').html('GAME OVER! 💀');
                $('#btn-spin').attr('class', 'btn gameover');
            }
        }
    }
    // Run the setup
    setup();
    // Click play btn
    $(document).on('click', '#btn-spin.ready', function () {
        if (resetInfo) {
            clearTimeout(resetInfo);
        }
        $(this).removeClass('ready');
        $('.info span').attr('class', 'marquee');
        $('.info span').html('SPINNING! SPINNING! SPINNING!');
        const coins = parseInt($('.coins').text());
        sfxStart.play();
        countCoins(coins, coins - 10, false);
        spin();
    });
});