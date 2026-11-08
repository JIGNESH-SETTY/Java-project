# Default Dockerfile for repository root (Spring Boot 3 + Java 21 Backend)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dmaven.wagon.http.retryHandler.requestSentDefault=true \
    -Dhttp.keepAlive=false

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN mkdir -p /app/uploads && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:--XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0} -jar app.jar"]

