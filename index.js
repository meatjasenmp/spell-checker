const fs = require('fs');
const path = require('path');
const rl = require('readline');

const dictionaryFile = fs.readFileSync(path.join(__dirname, './', 'dictionary.txt'), 'utf8');
const dictionary = dictionaryFile.split('\n');

const fileToSpellCheck = rl.createInterface({
    input: fs.createReadStream(path.join(__dirname, './', 'text.txt'), 'utf8')
});
const existInDictionary = (arr, wordToFind) => {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (arr[middle] === wordToFind) {
            return true
        } else if (arr[middle] < wordToFind) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }

    return false;
};

const getSuggestedWords = (wordToFind) => {
    const suggestedWords = [];
    dictionary.filter((word) => {
        if (word.substring(0, 4) === wordToFind.substring(0, 4)) suggestedWords.push(word);
    });
    console.log(`Suggested words for ${wordToFind}:\n${suggestedWords.join('\n')}`);
};

const getIncorrectlySpelledWords = (arr) => {
    if (arr.length === 0) return;

    console.log(`Total number of incorrect words: ${arr.length}`);
    console.log(`Incorrect words: ${arr.join(', ')}`);

    for (let i = 0; i < arr.length; i++) {
        getSuggestedWords(arr[i]);
    }
}

const spellCheckTextFile = () => {
    const incorrectWords = [];
    fileToSpellCheck.on('line', (line) => {
        const words = line.split(' ');
        for(let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^a-zA-Z ]/g, "").toLowerCase();
            if (!existInDictionary(dictionary, word)) incorrectWords.push(word);
        }
    }).on('close', () => {
        getIncorrectlySpelledWords(incorrectWords);
    });
}

spellCheckTextFile();
