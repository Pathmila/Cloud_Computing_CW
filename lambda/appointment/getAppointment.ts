import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: process.env.REGION,
    });
    const tableName = process.env.APPOINTMENTS_TABLE_NAME as string;

    const scanResult = await dynamoDB.scan({ TableName: tableName }).promise();
    const appointments = scanResult.Items;
    console.log("Retrieved Appointments:", JSON.stringify(appointments));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointments),
    };
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    throw error;
  }
};
