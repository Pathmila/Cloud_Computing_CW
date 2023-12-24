const { SQS } = require('aws-sdk');
exports.hourlyReminder = async function(event) {
    const sqs = new SQS({region:'us-east-1'})
    console.log("Hourly reminder!")
    console.log(process.env.REMINDER_QUEUE_URL)
    await sqs.sendMessage({
        QueueUrl:process.env.REMINDER_QUEUE_URL,
        MessageBody: "sample1"
    }).promise()
};
