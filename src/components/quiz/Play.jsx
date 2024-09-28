import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import M from 'materialize-css';
import classnames from 'classnames';

import questions from '../../questions.json';
import isEmpty from '../../utils/is-empty';

import correctNotification from '../../assets/audio/correct-answer.mp3';
import wrongNotification from '../../assets/audio/wrong-answer.mp3';
import buttonSound from '../../assets/audio/button-sound.mp3';

import Icon from '@mdi/react';
import { mdiSetCenter, mdiLightbulbOnOutline, mdiClockOutline } from '@mdi/js';

const Play = () => {
    const [currentState, setCurrentState] = useState({
        questions,
        currentQuestion: {},
        nextQuestion: {},
        previousQuestion: {},
        answer: '',
        numberOfQuestions: 0,
        numberOfAnsweredQuestions: 0,
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        hints: 5,
        fiftyFifty: 2,
        usedFiftyFifty: false,
        nextButtonDisabled: false,
        previousButtonDisabled: true,
        previousRandomNumbers: [],
        time: {
            minutes: 0,
            seconds: 0,
            distance: 0
        }
    });
    
    const navigate = useNavigate();
    const interval = useRef(null);
    const correctSound = useRef(null);
    const wrongSound = useRef(null);
    const buttonSound = useRef(null);

    const displayQuestions = useCallback((
        questions = currentState.questions,
        currentQuestion,
        nextQuestion,
        previousQuestion
    ) => {
        let { currentQuestionIndex } = currentState;
        if (!isEmpty(currentState.questions)) {
            questions = currentState.questions;
            currentQuestion = questions[currentQuestionIndex];
            nextQuestion = questions[currentQuestionIndex + 1];
            previousQuestion = questions[currentQuestionIndex - 1];
            const answer = currentQuestion.answer;
            setCurrentState(prevState => ({
                ...prevState,
                currentQuestion,
                nextQuestion,
                previousQuestion,
                numberOfQuestions: questions.length,
                answer,
                previousRandomNumbers: []
            }));
        }
        showOptions();
        handleDisableButton();
    }, [currentState]);

    useEffect(() => {
        displayQuestions(
            questions,
            currentState.currentQuestion,
            currentState.nextQuestion,
            currentState.previousQuestion
        );
        startTimer();
        return () => {
            clearInterval(interval.current);
        };
    }, [displayQuestions]);

    

    const handleOptionClick = (e) => {
        if (e.target.innerHTML.toLowerCase() === currentState.answer.toLowerCase()) {
            setTimeout(() => {
                correctSound.current.play();
            }, 500);
            correctAnswer();
        } else {
            setTimeout(() => {
                wrongSound.current.play();
            }, 500);
            wrongAnswer();
        }
    };

    const handleButtonClick = (e) => {
        switch (e.target.id) {
            case 'next-button':
                handleNextButtonClick();
                break;
            case 'previous-button':
                handlePreviousButtonClick();
                break;
            case 'quit-button':
                handleQuitButtonClick();
                break;
            default:
                break;
        }
    };

    const playButtonSound = () => {
        buttonSound.current.play();
    };

    const handleNextButtonClick = () => {
        playButtonSound();
        if (currentState.nextQuestion !== undefined) {
            setCurrentState(prevState => ({
                ...prevState,
                currentQuestionIndex: prevState.currentQuestionIndex + 1
            }));
            displayQuestions(
                currentState.questions,
                currentState.currentQuestion,
                currentState.nextQuestion,
                currentState.previousQuestion
            );
        }
    };

    const handlePreviousButtonClick = () => {
        playButtonSound();
        if (currentState.previousQuestion !== undefined) {
            setCurrentState(prevState => ({
                ...prevState,
                currentQuestionIndex: prevState.currentQuestionIndex - 1
            }));
            displayQuestions(
                currentState.questions,
                currentState.currentQuestion,
                currentState.nextQuestion,
                currentState.previousQuestion
            );
        }
    };

    const handleQuitButtonClick = () => {
        playButtonSound();
        if (window.confirm('Are you sure you want to quit?')) {
            navigate('/');
        }
    };

    const correctAnswer = () => {
        M.toast({
            html: 'Correct Answer!',
            classes: 'toast-valid',
            displayLength: 1500
        });
        setCurrentState(prevState => ({
            ...prevState,
            score: prevState.score + 1,
            correctAnswers: prevState.correctAnswers + 1,
            currentQuestionIndex: prevState.currentQuestionIndex + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1
        }));

        if (currentState.nextQuestion === undefined) {
            endGame();
        } else {
            displayQuestions(
                currentState.questions,
                currentState.currentQuestion,
                currentState.nextQuestion,
                currentState.previousQuestion
            );
        }
    };

    const wrongAnswer = () => {
        navigator.vibrate(1000);
        M.toast({
            html: 'Wrong Answer!',
            classes: 'toast-invalid',
            displayLength: 1500
        });
        setCurrentState(prevState => ({
            ...prevState,
            wrongAnswers: prevState.wrongAnswers + 1,
            currentQuestionIndex: prevState.currentQuestionIndex + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1
        }));

        if (currentState.nextQuestion === undefined) {
            endGame();
        } else {
            displayQuestions(
                currentState.questions,
                currentState.currentQuestion,
                currentState.nextQuestion,
                currentState.previousQuestion
            );
        }
    };

    const showOptions = () => {
        const options = Array.from(document.querySelectorAll('.option'));

        options.forEach(option => {
            option.style.visibility = 'visible';
        });

        setCurrentState(prevState => ({
            ...prevState,
            usedFiftyFifty: false
        }));
    };

    const handleHints = () => {
        if (currentState.hints > 0) {
            const options = Array.from(document.querySelectorAll('.option'));
            let indexOfAnswer;

            options.forEach((option, index) => {
                if (option.innerHTML.toLowerCase() === currentState.answer.toLowerCase()) {
                    indexOfAnswer = index;
                }
            });

            while (true) {
                const randomNumber = Math.round(Math.random() * 3);
                if (randomNumber !== indexOfAnswer && !currentState.previousRandomNumbers.includes(randomNumber)) {
                    options.forEach((option, index) => {
                        if (index === randomNumber) {
                            option.style.visibility = 'hidden';
                            setCurrentState(prevState => ({
                                ...prevState,
                                hints: prevState.hints - 1,
                                previousRandomNumbers: prevState.previousRandomNumbers.concat(randomNumber)
                            }));
                        }
                    });
                    break;
                }
                if (currentState.previousRandomNumbers.length >= 3) break;
            }
        }
    };

    const handleFiftyFifty = () => {
        if (currentState.fiftyFifty > 0 && currentState.usedFiftyFifty === false) {
            const options = document.querySelectorAll('.option');
            const randomNumbers = [];
            let indexOfAnswer;

            options.forEach((option, index) => {
                if (option.innerHTML.toLowerCase() === currentState.answer.toLowerCase()) {
                    indexOfAnswer = index;
                }
            });

            let count = 0;
            do {
                const randomNumber = Math.round(Math.random() * 3);
                if (randomNumber !== indexOfAnswer) {
                    if (randomNumbers.length < 2 && !randomNumbers.includes(randomNumber) && !randomNumbers.includes(indexOfAnswer)) {
                        randomNumbers.push(randomNumber);
                        count++;
                    } else {
                        while (true) {
                            const newRandomNumber = Math.round(Math.random() * 3);
                            if (!randomNumbers.includes(newRandomNumber) && newRandomNumber !== indexOfAnswer) {
                                randomNumbers.push(newRandomNumber);
                                count++;
                                break;
                            }
                        }
                    }
                }
            } while (count < 2);

            options.forEach((option, index) => {
                if (randomNumbers.includes(index)) {
                    option.style.visibility = 'hidden';
                }
            });
            setCurrentState(prevState => ({
                ...prevState,
                fiftyFifty: prevState.fiftyFifty - 1,
                usedFiftyFifty: true
            }));
        }
    };

    const startTimer = () => {
        const countDownTime = Date.now() + 180000;
        interval.current = setInterval(() => {
            const now = new Date();
            const distance = countDownTime - now;

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                clearInterval(interval.current);
                setCurrentState(prevState => ({
                    ...prevState,
                    time: {
                        minutes: 0,
                        seconds: 0
                    }
                }));
                endGame();
            } else {
                setCurrentState(prevState => ({
                    ...prevState,
                    time: {
                        minutes,
                        seconds,
                        distance
                    }
                }));
            }
        }, 1000);
    };

    const handleDisableButton = () => {
        setCurrentState(prevState => ({
            ...prevState,
            previousButtonDisabled: prevState.previousQuestion === undefined || prevState.currentQuestionIndex === 0,
            nextButtonDisabled: prevState.nextQuestion === undefined || prevState.currentQuestionIndex + 1 === prevState.numberOfQuestions
        }));
    };

    const endGame = () => {
        alert('Quiz has ended!');
        const { score, numberOfQuestions, correctAnswers, wrongAnswers, fiftyFifty, hints } = currentState;
        const playerStats = {
            score,
            numberOfQuestions,
            numberOfAnsweredQuestions: correctAnswers + wrongAnswers,
            correctAnswers,
            wrongAnswers,
            fiftyFiftyUsed: 2 - fiftyFifty,
            hintsUsed: 5 - hints
        };
        setTimeout(() => {
            navigate('/play/quizSummary', { state: playerStats });
        }, 1000);
    };

    return (
        <>
            <Helmet><title>Quiz Page</title></Helmet>
            <>
                <audio ref={correctSound} src={correctNotification}></audio>
                <audio ref={wrongSound} src={wrongNotification}></audio>
                <audio ref={buttonSound} src={buttonSound}></audio>
            </>
            <div className="questions">
                <h2>Quiz Mode</h2>
                <div className="lifeline-container">
                    <p>
                        <span onClick={handleFiftyFifty} className=" lifeline-icon">
                        <Icon path={mdiSetCenter} size={1} />

                            <span className="lifeline">{currentState.fiftyFifty}</span>
                        </span>
                    </p>
                    <p>
                        <span onClick={handleHints} className=" lifeline-icon">
                        <Icon path={mdiLightbulbOnOutline} size={1} />

                            <span className="lifeline">{currentState.hints}</span>
                        </span>
                    </p>
                </div>
                <div className="timer-container">
                    <p className="left">{currentState.currentQuestionIndex + 1} of {currentState.numberOfQuestions}</p>
                    <p className={classnames('right', {
                        'warning': currentState.time.distance <= 120000,
                        'invalid': currentState.time.distance < 30000
                    })}>
                        <span className="timer-text">{currentState.time.minutes}:{currentState.time.seconds}</span>
                        <Icon path={mdiClockOutline} size={1} className="timer-icon" />
                    </p>
                </div>
                <h5>{currentState.currentQuestion.question}</h5>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{currentState.currentQuestion.optionA}</p>
                    <p onClick={handleOptionClick} className="option">{currentState.currentQuestion.optionB}</p>
                </div>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{currentState.currentQuestion.optionC}</p>
                    <p onClick={handleOptionClick} className="option">{currentState.currentQuestion.optionD}</p>
                </div>

                <div className="button-container">
                    <button
                        className={classnames('', { 'disable': currentState.previousButtonDisabled })}
                        id="previous-button"
                        onClick={handleButtonClick}>
                        Previous
                    </button>
                    <button
                        className={classnames('', { 'disable': currentState.nextButtonDisabled })}
                        id="next-button"
                        onClick={handleButtonClick}>
                        Next
                    </button>
                    <button id="quit-button" onClick={handleButtonClick}>Quit</button>
                </div>
            </div>
        </>
    );
};

export default Play;