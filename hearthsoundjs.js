var audioContainer = document.getElementById('hs-audio-container');
var failAudio = document.getElementById('audio-fail')
var inputBox = document.getElementById('card-guess');
var currentScore = document.getElementById('current-score');
var MAX_TIMER = 60;
var timer = MAX_TIMER + 1;

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

function getSound(index) {
    return SOUNDS_BASE_URL + sounds[index].sound;
}

function seedAudio() {
    while (audioContainer.hasChildNodes()) {
        audioContainer.removeChild(audioContainer.lastChild);
    }
    for (var i = 0; i < sounds.length; i++) {
        var audioTag = document.createElement('audio');
        audioTag.src = getSound(i);
        audioContainer.appendChild(audioTag);
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

function playSound(index) {
    failAudio.pause();
    failAudio.currentTime = 0;
    audioContainer.childNodes[index].play();
}

// ON BODY LOAD
seedCards();
seedAudio();

function endGameState() {
    if (guessCount === 10) {
        currentScore.innerHTML = "YOU WIN! Score: " + guessCount;
        document.getElementById("controls").style.display = "none";
    } else {
        currentScore.innerHTML = "YOU LOST! Score: " + guessCount + "<br> The last card was: " + sounds[guessCount].name;
        document.getElementById("controls").style.display = "none";
    }
}

document.getElementById('card-guess').addEventListener('keydown', function (e) {
    if (e.keyCode === 9) {
        e.preventDefault();
        tabThroughSuggestions(e);
    }
});

document.getElementById('card-guess').addEventListener('keyup', function (e) {
    if (e.keyCode === 9) {
        return;
    }
    var currentInput = e.target.value;
    var selectedSuggestion = null;
    var selectedSuggestionElement = document.querySelector('#suggestions .selected');
    if (selectedSuggestionElement) {
        selectedSuggestion = selectedSuggestionElement.textContent;
    }
    if (e.keyCode === 13) {
        if (selectedSuggestion === sounds[guessCount].name) {
            if (guessCount === sounds.length - 1) {
                ++guessCount;
                endGameState();
            } else {
                currentScore.innerHTML = "Score: " + guessCount;
                ++guessCount;
                playSound(guessCount);
            }
            e.target.value = '';
        }
        else {
            failAudio.src = pickRandomFailSound();
            failAudio.play();
        }
    }
});

document.getElementById('card-guess').addEventListener('input', function (e) {
    var currentInput = e.target.value;
    if (timer === MAX_TIMER + 1) {
        timerStart();
    }
    updateUIForInput(currentInput);
});

function tabThroughSuggestions(e) {
    var selected = document.querySelector('#suggestions .selected');
    var nextToSelect;
    if (e.shiftKey) {
        nextToSelect = selected.previousElementSibling;
        if (nextToSelect === null) {
            nextToSelect = selected.parentNode.lastElementChild;
        }
    } else {
        nextToSelect = selected.nextElementSibling;
        if (nextToSelect === null) {
            nextToSelect = selected.parentNode.firstElementChild;
        }
    }
    selected.className = '';
    nextToSelect.className = 'selected';
}

document.getElementById('sound-button').addEventListener('click', function () {
    playSound(guessCount);
});

function setImageElement(url) {
    var imagesDiv = document.getElementById('hs-images');
    var img = document.createElement('img');
    img.src = url;
    // Ensures the div is empty 
    while (imagesDiv.hasChildNodes()) {
        imagesDiv.removeChild(imagesDiv.lastChild);
    }
    imagesDiv.appendChild(img);
}

function updateUIForInput(currentInput) {
    var currentInputLower = currentInput.toLowerCase();
    var suggestions = [];
    for (var i = 0; i < CARDS.length; i++) {
        var cardNameLower = CARDS[i].name.toLowerCase();

        // Update Image
        // if (cardName === currentInputLower) {
        //     setImageElement(CARDS[i].img);
        // }

        // Update Suggestions
        if (suggestions.length < 3 && cardNameLower.indexOf(currentInputLower) > -1) {
            suggestions.push(CARDS[i]);
        }
    }
    updateSuggestionsUI(suggestions);
}

function updateSuggestionsUI(suggestions) {
    var suggestionsList = document.querySelector('#suggestions ol');
    // Empty the suggestions list
    while (suggestionsList.firstChild) {
        suggestionsList.removeChild(suggestionsList.firstChild);
    }
    for (var i = 0; i < suggestions.length; i++) {
        var li = document.createElement('li');
        li.textContent = suggestions[i].name;
        if (i === 0) {
            li.className = 'selected';
        }
        suggestionsList.appendChild(li);
    }
}


function timerStart() {
    var timerDiv = document.getElementById('hs-timer');
    timer--;
    timerDiv.innerHTML = timer;
    var interval = setInterval(function () {
        timer--;
        timerDiv.innerHTML = timer;
        if (timer === 0) {
            clearInterval(interval);
            endGameState();

        }
    }, 1000);
}