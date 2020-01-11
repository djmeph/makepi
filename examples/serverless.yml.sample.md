# Example serverless.yml

```
# serverless.yml

service: makepi

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  stackName: makepi-api-dev
  region: us-east-1
  iamManagedPolicies:
    - arn:to:dynamodb:access:policy
    - arn:to:ses:access:policy
    - arn:to:sqs:access:policy
  deploymentBucket:
    name: com.makepi.${self:provider.region}.lambda.deploys
functions:
  api:
    handler: index.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
    timeout: 30
    memorySize: 1024
    environment:
      ENV_NAME: dev
      JWT_SECRET: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      EXPIRY: 86400
      SALT_WORK_FACTOR: 11
      MAX_LOGIN_ATTEMPTS: 10
      LOCK_TIME: 60000
  emailRecover:
    handler: email.recover
    events:
      - sqs: arn:to:sqs:recover:queue
    timeout: 30
    memorySize: 512
    environment:
      ENV_NAME: dev
plugins:
  - serverless-offline
```

Deploy with `npm run deploy`
