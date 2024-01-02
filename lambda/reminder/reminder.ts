import { DynamoDBStreamEvent, DynamoDBRecord } from "aws-lambda";
import * as AWS from "aws-sdk";

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handler = async (
  event: DynamoDBStreamEvent,
): Promise<LambdaResponse> => {
  console.log("Event", event);
  try {
    const ses = new AWS.SES({ region: process.env.REGION });

    for (const record of event.Records) {
      console.log("Stream record: ", JSON.stringify(record, null, 2));

      if (record.eventName === "REMOVE") {
        const dynamoDBRecord = record as DynamoDBRecord;
        const recipient = dynamoDBRecord.dynamodb!.OldImage!.Email.S;
        const when = dynamoDBRecord.dynamodb!.OldImage!.RemindAt.S;

        if (recipient != undefined) {
          const message =
            dynamoDBRecord.dynamodb!.OldImage!.ReminderType.S ==
            "60_Minutes_Before"
              ? "You have one hour for your appointment!"
              : "You have only 15 minutes for your appointment!";

          const params = {
            Source: "thisera.sajith@gmail.com",
            Destination: { ToAddresses: [recipient].filter(Boolean) },
            Message: {
              Subject: { Data: "Reminder!" },
              Body: { Text: { Data: message } },
            },
          };

          await ses.sendEmail(params).promise();
          console.log(`Email sent to ${recipient}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: `Email sent!`,
    };
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};
