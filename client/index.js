import angular from 'angular';
import axios from 'axios';
import './scss/style.scss'

let hangmanApp = angular.module('hangmanApp', []);

hangmanApp.controller('hangmanController', ['$scope', ($scope) => {
    $scope.wins = 0;
    $scope.losses = 0;
    $scope.init = () => {
        $scope.guesses = [];
        $scope.answer = [];
        $scope.gameLost = false;
        $scope.gameWon = false;
        $scope.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({ guessed: false, letter, correct: false }));
        axios.get('/num-letters', { params: { userKey } }).then((res) => {
            const numLetters = res.data.numLetters;
            $scope.$apply(() => {
                $scope.answer = new Array(numLetters);
            });
        })
    }
    $scope.init();
    $scope.guess = (guess, index) => {
        axios.post('/guess', { guess: guess.letter, userKey })
        .then((res) => {
            const correct = res.data.correct,
                answer = res.data.answer,
                indexes = res.data.indexes;
            $scope.$apply(() => {
                let letters = $scope.letters;
                letters[index].guessed = true;
                letters[index].correct = correct;
                $scope.letters = letters;
            })

            if (correct) {
                $scope.correctGuess(guess.letter, indexes);
            } else {
                $scope.wrongGuess(guess.letter, answer);
            }
        })
    }
    $scope.correctGuess = (letter, indexes) => {
        let answer = $scope.answer;
        for (let i = 0; i < indexes.length; i++) {
            answer[indexes[i]] = letter;
        }
        if (answer.join('').length === answer.length) {
            $scope.gameWonState();
        }
        $scope.$apply(() => {
            $scope.answer = answer;
        })
    }
    $scope.wrongGuess = (letter, answer) => {
        $scope.$apply(() => {
            $scope.guesses.push(letter);
        })

        // draw the hangman
        if (answer !== null) {
            $scope.gameLostState(answer)
        }
    }
    $scope.gameWonState = () => {
        $scope.$apply(() => {
            $scope.wins++;
            $scope.gameWon = true;
        });
    }
    $scope.gameLostState = (answer) => {
        $scope.$apply(() => {
            $scope.losses++;
            $scope.gameLost = true;
            // change the guesses to the answer
            $scope.answer = answer.split('');
        })
    }
    $scope.reset = () => {
        axios.get('/reset').then((res) => {
            if (res.data.reset) {
                userKey = res.data.userKey;
                $scope.init();
            }
        })
    }
}]);
