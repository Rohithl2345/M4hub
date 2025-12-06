# Multi-stage build: Build the application
FROM maven:3.9.0-eclipse-temurin-17 AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Runtime stage: Run the application
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR from the builder stage
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 8080

# Set timezone in JVM and run the application
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "app.jar"]
