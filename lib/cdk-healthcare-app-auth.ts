import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { appClientConfig, cognitoConfigs } from "./aws-configs/cognito";
import { UserPoolOperation } from "aws-cdk-lib/aws-cognito";
export interface AuthenticatorProps {
  makeAppointmentFunction: lambda.Function;
}

export class Authenticator extends Construct {
  private cognitoClientId: string;
  private userPoolId: string;
  public readonly signUpHandler: lambda.Function;
  public readonly signInHandler: lambda.Function;
  public readonly authorizationHandler: lambda.Function;
  constructor(scope: Construct, id: string, props: AuthenticatorProps) {
    super(scope, id);
    this.cognitoInit();
    this.authorizationHandler = new lambdaNodejs.NodejsFunction(
      this,
      "[Auth]AuthorizationHandler",
      {
        functionName: "Authorization",
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

    props.makeAppointmentFunction.grantInvoke(this.authorizationHandler);
  }

  private cognitoInit() {
    const pool = new cognito.UserPool(this, "patientUserPool", cognitoConfigs);
    pool.addTrigger(
      UserPoolOperation.PRE_SIGN_UP,
      new lambdaNodejs.NodejsFunction(this, "[Auth]PreSignUp", {
        entry: path.join(__dirname, "..", "lambda/authenticate/preSignUp.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        bundling: {
          target: "es2020",
        },
      }),
    );

    const client = pool.addClient("appClient", appClientConfig);
    this.cognitoClientId = client.userPoolClientId;
    this.userPoolId = pool.userPoolId;

    new cdk.CfnOutput(this, "UserPoolIdOutput", {
      value: pool.userPoolId,
    });
    new cdk.CfnOutput(this, "AppClientIdOutput", {
      value: client.userPoolClientId,
    });
  }

  signUp() {
    return new lambdaNodejs.NodejsFunction(this, "[Auth]SignUpHandler", {
      functionName: "SignUp",
      entry: path.join(__dirname, "..", "lambda/authenticate/signUp.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_LATEST,
      bundling: {
        target: "es2020",
      },
      environment: {
        COGNITO_CLIENT_ID: this.cognitoClientId,
      },
    });
  }

  signIn() {
    return new lambdaNodejs.NodejsFunction(this, "[Auth]SignInHandler", {
      functionName: "SignIn",
      entry: path.join(__dirname, "..", "lambda/authenticate/signIn.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_LATEST,
      bundling: {
        target: "es2020",
      },
      environment: {
        USER_POOL_ID: this.userPoolId,
        APP_CLIENT_ID: this.cognitoClientId,
      },
    });
  }
}
