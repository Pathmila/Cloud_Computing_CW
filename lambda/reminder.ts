import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler = async (event: APIGatewayEvent): Promise<void> => {
  try {
    const sqs = new AWS.SQS({ region: "us-east-1" });
    console.log("Hourly reminder!");
    console.log(process.env.REMINDER_QUEUE_URL);
    await sqs
      .sendMessage({
        QueueUrl: process.env.REMINDER_QUEUE_URL as string,
        MessageBody: "sample1",
      })
      .promise();
  } catch (error) {
    console.log("Reminder-ERROR", error);
    throw error;
  }
};
