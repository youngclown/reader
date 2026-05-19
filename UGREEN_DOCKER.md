# UGREEN NAS Docker Deployment

[한국어](#한국어) | [English](#english)

## 한국어

이 구성은 현재 저장소의 수정된 소스를 빌드해서 `reader-ko:latest` 이미지로 실행합니다.

### 파일

- `Dockerfile`: 웹 프론트엔드와 Spring Boot 실행 jar를 빌드하는 이미지 정의
- `docker-compose.ugreen.yml`: NAS에서 소스를 직접 빌드할 때 사용하는 compose 파일
- `docker-compose.ugreen-image.yml`: PC에서 만든 `reader-ko.tar` 이미지를 NAS에 가져온 뒤 실행할 때 사용하는 compose 파일
- `reader-ko.tar`: PC에서 빌드한 Docker 이미지 파일

### PC에서 이미지 만들기

Docker Desktop이 켜진 PC에서 실행합니다.

```bash
docker build -t reader-ko:latest .
docker save -o reader-ko.tar reader-ko:latest
```

UGREEN NAS의 로컬 이미지 추가 기능에는 `reader-ko.tar` 파일을 올리면 됩니다. zip으로 압축한 소스 패키지가 아니라 Docker 이미지 tar 파일입니다.

### NAS에서 이미지 tar로 실행

NAS Docker 앱에서 로컬 이미지 추가가 된다면 `reader-ko.tar`를 가져온 뒤 컨테이너를 생성합니다.

CLI를 쓸 수 있다면 아래처럼 실행할 수 있습니다.

```bash
docker load -i reader-ko.tar
docker compose -f docker-compose.ugreen-image.yml up -d
```

접속 주소:

```text
http://NAS_IP:4396
```

### NAS에서 직접 빌드

NAS에 전체 프로젝트 폴더를 올려 직접 빌드할 수도 있습니다.

```bash
docker compose -f docker-compose.ugreen.yml up -d --build
```

NAS에서 빌드하면 메모리와 시간이 더 필요합니다. 빌드가 느리거나 실패하면 PC에서 `reader-ko.tar`를 만들어 올리는 방식을 권장합니다.

### 설정 변경

배포 전에 아래 값은 반드시 바꾸는 것을 권장합니다.

```yaml
READER_APP_SECUREKEY: "change-this-admin-password"
READER_APP_INVITECODE: "change-this-invite-code"
```

기본 데이터 저장 위치는 compose 파일 기준 상대 경로입니다.

```text
./ugreen-data/storage
./ugreen-data/logs
```

UGREEN NAS의 공유 폴더에 고정하고 싶으면 예를 들어 다음처럼 바꿀 수 있습니다.

```yaml
volumes:
  - /volume1/docker/reader/storage:/storage
  - /volume1/docker/reader/logs:/logs
```

### WebView 서비스가 필요한 경우

일부 WebView 기반 책 소스를 쓰려면 reader 서비스 환경 변수에 아래 값을 추가하고 `webview` 프로필로 실행합니다.

```yaml
READER_APP_REMOTEWEBVIEWAPI: "http://readerwebview:8050"
```

```bash
docker compose -f docker-compose.ugreen-image.yml --profile webview up -d
```

## English

This configuration builds the modified source in this repository and runs it as the `reader-ko:latest` image.

### Files

- `Dockerfile`: image definition that builds the web frontend and Spring Boot runnable jar
- `docker-compose.ugreen.yml`: compose file for building directly from source on the NAS
- `docker-compose.ugreen-image.yml`: compose file for running an imported `reader-ko.tar` image built on a PC
- `reader-ko.tar`: Docker image tar file built on the PC

### Build The Image On A PC

Run this on a PC with Docker Desktop enabled.

```bash
docker build -t reader-ko:latest .
docker save -o reader-ko.tar reader-ko:latest
```

For the UGREEN NAS local image import feature, upload `reader-ko.tar`. This must be the Docker image tar file, not the zipped source package.

### Run On The NAS From Image Tar

If the NAS Docker app supports local image import, import `reader-ko.tar` and create a container from it.

If CLI access is available, run:

```bash
docker load -i reader-ko.tar
docker compose -f docker-compose.ugreen-image.yml up -d
```

Open:

```text
http://NAS_IP:4396
```

### Build Directly On The NAS

You can also upload the full project folder to the NAS and build it there.

```bash
docker compose -f docker-compose.ugreen.yml up -d --build
```

Building on the NAS requires more memory and time. If the build is slow or fails, build `reader-ko.tar` on the PC and upload that image instead.

### Change Configuration

Change these values before deployment.

```yaml
READER_APP_SECUREKEY: "change-this-admin-password"
READER_APP_INVITECODE: "change-this-invite-code"
```

By default, data is stored in paths relative to the compose file.

```text
./ugreen-data/storage
./ugreen-data/logs
```

To pin the data to a UGREEN NAS shared folder, use paths like:

```yaml
volumes:
  - /volume1/docker/reader/storage:/storage
  - /volume1/docker/reader/logs:/logs
```

### If WebView Service Is Needed

Some WebView-based book sources need a separate WebView service. Add this environment variable to the reader service and run with the `webview` profile.

```yaml
READER_APP_REMOTEWEBVIEWAPI: "http://readerwebview:8050"
```

```bash
docker compose -f docker-compose.ugreen-image.yml --profile webview up -d
```
