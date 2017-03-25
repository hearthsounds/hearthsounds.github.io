var audioContainer = document.getElementById('hs-audio-container');
var failAudio = document.getElementById('audio-fail')
var inputBox = document.getElementById('card-guess');
var currentScoreElement = document.getElementById('current-score');
var timerElement = document.getElementById('hs-timer');
var MAX_TIMER = 60;
var timer = MAX_TIMER + 1;

var SOUNDS_BASE_URL = '//media-hearth.cursecdn.com/audio/card-sounds/sound/';
var sounds = [];
var availableSoundIndexes = [];
var currentScore = 0;
var currentSoundIndex = 0;

function seedCards(cardsToAdd) {
    if (availableSoundIndexes.length === 0) {
        // seed available sound availableSoundIndexes
        for (var i = 0; i < CARDS.length; i++) {
            availableSoundIndexes.push(i);
        }
    }
    var startingSoundsLength = sounds.length;
    while (sounds.length < startingSoundsLength + cardsToAdd) {
        // generate valid index for availableSoundIndexes
        var randomNumber = Math.floor(Math.random() * availableSoundIndexes.length);
        // store chosen CARDS index number and remove it from availableSoundIndexes
        var chosenSoundIndex = availableSoundIndexes.splice(randomNumber, 1)[0];
        // add chosen CARDS index info to sounds array
        sounds.push(CARDS[chosenSoundIndex]);
    }

    // seed audio for new cards
    var audioTags = audioContainer.getElementsByTagName('audio');
    for (var i = audioTags.length; i < sounds.length; i++) {
        var audioTag = document.createElement('audio');
        audioTag.src = getSoundUrl(i);
        audioContainer.appendChild(audioTag);
    }
}

function getSoundUrl(index) {
    return SOUNDS_BASE_URL + sounds[index].sound;
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
    pauseAllSounds();
    audioContainer.getElementsByTagName('audio')[index].play();
}

function skipSound() {
    decrementTimer(3);
    incrementSoundIndex();
    playSound(currentSoundIndex);
    inputBox.value = '';
}

function decrementTimer(seconds) {
    timer -= seconds;
    timerElement.innerHTML = timer;
}

function incrementSoundIndex() {
    currentSoundIndex++;
    if (sounds.length - currentSoundIndex <= 5) {
        seedCards(5);
    }
}

function pauseAllSounds() {
    failAudio.pause();
    failAudio.currentTime = 0;
    var audioTags = audioContainer.getElementsByTagName('audio')
    for (var i = 0; i < audioTags.length; i++) {
        audioTags[i].pause();
        audioTags[i].currentTime = 0;
    }
}

// ON BODY LOAD
seedCards(10);

function endGameState() {
    currentScoreElement.innerHTML = "Well done! Score: " + currentScore;
    document.getElementById("controls").style.display = "none";
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
        if (selectedSuggestion === sounds[currentSoundIndex].name) {
            ++currentScore;
            incrementSoundIndex();
            currentScoreElement.innerHTML = "Score: " + currentScore;
            playSound(currentSoundIndex);
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
        document.getElementById('skip-button').removeAttribute('disabled');
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
    playSound(currentSoundIndex);
});

document.getElementById('skip-button').addEventListener('click', function () {
    skipSound();
});

function updateUIForInput(currentInput) {
    var currentInputLower = currentInput.toLowerCase();
    var suggestions = [];
    for (var i = 0; i < CARDS.length; i++) {
        var cardNameLower = CARDS[i].name.toLowerCase();
        // Update Suggestions
        if (suggestions.length < 3 && cardNameLower.indexOf(currentInputLower) > -1) {
            suggestions.push(CARDS[i]);
        }
    }
    updateSuggestionsUI(suggestions);
}

function createSuggestionElement(card, isSelected) {
    var li = document.createElement('li');
    var imgDiv = document.createElement('div');
    var textDiv = document.createElement('div');
    textDiv.className = 'suggestion-text';
    imgDiv.className = 'suggestion-image';
    textDiv.textContent = card.name;
    var img = document.createElement('img');
    img.className = 'suggestion-inner-img';
    img.src = card.img;
    if (isSelected) {
        li.className = 'selected';
    }
    imgDiv.appendChild(img);
    li.appendChild(imgDiv);
    li.appendChild(textDiv);
    return li;
}

function updateSuggestionsUI(suggestions) {
    var suggestionsList = document.querySelector('#suggestions ol');
    // Empty the suggestions list
    while (suggestionsList.firstChild) {
        suggestionsList.removeChild(suggestionsList.firstChild);
    }
    if (suggestions.length === 0) {
        var emptySuggestionElement = document.createElement('img');
        emptySuggestionElement.src = 'http://i.imgur.com/1gsci5r.jpg';
        emptySuggestionElement.className = 'empty-suggestion';
        suggestionsList.appendChild(emptySuggestionElement);
    } else {
        for (var i = 0; i < suggestions.length; i++) {
            var li = createSuggestionElement(suggestions[i], i === 0);
            suggestionsList.appendChild(li);
        }
    }
}


function timerStart() {
    decrementTimer(1);
    var interval = setInterval(function () {
        decrementTimer(1);
        if (timer <= 0) {
            timer = 0;
            clearInterval(interval);
            endGameState();
        }
        timerElement.innerHTML = timer;
    }, 1000);
}