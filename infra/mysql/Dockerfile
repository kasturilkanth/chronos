FROM mysql:8.0

# Set the environment variable for MySQL root password
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_USER=chronos
ENV MYSQL_PASSWORD=chronos@123
ENV MYSQL_DATABASE=job_scheduler

# Create initialization script
COPY init.sql /docker-entrypoint-initdb.d/