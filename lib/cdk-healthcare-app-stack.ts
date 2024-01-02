import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Authenticator } from "./cdk-healthcare-app-auth";
import { Appointment } from "./cdk-healthcare-app-appointment";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Reminder } from "./cdk-healthcare-app-reminder";
import * as ssm from "@aws-cdk/aws-ssm";
import { getParameterValues } from "./aws-configs/parameters";

export class CdkHealthcareAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.apiGateway();
    this.setCICDPipeLine();
  }

  //defining pipeline
  private async setCICDPipeLine() {
    new CodePipeline(this, "HealthCareAppPipeline", {
      pipelineName: "HealthCareAppPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection(
          await getParameterValues("/HEALTH_APP/PROD/REPOSITORY_NAME"),
          await getParameterValues("/HEALTH_APP/PROD/BRANCH_NAME"),
          {
            connectionArn: await getParameterValues(
              "/HEALTH_APP/PROD/CONNECTION_ARN",
            ),
          },
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }

  private apiGateway() {
    const healthCareAppAPIGw = new apigw.RestApi(this, "HealthCareAppAPIGW");
    const baseRoute = healthCareAppAPIGw.root.addResource("v1");
    const authRoute = baseRoute.addResource("auth");
    const appointmentRoute = baseRoute.addResource("appointment");

    const appAppointment = new Appointment(this, "AppAppointment");
    const appAuthenticator = new Authenticator(this, "AppAuthenticator");

    const auth = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "patientAuthorizer",
      {
        cognitoUserPools: [appAuthenticator.userPoolInstance],
      },
    );

    // Auth Routes
    authRoute
      .addResource("signup")
      .addMethod(
        "POST",
        new apigw.LambdaIntegration(appAuthenticator.signUp()),
      );

    authRoute
      .addResource("signin")
      .addMethod(
        "POST",
        new apigw.LambdaIntegration(appAuthenticator.signIn()),
      );

    // Appointment Routes
    appointmentRoute.addMethod(
      "POST",
      new apigw.LambdaIntegration(appAppointment.createAppointment()),
      {
        authorizer: auth,
        authorizationType: apigw.AuthorizationType.COGNITO,
      },
    );

    appointmentRoute.addMethod(
      "GET",
      new apigw.LambdaIntegration(appAppointment.getAppointments()),
      {
        authorizer: auth,
        authorizationType: apigw.AuthorizationType.COGNITO,
      },
    );
  }
}
