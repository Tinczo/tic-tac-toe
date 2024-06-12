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
USER_POOL_ID=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "myproject/userpool" --query "SecretString" --output text)
CLIENT_ID=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "myproject/appclient" --query "SecretString" --output text)
BUCKET_NAME=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id "myproject/s3bucketid" --query "SecretString" --output text)

REGION="us-east-1"
REACT_APP_BACKEND_IP=$IP_V4
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_CLIENT_ID=$CLIENT_ID
REACT_APP_S3_BUCKET_NAME=$BUCKET_NAME

# Zapisanie zmiennych środowiskowych do pliku .env
echo "REACT_APP_BACKEND_IP=$IP_V4" > .env
echo "REACT_APP_USER_POOL_ID=$USER_POOL_ID" >> .env
echo "REACT_APP_CLIENT_ID=$CLIENT_ID" >> .env
echo "REACT_APP_REGION=$REGION" >> .env
echo "REACT_APP_AWS_REGION=$REGION" >> .env
echo "REACT_APP_S3_BUCKET_NAME=$BUCKET_NAME" >> .env

# Echo do konsoli dla sprawdzenia
echo "Zmienne środowiskowe:"
cat .env
cp .env frontend/.env

# Uruchomienie Docker Compose
sudo docker compose up
