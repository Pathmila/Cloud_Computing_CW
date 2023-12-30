import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { uuid } from 'uuid';
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

    let patientid_uuid = uuid();
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

      let appointmentTimeStr: string = payload.appointmenttime;
      let appointmentTimeBeforeOneHour: Date = new Date(appointmentTimeStr);
      let appointmentTimeBeforeFifteenMinutes: Date = new Date(appointmentTimeStr);
    
      appointmentTimeBeforeOneHour.setHours(appointmentTimeBeforeOneHour.getHours() - 1);
      appointmentTimeBeforeFifteenMinutes.setMinutes(appointmentTimeBeforeFifteenMinutes.getMinutes() - 15);;
      
      let newAppointmentTimeStrBeforeOneHour: string = appointmentTimeBeforeOneHour.toISOString();
      
      await dynamoDB
      .put({
        TableName: process.env.NOTIFICATION_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: patientid_uuid ,          
          appointmenttime: newAppointmentTimeStrBeforeOneHour,
          date: payload.date,
          createdat: Date.now()
        },
      })
      .promise();
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello before one hour notification made for you!`,
      };

      await dynamoDB
      .put({
        TableName: process.env.NOTIFICATION_TABLE_NAME as string,
        Item: {
          patientid: payload.patientid ,
          appointmentid: patientid_uuid ,          
          appointmenttime: appointmentTimeBeforeFifteenMinutes,
          date: payload.date,
          createdat: Date.now()
        },
      })
      .promise();
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello before fifteen minutes notification made for you!`,
      };

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
