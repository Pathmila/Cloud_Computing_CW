import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    await dynamoDB
      .put({
        TableName: process.env.APPOINTMENTS_TABLE_NAME as string,
        Item: {
          Patient: "Joe",
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello appointment made for you!`,
    };
  } catch (error) {
    console.log("Appointment-ERROR", error);
    throw error;
  }
};
