# Example nodemon.json

```
{
  "restartable": "rs",
  "ignore": [
    ".git",
    "node_modules/**/node_modules"
  ],
  "verbose": true,
  "execMap": {
    "js": "node --harmony"
  },
  "events": {
    "restart": "osascript -e 'display notification \"App restarted due to:\n'$FILENAME'\" with title \"nodemon\"'"
  },
  "env": {
    "ENV_NAME": "dev",
    "JWT_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "EXPIRY": 86400,
    "SALT_WORK_FACTOR": 11,
    "AWS_REGION": "us-east-1"
  },
  "ext": "js,json"
}
```

Run with `npm start`
