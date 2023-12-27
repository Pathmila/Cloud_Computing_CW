import { Lambda } from "aws-sdk";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const lambda = new Lambda({ region: "us-west-2" });
  const resp = await lambda
    .invoke({
      FunctionName: process.env
        .DOWNSTREAM_MAKE_APPOINTMENT_FUNCTION_NAME as string,
      Payload: JSON.stringify(event),
    })
    .promise();

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: resp.Payload as string,
  };
};
