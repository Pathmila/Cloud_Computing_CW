import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { uuid } from 'uuidv4';
import { Appointment } from "../lib/cdk-healthcare-app-appointment";

interface IAppointment{
  patientid: string;
  doctorname: string;
  appointmenttime: string;
  date: string;
}

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const payload:IAppointment = JSON.parse(event.body as string);
    console.log("appointment paylod", payload);

    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    await dynamoDB
      .put({
        TableName: process.env.APPOINTMENTS_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: uuid() ,
          doctorname: payload.doctorname,
          appointmenttime: payload.appointmenttime,
          date: payload.date,
          createdat: Date.now()
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
