# Cloud Web Application with AWS Integration

## Overview
This web application demonstrates the implementation of cloud services using AWS, featuring user authentication, account management, and user administration capabilities. The project is structured as a microservice architecture with separate frontend and backend components.

## Architecture
The application is split into two main components:
- Frontend: React-based single-page application
- Backend: Java Spring Boot REST API

### AWS Services Used
- **Amazon EC2**: Hosts both frontend and backend applications
- **Amazon Cognito**: Handles user authentication and user pools
- **Docker**: Containerizes both frontend and backend services

## Technical Stack

### Frontend
- React
- TypeScript
- AWS Amplify for AWS integration
- Material-UI for component styling

### Backend
- Java 17
- Spring Boot
- Gradle
- AWS SDK for Java

## Features
- User registration and authentication
- Secure API endpoints
- JWT token-based authentication
- Responsive design

## Prerequisites
- Node.js (v16 or higher)
- Java 17
- Docker and Docker Compose
- AWS Account with appropriate permissions
- Gradle

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Backend Setup:
```bash
cd backend
gradle build
docker build -t backend-app .
```

3. Frontend Setup:
```bash
cd frontend
npm install
docker build -t frontend-app .
```

4. Configure AWS credentials:
Create `application.properties` in the backend and `.env` in the frontend with your AWS credentials and configuration.

5. Run the application:
```bash
docker-compose up
```

## Deployment
The application is deployed on AWS EC2 instances:
1. Frontend is served on port 3000
2. Backend API runs on port 8080

## Project Structure
```
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── build.gradle
└── docker-compose.yml
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details
