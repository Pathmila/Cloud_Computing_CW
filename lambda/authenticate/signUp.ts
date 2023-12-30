import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("request:", JSON.stringify(event, undefined, 2));

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello This is SIGN_UP V2`,
    };
  } catch (error) {
    console.log("Appointment-ERROR", error);
    throw error;
  }
};