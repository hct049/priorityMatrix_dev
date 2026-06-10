# 우선순위 매트릭스

마감일 × 중요도 기반으로 할 일을 아이젠하워 매트릭스 4분면에 자동 분류하는 웹 앱입니다.  
Next.js + Vercel로 프론트엔드를 제공하고, Google Apps Script + Google Sheets를 DB로 사용합니다.

> **이 README의 설치 순서는 스프레드시트 GUIDE 시트의 내용과 동일합니다.**  
> 설치 중 막히는 부분이 있으면 GUIDE 시트를 함께 참고하세요.

---

## 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14, React 18 |
| 배포 | Vercel |
| DB | Google Sheets |
| 백엔드 API | Google Apps Script (GAS) 웹앱 |
| 인증 | httpOnly 쿠키 + HMAC-SHA256 |

---

## 사전 준비

- Google 계정
- GitHub 계정 (이 저장소를 fork한 상태)
- Vercel 계정

---

## 설치 및 배포 순서

### 1. 저장소 Fork

이 저장소를 본인 GitHub 계정으로 fork합니다.

---

### 2. TEMPLATE 스프레드시트 복사

아래 링크에서 TEMPLATE 스프레드시트를 **사본 만들기**합니다.

**[TEMPLATE 열기](https://docs.google.com/spreadsheets/d/153_7L15EJ1FZf3RGkayPSq-aWKec52gV_-eBoEmS2-0)**

> 파일 → 사본 만들기

사본을 만들면 GAS 프로젝트(라이브러리 포함)와 Code.gs가 함께 복사됩니다.  
GAS 프로젝트 생성 및 라이브러리 추가 작업을 건너뛸 수 있습니다.

복사된 스프레드시트 URL에서 스프레드시트 ID를 복사합니다.

```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
```

---

### 3. Google Apps Script 설정

#### 3-1. GAS 편집기 열기

복사된 스프레드시트에서 **확장 프로그램 → Apps Script**를 클릭합니다.

#### 3-2. SHEET_ID 입력

`코드.gs` 상단의 `SHEET_ID`에 2단계에서 복사한 스프레드시트 ID를 입력합니다.

```javascript
const SHEET_ID = "여기에_스프레드시트_ID_입력";
```

#### 3-3. 웹앱 배포

1. 우측 상단 **배포 → 새 배포** 클릭
2. 유형: **웹 앱** 선택
3. 설정:
   - 다음 사용자로 실행: **나**
   - 액세스 권한: **모든 사용자**
4. **배포** 클릭 후 웹앱 URL 복사 → 이것이 `GAS_URL`

#### 3-4. DB 초기화

스프레드시트 상단 메뉴 **Priority Matrix → DB 초기화 (전체 삭제 후 재생성)** 를 실행합니다.  
`tasks`, `completed`, `settings` 시트가 생성되면 정상입니다.

---

### 4. GitHub PAT 발급 (웹 업데이트 기능 사용 시)

앱 내에서 최신 버전으로 업데이트하는 기능을 사용하려면 GitHub PAT이 필요합니다.

1. GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. **Generate new token** 클릭
3. 권한 설정:
   - Repository: 본인의 fork 저장소 선택
   - Permissions → **Actions**: Read and write
4. 생성된 토큰 복사 → 이것이 `GH_PAT`

---

### 5. Vercel 배포

1. [vercel.com](https://vercel.com)에서 **Add New Project**
2. 본인의 fork 저장소 선택
3. Framework Preset: **Next.js** (자동 감지됨)
4. **Environment Variables** 탭에서 아래 변수를 입력합니다.

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `AUTH_USER` | 로그인 아이디 | ✅ |
| `AUTH_PASS` | 로그인 비밀번호 | ✅ |
| `SESSION_SECRET` | 세션 토큰 서명 키 (임의 랜덤 문자열 권장) | 권장 |
| `GAS_URL` | GAS 웹앱 배포 URL | ✅ |
| `GH_PAT` | GitHub Personal Access Token | 웹 업데이트 사용 시 |

5. **Deploy** 클릭

> `AUTH_USER`를 설정하지 않으면 로그인 없이 누구나 접근 가능합니다.  
> `SESSION_SECRET`을 생략하면 `AUTH_PASS`가 서명 키로 대신 사용됩니다.

---

## 업데이트

### GAS 스키마 업데이트

라이브러리 새 버전에서 DB 구조(헤더/시트)가 변경된 경우:

1. GAS 편집기에서 **라이브러리 → PriorityMatrixLibrary** 버전을 최신으로 변경하고 저장합니다.
2. 앱 로그인 시 업데이트 알림이 표시됩니다. **업데이트하기**를 클릭합니다.
   - 또는 설정 모달에서 **업데이트** 버튼을 클릭합니다.
   - 또는 스프레드시트 메뉴 **Priority Matrix → 스키마 업데이트**를 직접 실행합니다.
3. 기존 데이터는 유지되며 헤더/시트 구조만 변경됩니다.

### 웹 업데이트

upstream 저장소의 최신 코드를 fork에 반영하는 경우:

1. 앱 로그인 시 업데이트 알림에서 **업데이트하기** 클릭
2. GitHub Actions(`sync-upstream.yml`)가 실행되어 upstream의 최신 코드를 fork로 머지합니다.
3. Vercel이 자동으로 재배포됩니다 (수 분 소요).
4. 재배포 완료 후 새로 고침하면 반영됩니다.

> 웹 업데이트는 `GH_PAT` 환경변수가 필요합니다.  
> 업데이트 알림을 닫을 때 **더 보지 않기**를 체크하면 해당 버전에서는 다시 표시되지 않습니다.

---

## 개발자 — 버전 관리

버전을 올릴 때는 두 곳을 수정합니다.

**`lib/constants.js`** — 웹 표시 버전 (`v` prefix 포함):
```javascript
export const APP_VERSION = 'v0.1';
```

**`appscript/library_Code.gs`** — 내부 비교용 버전 (`v` prefix 없음):
```javascript
const CURRENT_GAS_VERSION = '0.1'; // DB 스키마 변경 시 올림
const CURRENT_WEB_VERSION = '0.1'; // 웹 코드 변경 시 올림
```

라이브러리를 변경한 경우 GAS 에디터에서 **배포 → 새 버전으로 배포** 후 사용자에게 라이브러리 버전 업데이트를 안내합니다.

---

## 환경변수 요약

```env
AUTH_USER=아이디
AUTH_PASS=비밀번호
SESSION_SECRET=랜덤_문자열_32자_이상_권장
GAS_URL=https://script.google.com/macros/s/XXXXX/exec
GH_PAT=github_pat_XXXXX
```

---

## 기능 요약

- **4분면 자동 분류**: 마감일까지 남은 시간 × 중요도로 Q1~Q4 자동 배치
- **반복 작업**: 매일 / 매주 / 격주 / N일 간격 / 요일 지정 반복
- **소프트 삭제**: 삭제 후 24시간 내 복구 가능, 이후 자동 영구 삭제
- **완료 이력**: 완료된 작업 보관 및 복구
- **메모**: 작업별 타임스탬프 메모
- **테마**: 다크 / 라이트 모드
- **실시간 동기화**: 모든 변경사항 Google Sheets에 즉시 반영
- **버전 관리**: GAS/웹 버전 불일치 감지 시 업데이트 알림
