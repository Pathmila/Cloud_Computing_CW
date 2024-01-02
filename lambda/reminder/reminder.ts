import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const ses = new AWS.SES({ region: process.env.REGION });
    const params = {
      Source: "thisera.sajith@gmail.com",
      Destination: { ToAddresses: ["sajith.waruna@yahoo.com"] },
      Message: {
        Subject: { Data: "Test!!!" },
        Body: { Text: { Data: "Test body!" } },
      },
    };
    await ses.sendEmail(params).promise();
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
