import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";

export class Appointment extends Construct {
  public readonly createAppointment: lambda.Function;
  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id);

    const appointmentTable = new dynamodb.Table(this, "Appointments", {
      partitionKey: { name: "Patient", type: dynamodb.AttributeType.STRING },
    });

    //make the appointment
    this.createAppointment = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]SignUpHandler",
      {
        entry: path.join(__dirname, "..", "lambda", "appointment.ts"),
        handler: "createAppointment",
        runtime: lambda.Runtime.NODEJS_LATEST,
        environment: {
          APPOINTMENTS_TABLE_NAME: appointmentTable.tableName,
        },
      },
    );

    // grant the lambda role read/write permissions to our table
    appointmentTable.grantReadWriteData(this.createAppointment);
  }
}
