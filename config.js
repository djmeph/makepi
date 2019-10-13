module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  EXPIRY: Number(process.env.EXPIRY),
  SALT_WORK_FACTOR: Number(process.env.SALT_WORK_FACTOR),
  awsConfig: {
    region: process.env.AWS_REGION,
    sslEnabled: true,
    apiVersions: {
      dynamodb: '2012-08-10'
    }
  },
  tableNames: {
    users: `makepi-${process.env.ENV_NAME}-users`
  },
  itemKeyPrefixes: {
    users: 'base'
  },
  itemKeyDelimiter: '#'
};
