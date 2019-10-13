# Example serverless.yml

```
service: makepi

provider:
  name: aws
  runtime: nodejs10.x
  stage: api
  stackName: makepi-api-dev
  region: us-east-1
  iamManagedPolicies:
    - 'arn:to:dynamodb:read:write:policy'
functions:
  dev:
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
plugins:
  - serverless-offline
```

Deploy with `npm run deploy`

Nodemon Github https://github.com/remy/nodemon
