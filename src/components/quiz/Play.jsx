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
    const [questions, setQuestions] = useState(questionsData);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [nextQuestion, setNextQuestion] = useState({});
    const [previousQuestion, setPreviousQuestion] = useState({});
    const [answer, setAnswer] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [numberOfAnsweredQuestions, setNumberOfAnsweredQuestions] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [hints, setHints] = useState(5);
    const [fiftyFifty, setFiftyFifty] = useState(2);
    const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
    const [previousRandomNumbers, setPreviousRandomNumbers] = useState([]);
    const [time, setTime] = useState({});
    
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
    }, [currentQuestionIndex]);

    const displayQuestions = (questionsData = questions) => {
        if (!isEmpty(questionsData)) {
            const currentQuestion = questionsData[currentQuestionIndex];
            const nextQuestion = questionsData[currentQuestionIndex + 1];
            const previousQuestion = questionsData[currentQuestionIndex - 1];
            const answer = currentQuestion.answer;
            setCurrentQuestion(currentQuestion);
            setNextQuestion(nextQuestion);
            setPreviousQuestion(previousQuestion);
            setAnswer(answer);
            setNumberOfQuestions(questionsData.length);
            setPreviousRandomNumbers([]);
            handleDisableButton();
        }
    };

    const handleOptionClick = (e) => {
        if (e.target.innerHTML.toLowerCase() === answer.toLowerCase()) {
            setTimeout(() => correctSound.current.play(), 500);
            correctAnswer();
        } else {
            setTimeout(() => wrongSound.current.play(), 500);
            wrongAnswer();
        }
    };

    const handleNextButtonClick = () => {
        playButtonSound();
        if (nextQuestion !== undefined) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePreviousButtonClick = () => {
        playButtonSound();
        if (previousQuestion !== undefined) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
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
        setScore(prevScore => prevScore + 1);
        setCorrectAnswers(prevCorrect => prevCorrect + 1);
        setNumberOfAnsweredQuestions(prevAnswered => prevAnswered + 1);
        if (nextQuestion === undefined) {
            endGame();
        } else {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const wrongAnswer = () => {
        navigator.vibrate(1000);
        M.toast({
            html: 'Wrong Answer!',
            classes: 'toast-invalid',
            displayLength: 1500
        });
        setWrongAnswers(prevWrong => prevWrong + 1);
        setNumberOfAnsweredQuestions(prevAnswered => prevAnswered + 1);
        if (nextQuestion === undefined) {
            endGame();
        } else {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handleDisableButton = () => {
        if (previousQuestion === undefined || currentQuestionIndex === 0) {
            setPreviousButtonDisabled(true);
        } else {
            setPreviousButtonDisabled(false);
        }

        if (nextQuestion === undefined || currentQuestionIndex + 1 === numberOfQuestions) {
            setNextButtonDisabled(true);
        } else {
            setNextButtonDisabled(false);
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
                setTime({ minutes: 0, seconds: 0 });
                endGame();
            } else {
                setTime({ minutes, seconds, distance });
            }
        }, 1000);
    };

    const endGame = () => {
        alert('Quiz has ended!');
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
            props.history.push('/play/quizSummary', playerStats);
        }, 1000);
    };

    return (
        <>
            <Helmet><title>Quiz Page</title></Helmet>
            <Fragment>
                <audio ref={correctSound} src={correctNotification}></audio>
                <audio ref={wrongSound} src={wrongNotification}></audio>
                <audio ref={buttonSoundRef} src={buttonSound}></audio>
            </Fragment>
            <div className="questions">
                <h2>Quiz Mode</h2>
                <div className="lifeline-container">
                    <p>
                        <span onClick={handleFiftyFifty} className="mdi mdi-set-center mdi-24px lifeline-icon">
                            <span className="lifeline">{fiftyFifty}</span>
                        </span>
                    </p>
                    <p>
                        <span onClick={handleHints} className="mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon">
                            <span className="lifeline">{hints}</span>
                        </span>
                    </p>
                </div>
                <div className="timer-container">
                    <p>
                        <span className="left" style={{ float: 'left' }}>{currentQuestionIndex + 1} of {numberOfQuestions}</span>
                        <span className={classnames('right valid', {
                            'warning': time.distance <= 120000,
                            'invalid': time.distance < 30000
                        })}>
                            {time.minutes}:{time.seconds}
                            <span className="mdi mdi-clock-outline mdi-24px"></span></span>
                    </p>
                </div>
                <h5>{currentQuestion.question}</h5>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{currentQuestion.optionA}</p>
                    <p onClick={handleOptionClick} className="option">{currentQuestion.optionB}</p>
                </div>
                <div className="options-container">
                    <p onClick={handleOptionClick} className="option">{currentQuestion.optionC}</p>
                    <p onClick={handleOptionClick} className="option">{currentQuestion.optionD}</p>
                </div>

                <div className="button-container">
                    <button 
                        className={classnames('', {'disable': previousButtonDisabled})}
                        id="previous-button" 
                        onClick={handleButtonClick}>
                        Previous
                    </button>
                    <button 
                        className={classnames('', {'disable': nextButtonDisabled})}
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
 }
  export default Play;