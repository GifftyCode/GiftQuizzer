import React from 'react'
import { Link } from 'react-router-dom';

import { Helmet } from 'react-helmet'
import Icon from '@mdi/react';
import { mdiCubeOutline } from '@mdi/js';

const Home = () => {
  return (
    <>
    <Helmet><title>GiftQuizzer</title></Helmet>
    <div id="home">
        <section>
            <div>
            <Icon path={mdiCubeOutline} size={2} />
            </div>
            <h1>GiftQuizzer</h1>
            <div className="play-button-container">
                <ul>
                    <li>
                    <Link to="/play/instructions" rel="noopener noreferrer">Play</Link>
                    </li>
                </ul>
            </div>
            <div className="auth-container">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        </section>
    </div>
    </>
  )
}

export default Home