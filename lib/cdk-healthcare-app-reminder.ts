import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface ReminderProps {
  appointmentHourlyReminderTable: dynamodb.Table;
  userPoolId: string;
}

export class Reminder extends Construct {
  public hourlyReminder: lambda.Function;
  constructor(scope: Construct, id: string, props: ReminderProps) {
    super(scope, id);
    this.hourlyReminder = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]HourlyReminder",
      {
        functionName: "Reminder",
        entry: path.join(__dirname, "..", "lambda/reminder/reminder.ts"),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        bundling: {
          target: "es2020",
        },
        environment: {
          USER_POOL_ID: props.userPoolId,
        },
      },
    );

    this.hourlyReminder.role?.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSESFullAccess",
    });

    this.hourlyReminder.role?.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess",
    });

    this.hourlyReminder.role?.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonCognitoReadOnly",
    });

    //configuring event stream from dynamoDb -> lambda
    this.hourlyReminder.addEventSource(
      new DynamoEventSource(props.appointmentHourlyReminderTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      }),
    );
  }
}
