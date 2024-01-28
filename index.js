const fs = require('fs');
const path = require('path');
const rl = require('readline');

const dictionaryFile = fs.readFileSync(path.join(__dirname, './', 'dictionary.txt'), 'utf8');
const dictionary = dictionaryFile.split('\n');

const fileToSpellCheck = rl.createInterface({
    input: fs.createReadStream(path.join(__dirname, './', 'text.txt'), 'utf8')
});
const existInDictionary = (wordToFind) => {
    let start = 0;
    let end = dictionary.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (dictionary[middle] === wordToFind) {
            return true
        } else if (dictionary[middle] < wordToFind) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }

    return false;
};

const getSuggestedWords = (incorrectWord) => {
    const suggestedWords = [];
    dictionary.filter((word) => {
        if (word.substring(0, 4) === incorrectWord.substring(0, 4)) suggestedWords.push(word);
    });
    console.info(`Suggested words for ${incorrectWord}:\n${suggestedWords.join('\n')}\n`);
};

const listIncorrectWords = (arr) => {
    console.info(`Total number of incorrect words: ${arr.length}`);
    arr.map((item) => {
        console.info(`${item.word} at line: ${item.lineNo} and column: ${item.column} \n`);
        getSuggestedWords(item.word);
    });
};

const spellCheckTextFile = () => {
    const incorrectWords = [];
    let lineNum = 0;

    fileToSpellCheck.on('line', (line) => {
        lineNum++;
        const words = line.split(' ');
        for(let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^a-zA-Z ]/g, "").toLowerCase();
            if (!existInDictionary(word)) {
                incorrectWords.push({
                    word: word,
                    lineNo: lineNum,
                    column: i + 1
                });
            }
        }
    }).on('close', () => {
        if (incorrectWords.length === 0) {
            console.info('No incorrectly spelled words found!');
            return;
        }
        listIncorrectWords(incorrectWords);
    });
}

spellCheckTextFile();
