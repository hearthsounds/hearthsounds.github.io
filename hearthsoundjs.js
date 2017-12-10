var audioContainer = document.getElementById('hs-audio-container');
var failAudioContainer = document.getElementById('audio-fail')
var inputBox = document.getElementById('card-guess');
var currentScoreElement = document.getElementById('current-score');
var soundsYouHeardElement = document.getElementById('sounds-you-heard');
var timerElement = document.getElementById('hs-timer');

var MAX_TIMER = 60;
var SOUNDS_BASE_URL = '//media-hearth.cursecdn.com/audio/card-sounds/sound/';
var IMG_BASE_URL = 'http://media.services.zam.com/v1/media/byName';
var NEW_GAME_STATE = 0;
var IN_GAME_STATE = 1;
var END_GAME_STATE = 2;
var LEFTARROW_KEY_CODE = 37;
var RIGHTARROW_KEY_CODE = 39;
var TAB_KEY_CODE = 9;
var ENTER_KEY_CODE = 13;
var R_KEY_CODE = 82;
var ESC_KEY_CODE = 27;

var timer = MAX_TIMER + 1;
var sounds = [];
var availableSoundIndexes = [];
var skippedSounds = [];
var currentScore = 0;
var currentSoundIndex = 0;
var timerInterval;
var settings = {};
var cardPool = CARDS;

function seedCards(cardsToAdd) {
    if (availableSoundIndexes.length === 0) {
        // seed available sound availableSoundIndexes
        for (var i = 0; i < cardPool.length; i++) {
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
        sounds.push(cardPool[chosenSoundIndex]);
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

function playRandomFailSound() {
    var audioTags = failAudioContainer.getElementsByTagName('audio');
    var randomNumber = Math.floor(Math.random() * audioTags.length);
    pauseAllSounds();
    audioTags[randomNumber].play();
}

function playCurrentSound() {
    pauseAllSounds();
    audioContainer.getElementsByTagName('audio')[currentSoundIndex].play();
}

function skipSound() {
    skippedSounds.push(sounds[currentSoundIndex].name)
    decrementTimer(3);
    incrementSoundIndex();
    playCurrentSound();
    inputBox.value = '';
}

function decrementTimer(seconds) {
    timer -= seconds;
    if (timer <= 0) {
        timer = 0;
        clearInterval(timerInterval);
        endGameState();
    }
    timerElement.innerHTML = timer;
}

function incrementSoundIndex() {
    currentSoundIndex++;
    if (sounds.length - currentSoundIndex <= 5) {
        seedCards(5);
    }
}

function pauseAllSounds() {
    var failAudioTags = failAudioContainer.getElementsByTagName('audio')
    for (var i = 0; i < failAudioTags.length; i++) {
        failAudioTags[i].pause();
        failAudioTags[i].currentTime = 0;
    }
    var audioTags = audioContainer.getElementsByTagName('audio')
    for (var i = 0; i < audioTags.length; i++) {
        audioTags[i].pause();
        audioTags[i].currentTime = 0;
    }
}

// ON BODY LOAD
inputBox.focus();
registerSettings();
updateCardPool();
updateUIForInput('');

function endGameState() {
    console.log('SKIPPED SOUNDS', skippedSounds)
    const soundsYouHeardList = sounds.filter((sound, index) => index <= currentSoundIndex)    
    currentScoreElement.innerHTML = "Well done! Score: " + currentScore + "<br>"
    const soundsYouHeardWithSkips = soundsYouHeardList.map(sound => 
        skippedSounds.includes(sound.name) ? `${sound.name} ❌` : `${sound.name} ✅`);
    soundsYouHeardWithSkips[soundsYouHeardWithSkips.length - 1] = sounds[currentSoundIndex].name
    soundsYouHeardElement.innerHTML = soundsYouHeardWithSkips.map(sound => `<li>${sound}</li>`).join(' ');
    document.getElementById("controls").style.display = "none";
    document.getElementById("endgame").style.display = "block";
    document.getElementById("sounds-you-heard-container").style.display = "inline-block";    
}

function getGameState() {
    if (timer === 0) {
        return END_GAME_STATE;
    } else if (timer === MAX_TIMER + 1) {
        return NEW_GAME_STATE;
    } else {
        return IN_GAME_STATE;
    }
}

document.body.addEventListener('keydown', function (e) {
    if (e.keyCode === TAB_KEY_CODE ||
        e.keyCode === LEFTARROW_KEY_CODE ||
        e.keyCode === RIGHTARROW_KEY_CODE) {
        e.preventDefault();
        if (getGameState() !== IN_GAME_STATE) {
            return;
        }
        // forwards - no shift + tab or right arrow key
        var isForwards = (!e.shiftKey && e.keyCode === TAB_KEY_CODE) || e.keyCode === RIGHTARROW_KEY_CODE;
        tabThroughSuggestions(isForwards);
    } else if (e.keyCode === ESC_KEY_CODE) {
        if (getGameState() !== IN_GAME_STATE) {
            return;
        }
        e.preventDefault();
        skipSound();
    } else if (e.keyCode === R_KEY_CODE && e.altKey) {
        e.preventDefault();
        if (getGameState() !== END_GAME_STATE) {
            playCurrentSound();
        } else if (getGameState() === END_GAME_STATE) {
            restartGame();
        }
    }
});

document.getElementById('card-guess').addEventListener('keyup', function (e) {
    if (e.keyCode === TAB_KEY_CODE) {
        return;
    }
    var currentInput = e.target.value;
    var selectedSuggestion = null;
    var selectedSuggestionElement = document.querySelector('#suggestions .selected');
    if (selectedSuggestionElement) {
        selectedSuggestion = selectedSuggestionElement.textContent;
    }
    if (e.keyCode === ENTER_KEY_CODE) {
        if (selectedSuggestion === sounds[currentSoundIndex].name) {
            ++currentScore;
            incrementSoundIndex();
            currentScoreElement.innerHTML = "Score: " + currentScore;
            playCurrentSound();
            e.target.value = '';
        }
        else {
            shakeSuggestion(selectedSuggestionElement);
            playRandomFailSound();
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

function tabThroughSuggestions(isForwards) {
    var selected = document.querySelector('#suggestions .selected');
    if (!selected) {
        return;
    }
    var nextToSelect;
    if (!isForwards) {
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

function shakeSuggestion(element) {
    element.classList.remove('shake');
    setTimeout(function() {
        element.classList.add('shake');
    });
}

document.getElementById('sound-button').addEventListener('click', playCurrentSound);

document.getElementById('skip-button').addEventListener('click', skipSound);

document.getElementById('restart-button').addEventListener('click', restartGame);

// if (/Mobi/.test(navigator.userAgent)) {
//   document.getElementById('hs-container').style.display = 'none';
//   document.getElementById('mobile').style.display = 'block';
// }

function registerSettings() {
    var masterSettingsElement = document.getElementById('settings');
    var settingElements = masterSettingsElement.getElementsByTagName('input');
    for (var i = 0; i < settingElements.length; ++i) {
        var className = settingElements[i].className;
        var defaultValue = settingElements[i].hasAttribute('checked');
        var storageValue = window.localStorage.getItem(className);
        if (storageValue === null) {
            settings[className] = defaultValue;
        } else {
            settings[className] = storageValue === 'true';
        }
    }
}

function updateSettingsUIFromStorage(settingsElement) {
    for (settingName in settings) {
        settingsElement.getElementsByClassName(settingName)[0].checked = settings[settingName];
    }
}

function updateSetting(e) {
    var settingElement = e.target;
    var settingName = e.target.className;
    settings[settingName] = e.target.checked;
    window.localStorage.setItem(settingName, e.target.checked);
    updateCardPool();
}

function updateCardPool() {
    cardPool = CARDS;
    if (settings['setting-remove-growls']) {
        cardPool = cardPool.filter(function(c) {
            return c.isGrowl !== true;
        });
    }
    if (settings['setting-remove-wild']) {
        cardPool = cardPool.filter(function(c) {
            return c.format === 'STANDARD';
        });
    }
    while (audioContainer.firstChild) {
        audioContainer.removeChild(audioContainer.firstChild);
    }
    sounds = [];
    availableSoundIndexes = [];
    seedCards(10);
}

function restartGame() {
    while (audioContainer.firstChild) {
        audioContainer.removeChild(audioContainer.firstChild);
    }
    timer = MAX_TIMER + 1;
    sounds = [];
    availableSoundIndexes = [];
    currentScore = 0;
    currentSoundIndex = 0;
    timerElement.innerHTML = 'Type to begin';
    currentScoreElement.innerHTML = 'Score: ' + currentScore;
    inputBox.value = '';
    updateUIForInput('');
    seedCards(10);
    document.getElementById("skip-button").setAttribute('disabled', 1);
    document.getElementById("controls").style.display = "block";
    document.getElementById("endgame").style.display = "none";
    document.getElementById("sounds-you-heard-container").style.display = "none";        
    inputBox.focus();
}

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
    img.src = IMG_BASE_URL + card.img;
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
        if (getGameState() === NEW_GAME_STATE) {
            // We show a more helpful UI here than 3 blank cards
            var instructionsElement = document.querySelector('.newgame-help-blanket').cloneNode(true);
            instructionsElement.removeAttribute('id');
            updateSettingsUIFromStorage(instructionsElement);
            instructionsElement.style.display = 'flex';
            suggestionsList.appendChild(instructionsElement);
        } else {
            for (var i = 0; i < suggestions.length; i++) {
                var isSelected = (i === 0 && getGameState() === IN_GAME_STATE); 
                var li = createSuggestionElement(suggestions[i], isSelected);
                suggestionsList.appendChild(li);
            }
        }
    }
}

function timerStart() {
    decrementTimer(1);
    timerInterval = setInterval(function () {
        decrementTimer(1);
    }, 1000);
}