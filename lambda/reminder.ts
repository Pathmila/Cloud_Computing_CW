import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // const sqs = new AWS.SQS({ region: "us-east-1" });
    // console.log("Hourly reminder!");
    // console.log(process.env.REMINDER_QUEUE_URL);
    // await sqs
    //   .sendMessage({
    //     QueueUrl: process.env.REMINDER_QUEUE_URL as string,
    //     MessageBody: "sample1",
    //   })
    //   .promise();

    const ses = new AWS.SES({ region: "us-east-2" });
    const params = {Source: "thisera.sajith@gmail.com", Destination:{ToAddresses:["sajith.waruna@yahoo.com"]}, Message:{Subject:{Data:"Test!!!"}, Body:{Text:{Data:"Test body!"}}}}
    ses.sendEmail(params).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Email sent!`,
    };
  } catch (error) {
    console.log("Reminder-ERROR", error);
    throw error;
  }
};
