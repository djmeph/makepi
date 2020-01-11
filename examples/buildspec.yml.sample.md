# Example buildspec.yml

```
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 12
  pre_build:
    commands:
      - cp serverless.yml ${CODEBUILD_SRC_DIR_makepi}/
      - cd $CODEBUILD_SRC_DIR_makepi
      - npm i
  post_build:
    commands:
      - npm run deploy

```

Place this file and serverless.yml in a separate, private repository and set it as the primary source in the CodeBuild Project. Use the makepi repo as the secondary source. Make sure to use the correct suffix in the secondary source dir. `$CODEBUILD_SRC_DIR_{{secondary-source-id}}`
