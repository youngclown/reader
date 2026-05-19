# Reader Server

[한국어](#한국어) | [English](#english)

Reader Server is a self-hosted web reader based on the open-source Reader/Legado ecosystem. This fork adds multilingual UI support and Docker packaging for easier NAS deployment.

Supported UI languages:

- English (default)
- Korean
- Chinese

The selected language is stored in the browser and can be changed from the app settings.

> Source notice
>
> This project is based on the Reader server codebase. The original upstream project only fully opened source code up to v2.5.4. Newer upstream code may be partially open-source. See <https://github.com/hectorqin/reader-legado>.

## 한국어

### 개요

이 프로젝트는 휴대폰 없이 서버에서 실행하는 웹 기반 독서 서비스입니다. 책 소스 관리, 책장, 검색, 로컬 책 가져오기, WebDAV 동기화 등을 웹 UI에서 사용할 수 있습니다.

현재 이 포크에서는 다음을 정리했습니다.

- 한국어/영어/중국어 언어팩 구조
- 기본 언어 영어 설정
- 환경설정에서 언어 전환
- Element UI 기본 문구 다국어 처리
- 일부 백엔드 중국어 오류 메시지의 프론트엔드 번역 처리
- UGREEN NAS용 Docker 배포 파일

### 주요 기능

- 책 소스 관리
- 책장 관리 및 책 그룹
- 검색, 책 바다, 책 소스 전환
- 읽기 화면, 테마, 글꼴, 페이지 넘김 방식, 제스처
- 모바일 화면 대응
- WebDAV 동기화
- 사용자 설정 백업/복원
- 텍스트 치환/필터
- TTS 읽어주기 일부 지원
- 만화/오디오 일부 지원
- 로컬 TXT, EPUB, UMD, PDF 책 가져오기
- RSS 구독
- 책장 예약 업데이트
- 동시 검색
- 로컬 책 창고
- Kindle용 단순 웹 화면

### 설치 및 실행

Docker Desktop이 있는 PC에서 이미지를 만들 수 있습니다.

```bash
docker build -t reader-ko:latest .
docker save -o reader-ko.tar reader-ko:latest
```

UGREEN NAS 배포 방법은 [UGREEN_DOCKER.md](UGREEN_DOCKER.md)를 참고하세요.

직접 빌드해서 실행하려면:

```bash
docker compose -f docker-compose.ugreen.yml up -d --build
```

이미지 tar를 NAS에 가져온 뒤 실행하려면:

```bash
docker load -i reader-ko.tar
docker compose -f docker-compose.ugreen-image.yml up -d
```

접속 주소:

```text
http://NAS_IP:4396
```

### 언어 설정

앱의 환경설정에서 언어를 선택할 수 있습니다.

- English
- 한국어
- 중국어

기본값은 영어입니다. 이미 브라우저에 저장된 언어 설정이 있으면 저장된 값이 우선 적용됩니다.

### 주의 사항

- 책 소스에 따라 외부 웹사이트로 검색 요청이 나갈 수 있습니다. 이는 책 검색/목차/본문 가져오기 기능의 특성입니다.
- 로컬 책, 책장 데이터, 설정 파일은 설정한 storage 경로에 저장됩니다.
- WebView 기반 책 소스는 별도 WebView 서비스가 필요할 수 있습니다.
- 일부 JavaScript 고급 기능을 쓰는 책 소스는 서버 환경에서 동작하지 않을 수 있습니다.
- 책 소스 로그인 기능은 지원하지 않습니다.

### 참고 문서

- [UGREEN NAS Docker 배포](UGREEN_DOCKER.md)
- [원본 상세 문서](doc.md)
- [화면 미리보기](preview.md)

## English

### Overview

This project runs a web-based reader service on a server, without requiring a phone client. It provides book source management, bookshelf management, search, local book import, WebDAV sync, and reader settings through a browser UI.

This fork adds:

- Korean, English, and Chinese locale packs
- English as the default language
- Language switching from settings
- Localized Element UI built-in messages
- Frontend translations for common backend Chinese error messages
- Docker deployment files for UGREEN NAS

### Features

- Book source management
- Bookshelf and book group management
- Search, discovery, and source switching
- Reader page, themes, fonts, page-turn modes, and gestures
- Mobile-friendly layout
- WebDAV sync
- User configuration backup and restore
- Text replacement/filtering
- Partial TTS support
- Partial comic/audio support
- Local TXT, EPUB, UMD, and PDF import
- RSS subscriptions
- Scheduled bookshelf updates
- Concurrent search
- Local book store
- Simple Kindle-friendly web view

### Install And Run

Build the Docker image on a PC with Docker Desktop:

```bash
docker build -t reader-ko:latest .
docker save -o reader-ko.tar reader-ko:latest
```

For UGREEN NAS deployment, see [UGREEN_DOCKER.md](UGREEN_DOCKER.md).

To build directly from source:

```bash
docker compose -f docker-compose.ugreen.yml up -d --build
```

To run from an imported image tar:

```bash
docker load -i reader-ko.tar
docker compose -f docker-compose.ugreen-image.yml up -d
```

Open:

```text
http://NAS_IP:4396
```

### Language Settings

The language can be changed from the app settings.

- English
- Korean
- Chinese

English is the default. If the browser already has a saved language value, the saved value is used first.

### Notes

- Book source search may send requests to third-party websites. This is part of search, TOC, and content fetching behavior.
- Local books, bookshelf data, and settings are stored under the configured storage path.
- WebView-based book sources may require a separate WebView service.
- Some book sources using advanced JavaScript features may not work in the server runtime.
- Book source login is not supported.

### References

- [UGREEN NAS Docker Deployment](UGREEN_DOCKER.md)
- [Original Detailed Documentation](doc.md)
- [Preview](preview.md)

## Disclaimer

This software is a reading/search tool. Search results and content are provided by third-party book sources or websites. The project is not responsible for third-party content, legality, availability, accuracy, or service quality. Use book sources responsibly and follow the laws and copyright rules that apply in your region.
