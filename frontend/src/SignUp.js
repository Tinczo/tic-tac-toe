import React, { useState } from 'react';
import UserPool from "./UserPool";
import "./Cognito.css";
import AWS from 'aws-sdk';

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

    const uploadToS3 = async (file, username) => {
        // Konfiguracja AWS SDK bez poświadczeń - używamy domyślnych poświadczeń instancji EC2
        AWS.config.update({ region: process.env.REACT_APP_AWS_REGION });

        const s3 = new AWS.S3();

        const extension = file.name.split('.').pop();
        const key = `${username}.${extension}`;

        const params = {
            Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: file.type,
        };

        try {
            await s3.upload(params).promise();
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
                        await uploadToS3(profilePicture, username);
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
