import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';
import { Appointment } from "../lib/cdk-healthcare-app-appointment";

interface IAppointment{
  patientid: string;
  doctorname: string;
  appointmenttime: string;
  date: string;
}

interface IAppointment{
  patientid: string;
  appointmentid: string;
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

    let patientid_uuid = uuidv4();
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    await dynamoDB
      .put({
        TableName: process.env.APPOINTMENTS_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: patientid_uuid ,
          doctorname: payload.doctorname,
          appointmenttime: payload.appointmenttime,
          date: payload.date,
          createdat: Date.now()
        },
      })
      .promise();

      await dynamoDB
      .put({
        TableName: process.env.NOTIFICATION_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: patientid_uuid ,          
          appointmenttime: "7.30",
          date: payload.date,
          createdat: Date.now()
        },
      })
      .promise();

      await dynamoDB
      .put({
        TableName: process.env.NOTIFICATION_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: patientid_uuid ,          
          appointmenttime: "8.15",
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
