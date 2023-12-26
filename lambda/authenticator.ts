// const { DynamoDB, Lambda } = require('aws-sdk');
// exports.signUpHandler = async function(event) {
//     console.log("request:", JSON.stringify(event, undefined, 2));
//     return {
//         statusCode: 200,
//         headers: { "Content-Type": "text/plain" },
//         body: `Hello This is SIGN_UP V2`
//     };
// };
//
// exports.signInHandler = async function(event) {
//     console.log("request:", JSON.stringify(event, undefined, 2));
//     return {
//         statusCode: 200,
//         headers: { "Content-Type": "text/plain" },
//         body: `Hello This is SIGN_IN`
//     };
// };
//
// exports.authorizationHandler = async function(event) {
//     console.log("request:", JSON.stringify(event, undefined, 2));
//     const lambda = new Lambda({region:'us-east-1'});
//     const resp = await lambda.invoke({
//         FunctionName: process.env.DOWNSTREAM_MAKE_APPOINTMENT_FUNCTION_NAME,
//         Payload: JSON.stringify(event)
//     }).promise();
//
//     return {
//         statusCode: 200,
//         headers: { "Content-Type": "text/plain" },
//         body: resp.Payload
//     };
// };
