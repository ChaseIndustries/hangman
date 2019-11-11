require('@std/esm')

import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
let answers = {},
    guesses = {};

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);


function getRandomWord() {
    return axios({
      "method":"GET",
      "url":"https://wordsapiv1.p.rapidapi.com/words/",
      "headers":{
      "content-type":"application/octet-stream",
      "x-rapidapi-host":"wordsapiv1.p.rapidapi.com",
      "x-rapidapi-key":"137cfea8b7msh307526478de4477p18d919jsn8973158092e2"
      },
      "params":{
        "random":"true",
        "lettersMin": 4,
        "lettersMax": 10
      }
      }).then(res => res.data.word);
}

app.get('/num-letters', (req, res) => {
    const userKey = req.query.userKey,
        answer = answers[userKey] || '';
    res.send({ numLetters: answer.length })
})

app.post('/guess', (req, res) => {
    const body = req.body,
        guess = body.guess,
        userKey = body.userKey,
        answer = answers[userKey] || '',
        guessRegEx = new RegExp(guess, 'ig');
    let indexes = [],
        correct = false,
        match;
    while ((match = guessRegEx.exec(answer)) !== null) {
        indexes.push(match.index);
    }
    if (indexes.length) {
        correct = true;
    } else {
        guesses[userKey].push(guess);
    }
    res.send({ correct, indexes, answer: guesses[userKey].length === 10 ? answer : null })
})

app.get('/', (req, res) => {
    getRandomWord().then((answer) => {
        const timestamp = new Date().getTime();
        answers[timestamp] = answer;
        guesses[timestamp] = [];
        res.render('index', { userKey: timestamp })
    })
})

app.get('/reset', (req, res) => {
    getRandomWord().then((answer) => {
        const timestamp = new Date().getTime();
        answers[timestamp] = answer;
        guesses[timestamp] = [];
        res.send({ reset: true, userKey: timestamp });
    })
})

app.listen(3000, () => {
    console.log('Listening on 3000');
})
