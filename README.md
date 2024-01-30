# spell-checker

### Running the program

`node spell-checker dictionary.txt text.txt`

## Tasks:
1. Read in the dictionary file
2. Read in the input file
3. Read input file line by line
4. Convert each line into an array of words
5. Check for the existence of each word in the dictionary
6. If the word is not in the dictionary, store the misspelled word, the column number, <br> and the line number in an array of objects
7. List the misspelled words in the order they appear in the input file, with the <br> line number and column number of each word
8. Get suggested spellings for each misspelled word
9. Clean up 
10. Error handling

## Design Decisions

After some research, the Node.js Readline module seemed like a good fit for this problem. It would make it easy to get the line number of each word. <br> And I could use the `close` event to trigger the listing of misspelled words, if any.

Incorrect words would be flagged and stored in a data structure that looks like the following:

```
[{
    word: string,
    lineNo: int,
    column: int
}]
```

```
const spellCheckTextFile = () => {
    const fileToSpellCheck = rl.createInterface({
        input: fs.createReadStream(path.join(__dirname, './', textFile), 'utf8')
    });

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
        listIncorrectWords(incorrectWords);
    });
}
```

After some research on efficient ways to search a large (sorted) array, <br> I decided to use an iterative binary search algorithm to check for the existence of a <br> word in the dictionary.

```
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
```

Next I implemented a function to log misspelled words to the console.

```
const listIncorrectWords = (arr) => {
    if (arr.length === 0) {
        console.info('No incorrectly spelled words found!');
        return;
    }
    
    console.info(`Total number of incorrect words: ${arr.length} \n`);
    arr.forEach((item) => {
        console.info(`${item.word} at line ${item.lineNo}, column ${item.column}`);
        getSuggestedWords(item.word);
    });
};
```

The above implementations are pretty straight forward, I spent the most time on considering how to implement suggested words.

I decided to use a substring of the first four letters of the misspelled word, and compare it to substrings of words found in the dictionary; to find suggested words.

In hindsight this is not the most ideal solution. I was mulling over this after taking note of a few things:
1. It would make more sense to find suggested words based on how close they are to the misspelled word, as in `worldz` <br> should suggest `world and worlds`. Not `worldliness, wordling`, etc.
2. Doing this would limit the number of suggested words to a reasonable amount.

After some research I discovered the Levenshtein distance algorithm. 

This algorithm is used to find the number of changes needed to turn one string into another (you probably all ready know this).

I could then use this algorithm to find suggested words based on the distance between the misspelled word and the suggested word.

That said, I decided to stick with my original implementation.

I was apprehensive about implementing the algorithm and not being able to explain it well. I also wanted to make sure I had enough time to complete the assignment.

```
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

```

## Musings

Things like 'a' would be considered a misspelled word. I would need to implement a way (I imagine regex would fit well here) to ignore words like these.

As far as proper nouns, my thinking was `existInDictionary` could accept an additional param for `dictionary` and `wordToFind` <br> could be checked against the dictionary/array that was passed into the function. 

I could then use a txt file/dictionary of places (New York, Florida, Houston, etc.), people (Michael Jordan), common names, <br> and things (iPhone, etc.) to spell check against. I'm not sure how sustainable this would be. I could see this getting out of hand quickly.

That might very well be the reality of spell checkers. Meaning you capture as much as you can, <br> and then you have to rely on the user to add words to a custom dictionary.

I'd be interested in knowing how you would approach this problem if we have the chance to discuss it.

I would not be at all surprised if I was overthinking this.

I could also see a use case for adding another function called `checkRegExp`  (naming is hard) and using it as an additional check in `existInDictionary`. <br> This would allow for more flexibility in the spell checker. Such as not flagging email address or phone numbers as misspelled words (if they are valid).