import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import "./Cognito.css"

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const manageSignUp = async(e) => {
        e.preventDefault();

        const attributeList = [];

        const dataEmail = {
              	Name: 'email',
              	Value: email,
              };

        attributeList.push(dataEmail);

        UserPool.signUp(username, password, attributeList, null, function (err, result) {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                    return;
                }
                var cognitoUser = result.user;
                console.log('user name is ' + cognitoUser.getUsername());

                const verificationCode = prompt('Please input verification code: ', '');

                if(verificationCode) {
                    cognitoUser.confirmRegistration(verificationCode, false, function (err, result) {
                    	if (err) {
                    		alert(err.message || JSON.stringify(err));
                    		return;
                    	}
                    	console.log('call result: ' + result);
                    });
                } else {
                    console.log("User cancelled verification code input");
                }
            });


    };

    return (
        <div className="text-center" id="loginBox">
            {
                <form className="registerForm" onSubmit={manageSignUp}>
                    <input
                        className="loginInput"
                        type="text"
                        placeholder="Nazwa użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="loginInput"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="loginInput"
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="loginButton" type="submit">Zarejestruj się</button>
                </form>
            }
        </div>
    );

};

export default SignUp;