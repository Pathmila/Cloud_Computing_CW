const { DynamoDB, Lambda } = require('aws-sdk');
exports.createAppointment = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const dynamoDB = new DynamoDB();

    await dynamoDB.putItem({
        TableName: process.env.APPOINTMENTS_TABLE_NAME,
        Item: {
            "Patient" : {"S": "Joe"}
        }
    }).promise()

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello appointment made for you!`
    };
};