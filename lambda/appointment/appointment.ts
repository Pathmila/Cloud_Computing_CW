import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { extractTokenData } from "../helper";

interface IAppointment {
  patient_id: string;
  doctor_name: string;
  appointment_date_time: string;
  date: string;
}

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("event", event);
    const payload: IAppointment = JSON.parse(event.body as string);
    console.log("appointment payload", payload);

    const patientId = extractTokenData("");

    let appointmentId = uuidv4();
    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: process.env.REGION,
    });

    // appointment record
    await dynamoDB
      .put({
        TableName: process.env.APPOINTMENTS_TABLE_NAME as string,
        Item: {
          patient_id: payload.patient_id,
          appointment_id: appointmentId,
          doctor_name: payload.doctor_name,
          appointment_date_time: payload.appointment_date_time,
          date: payload.date,
          createdat: Date.now(),
        },
      })
      .promise();

    // 1 hour before
    await dynamoDB
      .put({
        TableName: process.env.REMINDER_TABLE_NAME as string,
        Item: {
          appointment_id: appointmentId,
          reminder_id: uuidv4(),
          remind_at: timestampMinutesBefore(payload.appointment_date_time, 60),
          reminderType: "60_Minutes_Before",
          createdat: Date.now(),
        },
      })
      .promise();

    // 15 minutes before
    await dynamoDB
      .put({
        TableName: process.env.REMINDER_TABLE_NAME as string,
        Item: {
          appointment_id: appointmentId,
          reminder_id: uuidv4(),
          remind_at: timestampMinutesBefore(payload.appointment_date_time, 15),
          reminderType: "15_Minutes_Before",
          createdat: Date.now(),
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

const timestampMinutesBefore = (localTime: string, minutesBefore: number) => {
  const date = new Date(localTime);
  date.setTime(date.getTime() - minutesBefore * 60 * 1000);
  console.log(date);
  console.log("LocalTime", date.toLocaleString());
  return date;
};
