FROM ubuntu:18.04 as base

ARG aws_id
ARG aws_secret

ENV AWS_ACCESS_KEY_ID=$aws_id
ENV AWS_SECRET_ACCESS_KEY=$aws_secret

### Stage 1 - update/add/remove packages ###

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y nodejs npm python3-pip python3-dev build-essential git
RUN pip3 install awscli

## Stage 2 - Copy files and install npm packages

COPY ./models ./routes ./utils config.js index.js package.json router.js serverless.yml /opt/

WORKDIR /opt
RUN npm i

## Stage 3 - Create deploy script

RUN echo "#!/bin/bash\nnpm run deploy" > /opt/deploy.sh
RUN chmod +x /opt/deploy.sh

