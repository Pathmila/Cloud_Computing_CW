import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";

export class Appointment extends Construct {
  
  private appointmentTable;
  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id);

    this.appointmentTable = new dynamodb.Table(this, "Appointments", {
      partitionKey: { name: "patientid", type: dynamodb.AttributeType.STRING },
      tableName: "Appointments",
      sortKey: { name: "appointmentid", type: dynamodb.AttributeType.STRING }
    });
  }

  //make the appointment
  createAppointment(){
    const fn = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]SignUpHandler",
      {
        entry: path.join(__dirname, "..", "lambda/appointment.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_LATEST,
        environment: {
          APPOINTMENTS_TABLE_NAME: this.appointmentTable.tableName,
        },
        bundling: {
          target: "es2020",
        },
      },
    );
    // grant the lambda role read/write permissions to our table
    this.appointmentTable.grantReadWriteData(fn);
    return fn;
  }
}
