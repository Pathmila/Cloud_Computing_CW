import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export class Reminder extends Construct {
  public hourlyReminder: lambda.Function;
  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id);
  }

  reminderEvent() {
    this.hourlyReminder = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]HourlyReminder",
      {
        functionName: "Reminder",
        entry: path.join(__dirname, "..", "lambda/reminder.ts"),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        bundling: {
          target: "es2020",
        },
      },
    );
    this.hourlyReminder.role?.addManagedPolicy({
      managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSESFullAccess",
    });
  }
}
