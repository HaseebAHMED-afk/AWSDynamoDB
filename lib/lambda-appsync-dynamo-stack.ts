import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as appsync from '@aws-cdk/aws-appsync'
import * as ddb from '@aws-cdk/aws-dynamodb'

export class LambdaAppsyncDynamoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-notes-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });

    const notesLambda = new lambda.Function(this, 'AppSyncNotesHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024
    });
    
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', notesLambda);


    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getNoteById"
    });
    
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listNotes"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createNote"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteNote"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateNote"
    });


    const notesTable = new ddb.Table(this , 'CDKNotesTable' , {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING
      }
    })

    notesTable.grantFullAccess(notesLambda)

    notesLambda.addEnvironment('NOTES_TABLE' , notesTable.tableName)

  }
}
