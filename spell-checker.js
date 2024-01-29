const fs = require('fs');
const path = require('path');
const rl = require('readline');
const process = require('process')

const dictionaryFile = process.argv[2];
const textFile = process.argv[3];

if (!dictionaryFile || !textFile) {
    console.error('Please provide a dictionary and text file');
    return;
}

if (dictionaryFile && textFile) {
    if (dictionaryFile.split('.')[1] !== 'txt' || textFile.split('.')[1] !== 'txt') {
        console.error('Please provide a .txt file');
        return;
    }

    if (!fs.existsSync(path.join(__dirname, './', dictionaryFile))) {
        console.error('Dictionary file does not exist');
        return;
    }

    if (!fs.existsSync(path.join(__dirname, './', textFile))) {
        console.error('Text file does not exist');
        return;
    }
}

const dictionary = fs.readFileSync(path.join(__dirname, './', dictionaryFile), 'utf8').split('\n');
const fileToSpellCheck = rl.createInterface({
    input: fs.createReadStream(path.join(__dirname, './', textFile), 'utf8')
});

const existInDictionary = (wordToFind) => {
    let start = 0;
    let end = dictionary.length - 1;
    wordToFind = wordToFind.toLowerCase();

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
        if (word.toLowerCase().substring(0, 4) === incorrectWord.toLowerCase().substring(0, 4)) suggestedWords.push(word);
    });
    if (suggestedWords.length === 0) {
        console.info(`No suggested words for ${incorrectWord}\n`)
        return;
    }
    console.info(`Suggested words for ${incorrectWord}:\n${suggestedWords.join('\n')}\n`);
};

const listIncorrectWords = (arr) => {
    console.info(`Total number of incorrect words: ${arr.length} \n`);
    arr.forEach((item) => {
        console.info(`${item.word} at line ${item.lineNo}, column ${item.column}`);
        getSuggestedWords(item.word);
    });
};

const spellCheckTextFile = () => {
    const incorrectWords = [];
    let lineNum = 0;

    fileToSpellCheck.on('line', (line) => {
        const words = line.split(' ');
        lineNum++;
        for(let i = 0; i < words.length; i++) {
            const word = words[i];
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
