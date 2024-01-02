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

    if (event.Records[0].eventName === "REMOVE") {
      console.log(event.Records[0].dynamodb?.OldImage);
      const record = event.Records.map((record) => {
        return {
          // @ts-ignore
          ...AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage),
        };
      });
      for (const item of record) {
        console.log("item", item);
        const user = await getCognitoUser(item.patient_id);
        console.log("user", user);

        const message =
          item.reminderType === "60_Minutes_Before"
            ? "You have one hour for your appointment!"
            : "You have only 15 minutes for your appointment!";

        const emailObj = user.UserAttributes?.filter(
          (e) => e.Name === "email",
        ) as { Value: string }[];

        await sendEmail(emailObj[0].Value as string, message);
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

const getCognitoUser = async (username: string) => {
  console.log("getCognitoUser", { username });
  try {
    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider({ region: process.env.REGION });

    const params = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID as string,
    };
    const result = await cognitoIdentityServiceProvider
      .adminGetUser(params)
      .promise();
    console.log("result", result);
    return result;
  } catch (error) {
    console.log("getCognitoUser-Error:", error);
    throw error;
  }
};

const sendEmail = async (userEmail: string, message: string) => {
  console.log("sendEmail", { userEmail, message });
  try {
    const ses = new AWS.SES({ region: process.env.REGION });

    const params = {
      Source: "thisera.sajith@gmail.com",
      Destination: { ToAddresses: [userEmail] },
      Message: {
        Subject: { Data: "Reminder!" },
        Body: { Text: { Data: message } },
      },
    };

    await ses.sendEmail(params).promise();
    return;
  } catch (error) {
    console.log("getCognitoUser-Error:", error);
    throw error;
  }
};
