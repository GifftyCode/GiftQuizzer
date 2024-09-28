import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import M from 'materialize-css';
import classnames from 'classnames';

import questionsData from '../../questions.json';
import isEmpty from '../../utils/is-empty';

import correctNotification from '../../assets/audio/correct-answer.mp3';
import wrongNotification from '../../assets/audio/wrong-answer.mp3';
import buttonSound from '../../assets/audio/button-sound.mp3';

const Play = (props) => {
    const [quizState, setQuizState] = useState({
        questions: questionsData,
        currentQuestion: {},
        nextQuestion: {},
        previousQuestion: {},
        answer: '',
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
        numberOfQuestions: 0,
        numberOfAnsweredQuestions: 0,
        time: {},
    });

    const correctSound = useRef();
    const wrongSound = useRef();
    const buttonSoundRef = useRef();
    let interval = useRef(null);

    useEffect(() => {
        displayQuestions();
        startTimer();
        return () => {
            clearInterval(interval.current);
        };
    }, [quizState.currentQuestionIndex]);

    const displayQuestions = () => {
        if (!isEmpty(quizState.questions)) {
            const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
            const nextQuestion = quizState.questions[quizState.currentQuestionIndex + 1];
            const previousQuestion = quizState.questions[quizState.currentQuestionIndex - 1];
            const answer = currentQuestion.answer;

            setQuizState(prevState => ({
                ...prevState,
                currentQuestion,
                nextQuestion,
                previousQuestion,
                answer,
                numberOfQuestions: quizState.questions.length,
                previousRandomNumbers: [],
            }));
            handleDisableButton();
        }
    };

    const handleOptionClick = (e) => {
        if (e.target.innerHTML.toLowerCase() === quizState.answer.toLowerCase()) {
            setTimeout(() => correctSound.current.play(), 500);
            correctAnswer();
        } else {
            setTimeout(() => wrongSound.current.play(), 500);
            wrongAnswer();
        }
    };

    const handleNextButtonClick = () => {
        playButtonSound();
        if (quizState.nextQuestion !== undefined) {
            setQuizState(prevState => ({
                ...prevState,
                currentQuestionIndex: prevState.currentQuestionIndex + 1
            }));
        }
    };

    const handlePreviousButtonClick = () => {
        playButtonSound();
        if (quizState.previousQuestion !== undefined) {
            setQuizState(prevState => ({
                ...prevState,
                currentQuestionIndex: prevState.currentQuestionIndex - 1
            }));
        }
    };

    const handleQuitButtonClick = () => {
        playButtonSound();
        if (window.confirm('Are you sure you want to quit?')) {
            props.history.push('/');
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
        buttonSoundRef.current.play();
    };

    const correctAnswer = () => {
        M.toast({
            html: 'Correct Answer!',
            classes: 'toast-valid',
            displayLength: 1500
        });
        setQuizState(prevState => ({
            ...prevState,
            score: prevState.score + 1,
            correctAnswers: prevState.correctAnswers + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1,
            currentQuestionIndex: quizState.nextQuestion === undefined ? prevState.currentQuestionIndex : prevState.currentQuestionIndex + 1
        }));
    };

    const wrongAnswer = () => {
        navigator.vibrate(1000);
        M.toast({
            html: 'Wrong Answer!',
            classes: 'toast-invalid',
            displayLength: 1500
        });
        setQuizState(prevState => ({
            ...prevState,
            wrongAnswers: prevState.wrongAnswers + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1,
            currentQuestionIndex: quizState.nextQuestion === undefined ? prevState.currentQuestionIndex : prevState.currentQuestionIndex + 1
        }));
    };

    const handleDisableButton = () => {
        setQuizState(prevState => ({
            ...prevState,
            previousButtonDisabled: prevState.previousQuestion === undefined || prevState.currentQuestionIndex === 0,
            nextButtonDisabled: prevState.nextQuestion === undefined || prevState.currentQuestionIndex + 1 === prevState.numberOfQuestions,
        }));
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
                setQuizState(prevState => ({
                    ...prevState,
                    time: { minutes: 0, seconds: 0 }
                }));
                endGame();
            } else {
                setQuizState(prevState => ({
                    ...prevState,
                    time: { minutes, seconds, distance }
                }));
            }
        }, 1000);
    };

    const endGame = () => {
        alert('Quiz has ended!');
        const playerStats = {
            score: quizState.score,
            numberOfQuestions: quizState.numberOfQuestions,
            numberOfAnsweredQuestions: quizState.correctAnswers + quizState.wrongAnswers,
            correctAnswers: quizState.correctAnswers,
            wrongAnswers: quizState.wrongAnswers,
            fiftyFiftyUsed: 2 - quizState.fiftyFifty,
            hintsUsed: 5 - quizState.hints
        };
        setTimeout(() => {
            props.history.push('/play/quizSummary', playerStats);
        }, 1000);
    };

    return (
        <>
            <Helmet><title>Quiz Page</title></Helmet>
            <>
                <audio ref={correctSound} src={correctNotification}></audio>
                <audio ref={wrongSound} src={wrongNotification}></audio>
                <audio ref={buttonSoundRef} src={buttonSound}></audio>
            </>
            <div className="questions">
                <h2>Quiz Mode</h2>
                <div className="lifeline-container">
                    <p>
                        <span onClick={handleFiftyFifty} className="mdi mdi-set-center mdi-24px lifeline-icon">
                            <span className="lifeline">{quizState.fiftyFifty}</span>
                        </span>
                    </p>
                    <p>
                        <span onClick={handleHints} className="mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon">
                            <span className="lifeline">{quizState.hints}</span>
                        </span>
                    </p>
                </div>
                <div className="timer-container">
                    <p>
                        <span className="left" style={{ float: 'left' }}>{quizState.currentQuestionIndex + 1} of {quizState.numberOfQuestions}</span>
                        <span className={classnames('right valid', {
                            'warning': quizState.time.distance <= 120000,
                            'invalid': quizState.time.distance < 30000
                        })}>
                            {quizState.time.minutes}:{quizState.time.seconds}
                            <span className="mdi mdi-clock-outline mdi-24px"></span></span>
                    </p>
                </div>
                <h5>{quizState.currentQuestion.question}</h5>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{quizState.currentQuestion.optionA}</p>
                    <p onClick={handleOptionClick} className="option">{quizState.currentQuestion.optionB}</p>
                </div>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{quizState.currentQuestion.optionC}</p>
                    <p onClick={handleOptionClick} className="option">{quizState.currentQuestion.optionD}</p>
                </div>

                <div className="button-container">
                    <button 
                        className={classnames('', {'disable': quizState.previousButtonDisabled})}
                        id="previous-button" 
                        onClick={handleButtonClick}>
                        Previous
                    </button>
                    <button 
                        className={classnames('', {'disable': quizState.nextButtonDisabled})}
                        id="next-button" 
                        onClick={handleButtonClick}>
                        Next
                    </button>
                    <button 
                        id="quit-button" 
                        onClick={handleButtonClick}>
                        Quit
                    </button>
                </div>
            </div>
        </>
    );
};

export default Play;
