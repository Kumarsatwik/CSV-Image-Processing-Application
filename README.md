# CSV Image Processing Application

## Overview

A Node.js application that processes CSV files containing product information and image URLs, performs image compression, and generates processed image outputs.

## System Requirements

- Node.js
- MongoDB
- Docker

## Tech Stack

```
Backend Framework: Express.js
Database: MongoDB with Mongoose
Queue System: Bull (Redis-based)
Image Processing: Sharp
File Processing: csv-parser, multer
API Documentation: Swagger
Environment: dotenv
Logging: morgan
HTTP Client: axios
```

## Project Setup

1. Clone the repository

```bash
git clone <repository-url>
cd csv-image-processing-app
```

2. Install dependencies

```bash
# Install Package
npm install
# Run Redis in a Docker container:
docker run --name redis-local -p 6379:6379 -d redis
# [optional] Verify Redis is running:
docker ps

```

3. Environment Configuration
   Create .env file:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/image-processor
WEBHOOK_URL=http://localhost:4000/api/webhook
```

4. Start the application

```bash
# Development
npm run dev

# Production
npm start

```

## Architecture Diagram


![image](https://github.com/user-attachments/assets/ae959fb4-f1c8-4ce1-b626-3804a01837c6)

## Database Schema

![image-2](https://github.com/user-attachments/assets/164090fe-4351-4258-89ef-27a49692faad)


## Processing Flow

![image-3](https://github.com/user-attachments/assets/ced2d4a7-317f-4582-abec-e89d549b0690)

## API Endpoints

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | `/api/upload`            | Upload CSV file       |
| GET    | `/api/status/:requestId` | Get processing status |
| POST   | `/api/webhook`           | Webhook endpoint      |

You can find Postman collection in the Repository

## Sample CSV Format

I have attached a sample csv file for testing

```csv
Serial Number,Product Name,Input Image Urls
1,Product A,https://example.com/image1.jpg
```

## Features

- ✅ Asynchronous image processing
- ✅ Image compression
- ✅ Progress tracking
- ✅ Webhook notifications
- ✅ Error handling
- ✅ Request status monitoring

## Error Handling

- Invalid CSV format
- Image download failures
- Processing errors
- Database connection issues
