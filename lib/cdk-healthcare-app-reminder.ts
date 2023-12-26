import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import {
  EventbridgeToLambdaProps,
  EventbridgeToLambda,
} from "@aws-solutions-constructs/aws-eventbridge-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Cluster, TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { Role } from "aws-cdk-lib/aws-iam";
import { handler } from "../lambda/reminder";

export class Reminder extends Construct {
  public readonly hourlyReminder: lambda.Function;
  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id);

    const reminderQueue = new sqs.Queue(this, "thealthcareapp_reminder_queue");

    this.hourlyReminder = new lambda.Function(this, "[Auth]HourlyReminder", {
      code: lambda.Code.fromAsset(`lambda`),
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "reminder.handler",
      environment: {
        REMINDER_QUEUE_URL: reminderQueue.queueUrl,
      },
    });

    new events.Rule(this, "hourly-reminder", {
      schedule: events.Schedule.rate(Duration.minutes(10000)),
      targets: [new LambdaFunction(this.hourlyReminder)],
    });

    reminderQueue.grantSendMessages(this.hourlyReminder);
  }
}
