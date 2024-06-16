import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import "./Cognito.css";

const SignOut = () => {

    const manageLogout = async (e) => {
        e.preventDefault();

        const user = UserPool.getCurrentUser();

        if(user) {
            console.log("logout function")
            user.signOut();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            window.location.reload();
        }
    };

    return (
                <button className="logoutButton" onClick={manageLogout}>Wyloguj się</button>
           
    );
};

export default SignOut;