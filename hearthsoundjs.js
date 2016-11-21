var audioTag = document.getElementById('audio-tag');
var failAudio = document.getElementById('audio-fail')
var inputBox = document.getElementById('card-guess');
var currentScore = document.getElementById('current-score')

var sounds = [];

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

seedCards();

var guessCount = 0;

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

    return 'http://wow.zamimg.com/hearthhead/sounds/' + oopsSounds[Math.floor(Math.random() * oopsSounds.length)];
}

audioTag.src = sounds[guessCount].sound;

document.getElementById('card-guess').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        if (inputBox.value === sounds[guessCount].name) {
            if (guessCount === sounds.length - 1) {
                currentScore.innerHTML = "YOU WIN! Score: " + ++guessCount;
                document.getElementById("controls").style.visibility = "hidden";
            } else {
                audioTag.src = sounds[++guessCount].sound;
                currentScore.innerHTML = "Score: " + guessCount;
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


