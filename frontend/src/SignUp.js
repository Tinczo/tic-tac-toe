import React, { useState } from 'react';
import UserPool from "./UserPool";
import "./Cognito.css";

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setPreview(URL.createObjectURL(file));
    };


    const snsSubscribe = async () => {

        
        const ip = process.env.REACT_APP_BACKEND_IP;
        const url = `http://${ip}:8080/sns/subscribe`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email})
        });
    
        // if (!response.ok) {
        //     const errorMessage = await response.text();
        //     throw new Error(`Request failed: ${errorMessage}`);
        // }
    
        // const data = await response.json();
        // return data;
    };

    const uploadToBackend = async (file) => {
        const formData = new FormData();
        const fileName = username;
        const renamedFile = new File([file], fileName, { type: file.type });
    
        formData.append('file', renamedFile);
    
        const ip = process.env.REACT_APP_BACKEND_IP;
        const url = `http://${ip}:8080/upload/picture`;
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Failed to upload file');
            }
    
            console.log('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    const manageSignUp = async (e) => {
        e.preventDefault();

        if (!profilePicture) {
            alert('Please select a profile picture before signing up.');
            return;
        }

        const attributeList = [];

        const dataEmail = {
            Name: 'email',
            Value: email,
        };

        attributeList.push(dataEmail);

        UserPool.signUp(username, password, attributeList, null, async function (err, result) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());

            const verificationCode = prompt('Please input verification code: ', '');

            if (verificationCode) {
                cognitoUser.confirmRegistration(verificationCode, false, async function (err, result) {
                    if (err) {
                        alert(err.message || JSON.stringify(err));
                        return;
                    }
                    console.log('call result: ' + result);
                    if (profilePicture) {
                        await uploadToBackend(profilePicture);
                        await snsSubscribe();
                    }

                });
            } else {
                console.log("User cancelled verification code input");
            }
        });
    };

    return (
        <div className="text-center" id="loginBox">
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
                <input
                    className="loginInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {preview && <img src={preview} alt="Podgląd zdjęcia profilowego" style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover' }} />}
                <button className="loginButton" type="submit">Zarejestruj się</button>
            </form>
        </div>
    );
};

export default SignUp;
