# Chronos Backend

Chronos is a backend service for managing and monitoring jobs. It supports various job types such as `shell`, `email`, `http`, and `sql`. The service includes features like job scheduling, execution, retry strategies, and monitoring.

---

## **Features**
- Job scheduling with cron expressions.
- Support for multiple job types:
  - Shell commands
  - Email notifications
  - HTTP requests
- Retry strategies: `immediate`, `exponential`, `linear`.
- Real-time monitoring using Server-Sent Events (SSE).
- Kafka integration for job execution and status updates.

---

## **Tech Stack**
- **Node.js**: Backend runtime.
- **Express.js**: Web framework.
- **Sequelize**: ORM for MySQL.
- **MySQL**: Relational database.
- **Kafka**: Message broker for job execution and monitoring.
- **Nodemailer**: Email sending.
- **Axios**: HTTP client.
- **cron-parser**: Cron expression parsing.
- **Docker**: Containerization.

---

## **Setup Instructions**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/chronos.git
   cd chronos/backend
   ```

2. Set up environment variables in the `docker-compose.yml` file:
   Update the `environment` section with the following values:
   ```yaml
   environment:
     DB_HOST: db
     DB_USER: root
     DB_PASSWORD: password
     DB_NAME: chronos
     KAFKA_BROKER: kafka:9092
     SMTP_HOST: smtp.mailtrap.io
     SMTP_PORT: 2525
     SMTP_USER: your_user
     SMTP_PASS: your_pass
   ```

3. Run the project using Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the API at `http://localhost:8080`.

---

## **API Endpoints**

### **Jobs**
- `GET /jobs/health`: Health check
- `POST /jobs`: Create a new job.
- `GET /jobs`: Get a list of all jobs.
- `GET /jobs/:id`: Get details of a specific job.
- `PUT /jobs/:id`: Update a job.
- `DELETE /jobs/:id`: Delete a job.
- `DELETE /jobs/:id/history`: Get run history of a job.
- `PATCH /jobs/:id/status`: Pause or restart job

### **Monitoring**
- `GET /monitor/health`: Health check
- `GET /monitor/logs/:id`: Real-time monitoring of job execution using SSE.

---

## **Project Structure**
```
backend/
├── @shared/                # Shared modules (e.g., Kafka, MySQL models)
│   ├── kafka
│   ├── middlewares
│   ├── mysql
│   │   ├── config
│   │   ├── daos
│   │   ├── migrations
│   │   ├── models
│   ├── redis
├── infra                   # docker setup for services
│   ├── mysql
├── services/
│   ├── cron
│   ├── job-management/     # Job management service
│   ├── log
│   ├── monitoring/         # Monitoring service
│   ├── retry
│   ├── scheduler
│   └── worker/             # Worker service for job execution
├── docker-compose.yml      # Ignored files
└── README.md               # Dependencies
```

---

## **License**
This project is licensed under the MIT License.