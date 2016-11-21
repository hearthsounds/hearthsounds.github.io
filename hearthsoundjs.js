var audioTag = document.getElementById('audio-tag');
var failAudio = document.getElementById('audio-fail')
var inputBox = document.getElementById('card-guess');
var currentScore = document.getElementById('current-score');

var SOUNDS_BASE_URL = '//media-hearth.cursecdn.com/audio/card-sounds/sound/';
var sounds = [];
var guessCount = 0;

function seedCards() {
    var chosenIndexes = [];
    while (sounds.length < 10) {
        var randomNumber = Math.floor(Math.random() * CARDS.length);
        if (chosenIndexes.indexOf(randomNumber) > -1) {
            continue;
        }
        chosenIndexes.push(randomNumber);
        sounds.push(CARDS[randomNumber]);
    }
}

function pickRandomFailSound() {
    var oopsSounds = [
        'VO_HERO_01_Oops_03.ogg',
        'VO_HERO_03_Oops_03.ogg',
        'VO_HERO_04_Oops_03.ogg',
        'VO_HERO_05_Oops_03.ogg',
        'VO_HERO_06_Oops_03.ogg',
        'VO_HERO_07_Oops_03.ogg',
        'VO_HERO_08_Oops_58.ogg',
        'VO_HERO_09_Oops_03.ogg',
        'VO_Hero_02_Oops_03_ALT.ogg'
    ];

    return SOUNDS_BASE_URL + oopsSounds[Math.floor(Math.random() * oopsSounds.length)];
}

function getSound(index) {
    return SOUNDS_BASE_URL + sounds[index];
}

// ON BODY LOAD
audioTag.src = getSound(guessCount]);
seedCards();

document.getElementById('card-guess').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        if (inputBox.value.toLowerCase() === sounds[guessCount].name.toLowerCase()) {
            if (guessCount === sounds.length - 1) {
                currentScore.innerHTML = "YOU WIN! Score: " + ++guessCount;
                document.getElementById("controls").style.visibility = "hidden";
            } else {
                audioTag.src = getSound(++guessCount);
                currentScore.innerHTML = "Score: " + guessCount;
                audioTag.play();
            }
        }
        else {
            failAudio.src = pickRandomFailSound();
            failAudio.play();
        }
    }
});

document.getElementById('sound-button').addEventListener('click', function () {
    audioTag.play();
});


