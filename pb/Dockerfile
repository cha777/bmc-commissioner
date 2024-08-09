FROM alpine:latest

ARG PB_VERSION=0.22.18

RUN apk add --no-cache \
    unzip \
    ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# COPY pb_migrations /pb/data/pb_migrations
# COPY pb_data /pb/data/pb_data

ENV DATA_DIR=/pb/data/pb_data
ENV PUBLIC_DIR=/pb/data/pb_public
ENV HOOKS_DIR=/pb/data/pb_hooks
ENV MIGRATIONS_DIR=/pb/data/pb_migrations

EXPOSE 8090

# start PocketBase
CMD [ "sh", "-c", "/pb/pocketbase serve --http=0.0.0.0:8090 --dir=${DATA_DIR} --publicDir=${PUBLIC_DIR} --hooksDir=${HOOKS_DIR} --migrationsDir=${MIGRATIONS_DIR}" ]