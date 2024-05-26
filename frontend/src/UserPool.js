import { CognitoUserPool } from 'amazon-cognito-identity-js'

const poolData = {
    // UserPoolId: "us-east-1_Bc3O21DMG",
    // ClientId: "4ftl7qgktrsdk3b4spcp278qob"
    UserPoolId: process.env.REACT_APP_USER_POOL_ID,
    ClientId: process.env.REACT_APP_CLIENT_ID
}
// console.log("UserPoolId: ", process.env.REACT_APP_USER_POOL_ID);
// console.log("ClientId: ", process.env.REACT_APP_CLIENT_ID);

export default new CognitoUserPool(poolData);