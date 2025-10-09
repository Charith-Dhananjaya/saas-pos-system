# ---- 1) Build stage ---------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only pom first to leverage Docker layer caching for dependencies
COPY pom.xml ./

# Pre-fetch dependencies (faster incremental builds)
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -e -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
# Build the Spring Boot fat jar (skip tests for faster container builds)
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -e -DskipTests package

# ---- 2) Runtime stage -------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Enable Java preview features (your POM uses --enable-preview)
ENV JAVA_TOOL_OPTIONS="--enable-preview"

# App port (matches server.port=5000 in application.properties)
EXPOSE 5000

# Copy the built jar
# If you ever change artifact name, adjust the wildcard or ARG below.
COPY --from=build /app/target/*.jar app.jar

# Spring Boot respects SPRING_* env vars – set these at runtime or via compose.
# Example (override defaults):
#  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/pos_bs
#  -e SPRING_DATASOURCE_USERNAME=root
#  -e SPRING_DATASOURCE_PASSWORD=1234
#  -e SERVER_PORT=5000
#
# Healthier defaults: fail fast on missing DB, shorter startup banner, etc.
ENV SPRING_MAIN_BANNER-MODE=off \
    SPRING_JPA_HIBERNATE_DDL-AUTO=update

ENTRYPOINT ["java","-jar","/app/app.jar"]
