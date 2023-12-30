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

export class CdkHealthcareAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const appAppointment = new Appointment(this, "AppAppointment");
    const appReminder = new Reminder(this, "AppReminder");
    this.apiGateway();

    //defining pipeline
    const healthcareAppPipeline = new CodePipeline(
      this,
      "HealthCareAppPipline",
      {
        pipelineName: "HealthCareAppPipeline",
        synth: new ShellStep("Synth", {
          input: CodePipelineSource.connection(
            "rukmals/healthcare-app",
            "cognito-config-latest",
            {
              connectionArn:
                "arn:aws:codestar-connections:eu-north-1:420571806689:connection/8257ba45-43f9-4033-abca-f37ccdd4110d",
            },
          ),
          // installCommands: ['npm i -g npm@latest', 'npm install'],
          commands: ["npm ci", "npm run build", "npx cdk synth"],
        }),
      },
    );

    //app api gateway define
    // const healthCareAppAPIGw = new apigw.RestApi(this, "HealthCareAppAPIGW");
    //
    // const baseRoute = healthCareAppAPIGw.root.addResource("v1");

    // // appointment operations
    // const appointmentCreate = appointmentRoute.addResource("create");
    // appointmentCreate.addMethod(
    //   "GET",
    //   new apigw.LambdaIntegration(appAuthenticator.authorizationHandler),
    // );
  }

  private apiGateway() {
    const healthCareAppAPIGw = new apigw.RestApi(this, "HealthCareAppAPIGW");
    const baseRoute = healthCareAppAPIGw.root.addResource("v1");
    const authRoute = baseRoute.addResource("auth");
    const appointmentRoute = baseRoute.addResource("appointment");

    const appAppointment = new Appointment(this, "AppAppointment");
    const appAuthenticator = new Authenticator(this, "AppAuthenticator", {
      makeAppointmentFunction: appAppointment.createAppointment,
    });

    const auth = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "patientAuthorizer",
      {
        cognitoUserPools: [appAuthenticator.userPoolInstance],
      },
    );

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
        {
          authorizer: auth,
          authorizationType: apigw.AuthorizationType.COGNITO,
        },
      );

      appointmentRoute.addMethod(
          "POST",
          new apigw.LambdaIntegration(appAppointment.createAppointment()),
      );
  }
}
