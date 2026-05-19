# syntax=docker/dockerfile:1

FROM node:16-alpine AS web-builder
WORKDIR /app/web

COPY web/package*.json ./
RUN npm install

COPY web/ ./
RUN npm run build

FROM gradle:6.1.1-jdk8 AS app-builder
WORKDIR /app

COPY --chown=gradle:gradle gradle ./gradle
COPY --chown=gradle:gradle gradlew cli.gradle settings.gradle gradle.properties ./
COPY --chown=gradle:gradle src ./src
COPY --from=web-builder --chown=gradle:gradle /app/web/dist ./src/main/resources/web

RUN rm -f src/main/java/com/htmake/reader/ReaderUIApplication.kt \
    && gradle -b cli.gradle assemble --no-daemon \
    && cp build/libs/*.jar build/libs/reader.jar

FROM eclipse-temurin:8-jre-jammy

RUN apt-get update \
    && apt-get install -y --no-install-recommends tini tzdata ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Seoul \
    SPRING_PROFILES_ACTIVE=prod \
    READER_APP_STORAGEPATH=/storage \
    LOGGING_PATH=/logs \
    JAVA_OPTS="-Xms128m -Xmx512m"

WORKDIR /app
COPY --from=app-builder /app/build/libs/reader.jar /app/bin/reader.jar

EXPOSE 8080
VOLUME ["/storage", "/logs"]

ENTRYPOINT ["tini", "--"]
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/bin/reader.jar"]
