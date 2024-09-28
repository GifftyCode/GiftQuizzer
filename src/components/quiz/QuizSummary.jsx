import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';

const QuizSummary = () => {
    const [quizStats, setQuizStats] = useState({
        score: 0,
        numberOfQuestions: 0,
        numberOfAnsweredQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        hintsUsed: 0,
        fiftyFiftyUsed: 0
    });

    const location = useLocation();

    useEffect(() => {
        const { state } = location;
        if (state) {
            setQuizStats({
                score: (state.score / state.numberOfQuestions) * 100,
                numberOfQuestions: state.numberOfQuestions,
                numberOfAnsweredQuestions: state.numberOfAnsweredQuestions,
                correctAnswers: state.correctAnswers,
                wrongAnswers: state.wrongAnswers,
                hintsUsed: state.hintsUsed,
                fiftyFiftyUsed: state.fiftyFiftyUsed
            });
        }
    }, [location]);

    const getRemark = (userScore) => {
        if (userScore <= 30) return 'You need more practice!';
        if (userScore > 30 && userScore <= 50) return 'Better luck next time!';
        if (userScore <= 70 && userScore > 50) return 'You can do better!';
        if (userScore >= 71 && userScore <= 84) return 'You did great!';
        return 'You\'re an absolute genius!';
    };

    const stats = location.state ? (
        <>
            <div style={{ textAlign: 'center' }}>
                <span className="mdi mdi-check-circle-outline success-icon"></span>
            </div>
            <h1>Quiz has ended</h1>
            <div className="container stats">
                <h4>{getRemark(quizStats.score)}</h4>
                <h2>Your Score: {quizStats.score.toFixed(0)}&#37;</h2>
                <span className="stat left">Total number of questions: </span>
                <span className="right">{quizStats.numberOfQuestions}</span><br />

                <span className="stat left">Number of attempted questions: </span>
                <span className="right">{quizStats.numberOfAnsweredQuestions}</span><br />

                <span className="stat left">Number of Correct Answers: </span>
                <span className="right">{quizStats.correctAnswers}</span> <br />

                <span className="stat left">Number of Wrong Answers: </span>
                <span className="right">{quizStats.wrongAnswers}</span><br />

                <span className="stat left">Hints Used: </span>
                <span className="right">{quizStats.hintsUsed}</span><br />

                <span className="stat left">50-50 Used: </span>
                <span className="right">{quizStats.fiftyFiftyUsed}</span>
            </div>
            <section>
                <ul>
                    <li>
                        <Link to="/play/quiz">Play Again</Link>
                    </li>
                    <li>
                        <Link to="/">Back to Home</Link>
                    </li>
                </ul>
            </section>
        </>
    ) : (
        <section>
            <h1 className="no-stats">No Statistics Available</h1>
            <ul>
                <li>
                    <Link to="/play/quiz">Take a Quiz</Link>
                </li>
                <li>
                    <Link to="/">Back to Home</Link>
                </li>
            </ul>
        </section>
    );

    return (
        <>
            <Helmet><title>Quiz App - Summary</title></Helmet>
            <div className="quiz-summary">
                {stats}
            </div>
        </>
    );
};

export default QuizSummary;