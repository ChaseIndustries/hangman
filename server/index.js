require('@std/esm')

import express from 'express';
import fs from 'fs';
import path from 'path';
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
    return axios.get('http://setgetgo.com/randomword/get.php?len=6')
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
    let i = 0,
        indexes = [],
        correct = false,
        match;
    while ((match = guessRegEx.exec(answer)) != null) {
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
    getRandomWord().then((data) => {
        const timestamp = new Date().getTime(),
            answer = data.data;
        answers[timestamp] = answer;
        guesses[timestamp] = [];
        res.render('index', { userKey: timestamp })
    })
})

app.get('/reset', (req, res) => {
    getRandomWord().then((data) => {
        const timestamp = new Date().getTime(),
            answer = data.data;
        answers[timestamp] = answer;
        guesses[timestamp] = [];
        res.send({ reset: true, userKey: timestamp });
    })
})

app.listen(3000, () => {
    console.log('Listening on 3000');
})
