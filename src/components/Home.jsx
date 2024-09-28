
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Icon from '@mdi/react';
import { mdiCubeOutline } from '@mdi/js';

const Home = () => (
    <>
        <Helmet><title>GiftQuizzer</title></Helmet>
        <div id="home">
            <section>
                <div style={{ textAlign: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Icon path={mdiCubeOutline} size={4} color='orange' />
                </div>
                </div>
                <h1>GiftQuizzer</h1>
                <div className="play-button-container">
                    <ul>
                        <li><Link className="play-button" to="/play/instructions">Play</Link></li>
                    </ul>
                </div>
                {/* <div className="auth-container">
                    <Link to="/login" className="auth-buttons" id="login-button">Login</Link>
                    <Link to="/register" className="auth-buttons" id="signup-button">Sign up</Link>
                </div> */}
            </section>
        </div>
    </>
);

export default Home;