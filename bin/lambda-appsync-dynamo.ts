#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaAppsyncDynamoStack } from '../lib/lambda-appsync-dynamo-stack';

const app = new cdk.App();
new LambdaAppsyncDynamoStack(app, 'LambdaAppsyncDynamoStack');
