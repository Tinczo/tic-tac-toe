#!/bin/bash
API_URL="http://169.254.169.254/latest/api"
TOKEN=$(curl -X PUT "$API_URL/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
TOKEN_HEADER="X-aws-ec2-metadata-token: $TOKEN"
METADATA_URL="http://169.254.169.254/latest/meta-data"
AZONE=$(curl -H "$TOKEN_HEADER" -s $METADATA_URL/placement/availability-zone)
IP_V4=$(curl -H "$TOKEN_HEADER" -s $METADATA_URL/public-ipv4)
INTERFACE=$(curl -H "$TOKEN_HEADER" -s $METADATA_URL/network/interfaces/macs/ | head -n1)
SUBNET_ID=$(curl -H "$TOKEN_HEADER" -s $METADATA_URL/network/interfaces/macs/${INTERFACE}/subnet-id)
VPC_ID=$(curl -H "$TOKEN_HEADER" -s $METADATA_URL/network/interfaces/macs/${INTERFACE}/vpc-id)

# Pobranie wartości z AWS Secrets Manager
USER_POOL_ID=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/userpool" --query "SecretString" --output text)
CLIENT_ID=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/appclient" --query "SecretString" --output text)
BUCKET_NAME=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/s3bucketid" --query "SecretString" --output text)
DYNAMO_NAME=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/dynamoid" --query "SecretString" --output text)
DYNAMO_RANKING_NAME=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/dynamoid_rankings" --query "SecretString" --output text)
LAMBDA_NAME=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/lambda" --query "SecretString" --output text)
INVOKE_URL=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/invokeurl" --query "SecretString" --output text)
SNS_TOPIC_ARN=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "app/snstopicarn" --query "SecretString" --output text)


REGION="us-east-1"
REACT_APP_BACKEND_IP=$IP_V4
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_CLIENT_ID=$CLIENT_ID
REACT_APP_S3_BUCKET_NAME=$BUCKET_NAME
REACT_APP_DYNAMO_NAME=$DYNAMO_NAME
REACT_APP_LAMBDA_NAME=$LAMBDA_NAME
REACT_APP_DYNAMO_RAKING_NAME=$DYNAMO_RANKING_NAME
REACT_APP_INVOKE_URL=$INVOKE_URL
REACT_APP_SNS_TOPIC_ARN=$SNS_TOPIC_ARN

# Zapisanie zmiennych środowiskowych do pliku .env
echo "REACT_APP_BACKEND_IP=$IP_V4" > .env
echo "REACT_APP_USER_POOL_ID=$USER_POOL_ID" >> .env
echo "REACT_APP_CLIENT_ID=$CLIENT_ID" >> .env
echo "REACT_APP_REGION=$REGION" >> .env
echo "REACT_APP_AWS_REGION=$REGION" >> .env
echo "REACT_APP_S3_BUCKET_NAME=$BUCKET_NAME" >> .env
echo "REACT_APP_DYNAMO_NAME=$DYNAMO_NAME" >> .env
echo "REACT_APP_LAMBDA_NAME=$LAMBDA_NAME" >> .env
echo "REACT_APP_DYNAMO_RANKING_NAME=$DYNAMO_RANKING_NAME" >> .env
echo "REACT_APP_INVOKE_URL=$INVOKE_URL" >> .env
echo "REACT_APP_SNS_TOPIC_ARN=$SNS_TOPIC_ARN" >> .env

# Echo do konsoli dla sprawdzenia
echo "Zmienne środowiskowe:"
cat .env
cp .env frontend/.env

# Uruchomienie Docker Compose
sudo docker compose up
