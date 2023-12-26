import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "node:path";
export interface AuthenticatorProps {
  makeAppointmentFunction: lambda.Function;
}

export class Authenticator extends Construct {
  public readonly signUpHandler: lambda.Function;
  public readonly signInHandler: lambda.Function;
  public readonly authorizationHandler: lambda.Function;
  constructor(scope: Construct, id: string, props: AuthenticatorProps) {
    super(scope, id);

    this.authorizationHandler = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]AuthorizationHandler",
      {
        entry: path.join(
          __dirname,
          "..",
          "lambda/authenticate/authorization.ts",
        ),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_LATEST,
        environment: {
          DOWNSTREAM_MAKE_APPOINTMENT_FUNCTION_NAME:
            props.makeAppointmentFunction.functionName,
        },
        bundling: {
          target: "es2020",
        },
      },
    );

    this.signUpHandler = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]SignUpHandler",
      {
        entry: path.join(__dirname, "..", "lambda/authenticate/signUp.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_LATEST,
        bundling: {
          target: "es2020",
        },
      },
    );
    this.signInHandler = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]SignInHandler",
      {
        entry: path.join(__dirname, "..", "lambda/authenticate/signIn.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_LATEST,
        bundling: {
          target: "es2020",
        },
      },
    );

    props.makeAppointmentFunction.grantInvoke(this.authorizationHandler);
  }
}
