import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs';
import * as path from "node:path";
export interface AuthenticatorProps {
    makeAppointmentFunction: lambda.Function
}

export class Authenticator extends Construct {
    public readonly signUpHandler : lambda.Function;
    public readonly signInHandler : lambda.Function;
    public readonly authorizationHandler : lambda.Function;
    constructor(scope: Construct, id: string, props:AuthenticatorProps) {
        super(scope, id);

        this.authorizationHandler = new lambdaNodejs.NodejsFunction(this, '[Auth]AuthorizationHandler', {
            entry: path.join(__dirname,'..','lambda','authenticator.js'),
            handler:'authorizationHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            environment: {
                DOWNSTREAM_MAKE_APPOINTMENT_FUNCTION_NAME : props.makeAppointmentFunction.functionName
            },
        })
        this.signUpHandler = new lambdaNodejs.NodejsFunction(this, '[Auth]SignUpHandler', {
            entry: path.join(__dirname,'..','lambda','authenticator.js'),
            handler:'signUpHandler',
            runtime: lambda.Runtime.NODEJS_LATEST
        })
        this.signInHandler = new lambdaNodejs.NodejsFunction(this, '[Auth]SignInHandler', {
            entry: path.join(__dirname,'..','lambda','authenticator.js'),
            handler:'signInHandler',
            runtime: lambda.Runtime.NODEJS_LATEST
        })

        props.makeAppointmentFunction.grantInvoke(this.authorizationHandler)
    }
}