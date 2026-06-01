# SnapSum 기획 문서

> 버전: 1.0 | 작성일: 2026-05-31 | 상태: MVP 기획 완료

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [기능 정의](#2-기능-정의)
3. [API 명세](#3-api-명세)
4. [DB 스키마](#4-db-스키마)
5. [컴포넌트 구조](#5-컴포넌트-구조)
6. [파일 구조](#6-파일-구조)
7. [환경변수](#7-환경변수)
8. [UI 레이아웃 / 와이어프레임](#8-ui-레이아웃--와이어프레임)
9. [Claude Vision 프롬프트 설계](#9-claude-vision-프롬프트-설계)
10. [iOS Shortcut 동작 명세](#10-ios-shortcut-동작-명세)
11. [에러 시나리오 및 처리](#11-에러-시나리오-및-처리)
12. [MVP 범위 및 2차 로드맵](#12-mvp-범위-및-2차-로드맵)

---

## 1. 서비스 개요

### 1-1. 한 줄 정의

스크린샷을 찍으면 AI가 자동으로 내용을 분석·요약·저장하는 스마트 캡처 앱.

### 1-2. 타겟 사용자

- 글로벌 영어권 사용자 (UI 언어: 영어)
- 쇼핑·뉴스·영상·아티클 등 일상적으로 스크린샷을 많이 찍는 사람
- 나중에 찾아보려고 찍었지만 갤러리에서 잊혀지는 스크린샷 문제를 겪는 사람

### 1-3. 경쟁 포지셔닝

| 서비스 | 가격 | 특징 |
|--------|------|------|
| ScreenshotAI | $9.99/월 | OCR 중심, AI 분석 기본 |
| Readwise | $7.99/월 | 독서 메모 특화, 스크린샷 부가 기능 |
| **SnapSum (우리)** | **$6~8/월** | 스크린샷 자동 감지 + Claude Vision 타입별 구조화 분석 |

### 1-4. 핵심 차별화 포인트

- 스크린샷 찍는 순간 자동으로 분석 시작 (별도 앱 실행 불필요)
- 콘텐츠 타입별로 의미 있는 구조화 데이터 추출 (단순 OCR이 아님)
- iOS Shortcut + Android APK 양방향 지원, 동일 백엔드

---

## 2. 기능 정의

### 2-1. 필수 기능 (MVP)

#### A. 스크린샷 자동 감지 및 분석

| 플랫폼 | 감지 방식 | 처리 흐름 |
|--------|-----------|-----------|
| iOS | Shortcuts 앱 자동화 (스크린샷 찍을 때 트리거) | 최신 사진 → Base64 → POST /api/analyze → 결과 알림 |
| Android | 백그라운드 서비스 FileObserver (Pictures/Screenshots 폴더 감시) | 새 파일 생성 감지 → Base64 → POST /api/analyze → FCM 알림 |

- 두 플랫폼 모두 동일한 `/api/analyze` 엔드포인트 사용
- 분석 완료 후 `/api/save`로 자동 저장

#### B. AI 분석 결과 구조 (타입별)

공통 필드 (모든 타입):
- `source_app`: 앱 감지 (YouTube, Instagram, Amazon, X 등)
- `url`: 스크린샷 내 URL 추출
- `content_type`: shopping / news / video / article
- `title`: 콘텐츠 제목
- `tags`: 자동 태그 배열 (최대 5개)

타입별 추가 필드:

**🛍 Shopping**
```
{
  "retailer": "Amazon",
  "price": "$29.99",
  "category": "Electronics",
  "highlights": [
    "Fast charging 65W",
    "Compatible with all USB-C devices",
    "2-year warranty"
  ]
}
```

**📰 News**
```
{
  "key_points": [
    "1. Fed raises interest rates by 0.25%",
    "2. Markets react with 1.2% drop",
    "3. Next meeting scheduled for September",
    "4. Inflation still above 3% target"
  ]
}
```

**🎬 Video**
```
{
  "duration": "12:34",
  "views": "1.2M",
  "likes": "48K",
  "highlights": [
    "Intro covers basic setup in first 2 min",
    "Main demo at 5:30",
    "Summary and links at end"
  ]
}
```

**📖 Article / Info**
```
{
  "key_points": [
    "1. Background context",
    "2. Main argument",
    "3. Supporting evidence",
    "4. Counterargument",
    "5. Conclusion"
  ]
}
```

#### C. 피드 화면

- 저장된 스크린샷 목록을 컴팩트 카드로 표시
- 타입 필터 칩: All / Shopping / News / Video / Article
- 무한 스크롤 또는 페이지네이션
- 카드 요소: 앱 아이콘 + 소스명 + 타입 배지 + 제목 + 핵심 2줄 요약 + URL

#### D. 상세 화면

- 타입별로 구조화된 상세 정보 표시
- 원본 스크린샷 미리보기 (저장된 경우)
- 삭제 버튼

#### E. 푸시 알림

- 분석 완료 시 즉시 발송
- iOS: APNs, Android: FCM
- 알림 내용: "Saved to SnapSum ✓ [타입] [요약 1줄]"

#### F. PWA 지원

- manifest.json (아이콘, 테마 컬러, standalone 모드)
- Service Worker (오프라인 피드 캐시)
- 웹앱 설치 가능 (모바일 브라우저 "홈 화면에 추가")

### 2-2. 선택 기능 (2차)

| 기능 | 설명 |
|------|------|
| 검색 | 제목, 태그, 타입으로 전문 검색 |
| Collections | 사용자가 직접 만드는 폴더 |
| 구독 결제 | Stripe 연동, $6~8/월 플랜 |
| 사용자 인증 | Supabase Auth (이메일/구글 로그인) |
| Android APK | React Native 또는 Kotlin 네이티브 APK |
| 공유 기능 | 분석 결과를 링크로 공유 |

---

## 3. API 명세

### 공통 규칙

- Base URL: `https://snapsum.vercel.app/api`
- 인증: 모든 요청 헤더에 `x-api-key: {API_KEY}` 포함
- Content-Type: `application/json`
- 응답 형식: JSON

### 3-1. POST /api/analyze

스크린샷 이미지를 Claude Vision으로 분석하고 구조화된 JSON 반환.

**Request**

```json
{
  "image": "base64_encoded_string",
  "image_type": "image/jpeg",
  "app_hint": "YouTube"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| image | string | 필수 | Base64 인코딩된 이미지 |
| image_type | string | 필수 | MIME 타입 (image/jpeg, image/png) |
| app_hint | string | 선택 | 클라이언트가 감지한 앱 이름 힌트 |

**Response 200**

```json
{
  "success": true,
  "data": {
    "source_app": "YouTube",
    "url": "https://youtu.be/abc123",
    "content_type": "video",
    "title": "How to Build a React App in 10 Minutes",
    "tags": ["react", "tutorial", "javascript", "webdev"],
    "duration": "10:24",
    "views": "234K",
    "likes": "12K",
    "highlights": [
      "Setup covered in first 2 minutes",
      "Component structure explained at 4:30",
      "Deployment guide at 8:00"
    ]
  }
}
```

**Response 400** — 이미지 없거나 분석 불가

```json
{
  "success": false,
  "error": "invalid_image",
  "message": "Image could not be processed"
}
```

**Response 401** — API Key 없거나 잘못됨

```json
{
  "success": false,
  "error": "unauthorized"
}
```

**Response 500** — Claude API 오류

```json
{
  "success": false,
  "error": "analysis_failed",
  "message": "AI analysis temporarily unavailable"
}
```

---

### 3-2. POST /api/save

분석 결과를 Supabase에 저장.

**Request**

```json
{
  "user_id": "user_abc123",
  "source_app": "YouTube",
  "content_type": "video",
  "title": "How to Build a React App in 10 Minutes",
  "url": "https://youtu.be/abc123",
  "thumbnail_url": "https://img.youtube.com/vi/abc123/0.jpg",
  "analysis": {
    "duration": "10:24",
    "views": "234K",
    "likes": "12K",
    "highlights": ["..."]
  },
  "tags": ["react", "tutorial"],
  "raw_screenshot_url": "https://storage.supabase.co/..."
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| user_id | string | 필수 | 사용자 식별자 |
| source_app | string | 필수 | 감지된 앱 이름 |
| content_type | enum | 필수 | shopping / news / video / article |
| title | string | 필수 | 콘텐츠 제목 |
| url | string | 선택 | 추출된 URL |
| thumbnail_url | string | 선택 | 썸네일 이미지 URL |
| analysis | object | 필수 | 타입별 구조화 데이터 |
| tags | string[] | 선택 | 태그 배열 |
| raw_screenshot_url | string | 선택 | 원본 스크린샷 저장 URL |

**Response 201**

```json
{
  "success": true,
  "item_id": "item_xyz789"
}
```

---

### 3-3. GET /api/items

저장 목록 조회 (페이지네이션 + 타입 필터).

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| user_id | string | 필수 | 사용자 식별자 |
| type | string | all | all / shopping / news / video / article |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 (최대 50) |

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "item_xyz789",
      "source_app": "YouTube",
      "content_type": "video",
      "title": "How to Build a React App in 10 Minutes",
      "url": "https://youtu.be/abc123",
      "thumbnail_url": "...",
      "tags": ["react", "tutorial"],
      "summary_line": "10-min tutorial covering React setup, component structure, and deployment",
      "created_at": "2026-05-31T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "has_next": true
  }
}
```

---

### 3-4. GET /api/items/[id]

특정 아이템 상세 조회.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "item_xyz789",
    "source_app": "YouTube",
    "content_type": "video",
    "title": "How to Build a React App in 10 Minutes",
    "url": "https://youtu.be/abc123",
    "thumbnail_url": "...",
    "analysis": {
      "duration": "10:24",
      "views": "234K",
      "likes": "12K",
      "highlights": [
        "Setup covered in first 2 minutes",
        "Component structure explained at 4:30",
        "Deployment guide at 8:00"
      ]
    },
    "tags": ["react", "tutorial"],
    "raw_screenshot_url": null,
    "created_at": "2026-05-31T10:30:00Z"
  }
}
```

**Response 404**

```json
{
  "success": false,
  "error": "not_found"
}
```

---

### 3-5. DELETE /api/items/[id]

아이템 삭제.

**Response 200**

```json
{
  "success": true,
  "message": "Item deleted"
}
```

---

## 4. DB 스키마

### 4-1. items 테이블

```sql
CREATE TABLE items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  source_app      TEXT NOT NULL,                        -- "YouTube", "Instagram", "Amazon" 등
  content_type    TEXT NOT NULL CHECK (
                    content_type IN ('shopping', 'news', 'video', 'article')
                  ),

  title           TEXT NOT NULL,
  url             TEXT,                                 -- 추출된 URL (없을 수 있음)
  thumbnail_url   TEXT,                                 -- 외부 썸네일 URL

  analysis        JSONB NOT NULL DEFAULT '{}',          -- 타입별 구조화 데이터
  tags            TEXT[] NOT NULL DEFAULT '{}',         -- 자동 태그

  raw_screenshot_url TEXT                               -- Supabase Storage URL (선택)
);

-- 인덱스
CREATE INDEX idx_items_user_id ON items (user_id);
CREATE INDEX idx_items_content_type ON items (content_type);
CREATE INDEX idx_items_created_at ON items (created_at DESC);
CREATE INDEX idx_items_user_type ON items (user_id, content_type);

-- RLS (Row Level Security) — 사용자 인증 도입 시 활성화
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
```

### 4-2. analysis JSONB 구조 (타입별)

**video 타입**
```json
{
  "duration": "10:24",
  "views": "234K",
  "likes": "12K",
  "highlights": ["string1", "string2", "string3"]
}
```

**shopping 타입**
```json
{
  "retailer": "Amazon",
  "price": "$29.99",
  "category": "Electronics",
  "highlights": ["string1", "string2", "string3"]
}
```

**news 타입**
```json
{
  "key_points": ["1. ...", "2. ...", "3. ...", "4. ..."]
}
```

**article 타입**
```json
{
  "key_points": ["1. ...", "2. ...", "3. ...", "4. ...", "5. ..."]
}
```

### 4-3. Supabase Storage 버킷

```
버킷명: screenshots
경로: {user_id}/{item_id}.jpg
접근: Private (signed URL 발급)
보존 기간: 무제한 (구독 만료 시 삭제 예정)
```

---

## 5. 컴포넌트 구조

### 5-1. 컴포넌트 목록 및 역할

| 컴포넌트 | 파일 | 역할 |
|----------|------|------|
| FeedCard | components/FeedCard.tsx | 피드 목록 아이템 카드 (컴팩트) |
| TypeBadge | components/TypeBadge.tsx | 타입 배지 (컬러 + 이모지 + 라벨) |
| FilterChips | components/FilterChips.tsx | 타입 필터 칩 (All/Shopping/News/Video/Article) |
| TabBar | components/TabBar.tsx | 하단 탭 바 (Feed/Search/Collections/Profile) |
| DetailShop | components/DetailShop.tsx | 쇼핑 상세 레이아웃 |
| DetailNews | components/DetailNews.tsx | 뉴스 상세 레이아웃 |
| DetailVideo | components/DetailVideo.tsx | 영상 상세 레이아웃 |
| DetailArticle | components/DetailArticle.tsx | 아티클 상세 레이아웃 |

### 5-2. 컴포넌트 Props 정의

#### FeedCard

```typescript
interface FeedCardProps {
  item: {
    id: string;
    source_app: string;
    content_type: ContentType;
    title: string;
    url?: string;
    thumbnail_url?: string;
    tags: string[];
    summary_line: string;   // 피드용 1줄 요약 (API에서 별도 생성)
    created_at: string;
  };
  onClick: (id: string) => void;
}
```

#### TypeBadge

```typescript
interface TypeBadgeProps {
  type: ContentType;  // 'shopping' | 'news' | 'video' | 'article'
  size?: 'sm' | 'md';
}

// 컬러 매핑
const TYPE_COLORS = {
  shopping: '#fb923c',  // 오렌지
  news:     '#60a5fa',  // 블루
  video:    '#f87171',  // 레드
  article:  '#34d399',  // 그린
};

const TYPE_LABELS = {
  shopping: '🛍 Shopping',
  news:     '📰 News',
  video:    '🎬 Video',
  article:  '📖 Article',
};
```

#### FilterChips

```typescript
interface FilterChipsProps {
  active: ContentType | 'all';
  onChange: (type: ContentType | 'all') => void;
}
```

#### TabBar

```typescript
type TabKey = 'feed' | 'search' | 'collections' | 'profile';

interface TabBarProps {
  active: TabKey;
  onTabChange: (tab: TabKey) => void;
}
```

---

## 6. 파일 구조

```
C:\Users\gtmin\Dropbox\5.개발\snapsum\
├── app/
│   ├── layout.tsx                     # 루트 레이아웃 (Inter 폰트, 다크 배경 #07070f)
│   ├── page.tsx                       # Feed 홈 화면
│   ├── globals.css                    # 전역 스타일 (CSS 변수, 스크롤바 커스텀)
│   ├── item/
│   │   └── [id]/
│   │       └── page.tsx               # 아이템 상세 화면
│   └── api/
│       ├── analyze/
│       │   └── route.ts               # POST: Claude Vision 분석
│       ├── save/
│       │   └── route.ts               # POST: Supabase 저장
│       └── items/
│           ├── route.ts               # GET: 목록 조회
│           └── [id]/
│               └── route.ts          # GET: 상세 조회 / DELETE: 삭제
│
├── components/
│   ├── FeedCard.tsx                   # 피드 카드 컴포넌트
│   ├── TypeBadge.tsx                  # 타입 배지
│   ├── FilterChips.tsx                # 필터 칩 그룹
│   ├── TabBar.tsx                     # 하단 탭 바
│   ├── DetailShop.tsx                 # 쇼핑 상세 뷰
│   ├── DetailNews.tsx                 # 뉴스 상세 뷰
│   ├── DetailVideo.tsx                # 영상 상세 뷰
│   └── DetailArticle.tsx             # 아티클 상세 뷰
│
├── lib/
│   ├── claude.ts                      # Claude API 호출 함수 (Prompt Caching 포함)
│   ├── supabase.ts                    # Supabase 클라이언트 초기화
│   └── types.ts                       # 전체 타입 정의 (ContentType, Item, AnalysisData 등)
│
├── public/
│   ├── manifest.json                  # PWA manifest
│   ├── sw.js                          # Service Worker (오프라인 캐시)
│   ├── icons/
│   │   ├── icon-192.png               # PWA 아이콘 192x192
│   │   └── icon-512.png               # PWA 아이콘 512x512
│   └── shortcuts/
│       └── snapsum.shortcut           # iOS Shortcut 배포 파일
│
├── plans/
│   └── plan.md                        # 이 문서
│
├── .env.local                         # 실제 환경변수 (gitignore)
├── .env.local.example                 # 환경변수 템플릿 (커밋)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── 설정정리.md                        # 운영 참고 문서
```

---

## 7. 환경변수

### 7-1. .env.local.example

```env
# Claude API (필수)
ANTHROPIC_API_KEY=

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API 인증 키 — 클라이언트(iOS Shortcut, Android)에서 사용
SNAPSUM_API_KEY=

# APNs (iOS 푸시) — 2차 기능
APNS_KEY_ID=
APNS_TEAM_ID=
APNS_PRIVATE_KEY=

# FCM (Android 푸시) — 2차 기능
FCM_SERVER_KEY=
```

### 7-2. 변수 설명

| 변수명 | 용도 | 필수 여부 |
|--------|------|-----------|
| ANTHROPIC_API_KEY | Claude Vision API 호출 | 필수 |
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL | 필수 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 클라이언트 사이드 Supabase | 필수 |
| SUPABASE_SERVICE_ROLE_KEY | 서버 사이드 Supabase (RLS 우회) | 필수 |
| SNAPSUM_API_KEY | 모바일 클라이언트 인증 | 필수 |
| APNS_KEY_ID | iOS 푸시 알림 | 2차 |
| APNS_TEAM_ID | iOS 푸시 알림 | 2차 |
| APNS_PRIVATE_KEY | iOS 푸시 알림 | 2차 |
| FCM_SERVER_KEY | Android 푸시 알림 | 2차 |

### 7-3. Vercel 배포 시 등록 필요

```
ANTHROPIC_API_KEY             → Production + Preview + Development
NEXT_PUBLIC_SUPABASE_URL      → Production + Preview + Development
NEXT_PUBLIC_SUPABASE_ANON_KEY → Production + Preview + Development
SUPABASE_SERVICE_ROLE_KEY     → Production only
SNAPSUM_API_KEY               → Production + Preview + Development
```

---

## 8. UI 레이아웃 / 와이어프레임

### 8-1. 디자인 토큰

```
배경:        #07070f  (거의 검정)
카드:        #0d0d1a  (진한 남색)
액센트:      #7b6ef6  (보라)
텍스트 1:    #ffffff
텍스트 2:    #9999bb
폰트:        Inter (Google Fonts)
모서리:      12px (카드), 20px (배지)
```

타입 배지 컬러:
```
Shopping  #fb923c  (오렌지)
News      #60a5fa  (블루)
Video     #f87171  (레드)
Article   #34d399  (그린)
```

### 8-2. Feed 화면

```
┌─────────────────────────────────┐
│  SnapSum                    [🔔] │  ← 헤더 (sticky)
├─────────────────────────────────┤
│ [All] [🛍] [📰] [🎬] [📖]       │  ← FilterChips (수평 스크롤)
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [YT 아이콘] YouTube  [🎬 Video]│  ← 카드 상단: 앱 + 타입배지
│ │ How to Build a React App... │ │  ← 제목 (2줄 clamp)
│ │ Setup covered in first 2... │ │  ← 요약 1줄
│ │ youtu.be/abc123        5분전│ │  ← URL + 시간
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [IG 아이콘] Instagram [🛍 Sho]│
│ │ Nike Air Max 2026 — Limited │
│ │ $129.99 · Amazon · Sneakers │
│ │ amazon.com/dp/...      1시간│
│ └─────────────────────────────┘ │
│          ... 스크롤 ...          │
├─────────────────────────────────┤
│   [Feed]  [Search] [Col] [Me]   │  ← 하단 TabBar
└─────────────────────────────────┘
```

### 8-3. Detail 화면 — Video 타입

```
┌─────────────────────────────────┐
│ [←]                       [🗑️] │  ← 헤더 (back + delete)
├─────────────────────────────────┤
│ [유튜브 아이콘] YouTube          │
│ [🎬 Video]                      │
│                                 │
│ How to Build a React App        │
│ in 10 Minutes                   │
│                                 │
│ youtu.be/abc123          [열기→] │  ← URL + 외부 링크
├─────────────────────────────────┤
│ Duration    Views     Likes     │
│  10:24      234K      12K       │  ← 메트릭 3종
├─────────────────────────────────┤
│ Highlights                      │
│ • Setup covered in first 2 min  │
│ • Component structure at 4:30   │
│ • Deployment guide at 8:00      │
├─────────────────────────────────┤
│ Tags                            │
│ [react] [tutorial] [javascript] │
├─────────────────────────────────┤
│ Saved 31 May 2026, 10:30 AM     │
└─────────────────────────────────┘
```

### 8-4. Detail 화면 — Shopping 타입

```
┌─────────────────────────────────┐
│ [←]                       [🗑️] │
├─────────────────────────────────┤
│ [아마존 아이콘] Amazon           │
│ [🛍 Shopping]                   │
│                                 │
│ Nike Air Max 2026 — Limited Ed. │
│                                 │
│ amazon.com/dp/B0...      [열기→] │
├─────────────────────────────────┤
│ Price           Category        │
│ $129.99         Sneakers        │
│                                 │
│ Retailer                        │
│ Amazon                          │
├─────────────────────────────────┤
│ Highlights                      │
│ • Limited edition colorway      │
│ • Free Prime shipping           │
│ • Ships in 2 days               │
├─────────────────────────────────┤
│ Tags                            │
│ [nike] [sneakers] [limited]     │
└─────────────────────────────────┘
```

### 8-5. 사용자 플로우

```
[스크린샷 찍기]
      ↓
[iOS Shortcut 자동 실행]
      ↓
[POST /api/analyze → Claude Vision]
      ↓
     성공? ── 아니오 ──→ [에러 알림: "Analysis failed, try again"]
      ↓ 예
[POST /api/save → Supabase]
      ↓
[푸시 알림: "Saved to SnapSum ✓ Video · How to Build a React App"]
      ↓
[사용자 알림 탭]
      ↓
[앱(PWA) Feed 화면으로 이동]
      ↓
[카드 탭 → Detail 화면]
```

---

## 9. Claude Vision 프롬프트 설계

### 9-1. 시스템 프롬프트 (Prompt Caching 적용)

```
You are SnapSum AI, a screenshot analysis assistant.

Analyze the provided screenshot and return a structured JSON response.

RULES:
1. Detect the source app (YouTube, Instagram, Amazon, X, Reddit, etc.)
2. Classify content type: shopping, news, video, or article
3. Extract visible URL if present
4. Generate a concise title (max 80 chars)
5. Generate 3-5 relevant tags
6. Fill type-specific fields based on visible content

OUTPUT FORMAT — always return valid JSON, no markdown:
{
  "source_app": string,
  "content_type": "shopping" | "news" | "video" | "article",
  "title": string,
  "url": string | null,
  "tags": string[],
  "analysis": {
    // shopping: { retailer, price, category, highlights: string[3] }
    // news:     { key_points: string[4] }
    // video:    { duration, views, likes, highlights: string[3] }
    // article:  { key_points: string[5] }
  },
  "summary_line": string  // 1-line summary for feed display (max 100 chars)
}

If the screenshot is unclear or unrecognizable, return:
{
  "error": "unrecognized",
  "message": "Could not analyze screenshot content"
}
```

### 9-2. Prompt Caching 구현 방식 (lib/claude.ts)

- 시스템 프롬프트에 `cache_control: { type: "ephemeral" }` 적용
- 이미지는 매 요청마다 다르므로 캐시 대상 아님
- 기대 효과: 시스템 프롬프트 토큰 비용 90% 절감 (캐시 히트 시)

### 9-3. 모델 및 파라미터

```
모델: claude-sonnet-4-6
max_tokens: 1024
temperature: 0 (일관된 JSON 출력)
```

---

## 10. iOS Shortcut 동작 명세

### 10-1. 자동화 트리거

- 트리거: "스크린샷을 찍을 때" (자동화)
- 즉시 실행 (확인 없이)

### 10-2. Shortcut 액션 순서

```
1. [최신 사진 가져오기]
   - 유형: 사진
   - 최신 1장

2. [Base64 인코딩]
   - 입력: 최신 사진
   - 형식: Base64 (줄바꿈 없음)

3. [URL 콘텐츠 가져오기]  ← API 호출
   - URL: https://snapsum.vercel.app/api/analyze
   - 방법: POST
   - 헤더:
     - Content-Type: application/json
     - x-api-key: {SNAPSUM_API_KEY}
   - 요청 본문 (JSON):
     {
       "image": "{Base64 결과}",
       "image_type": "image/jpeg",
       "app_hint": ""
     }

4. [딕셔너리 가져오기]
   - 입력: URL 콘텐츠 결과
   - 키: data.title

5. [알림 표시]
   - 제목: "Saved to SnapSum ✓"
   - 본문: "{data.content_type} · {data.title}"
   - 소리: 기본
```

### 10-3. 배포 방식

- `.shortcut` 파일을 `public/shortcuts/snapsum.shortcut`에 저장
- 웹앱 Profile 탭 또는 온보딩 화면에서 다운로드 링크 제공
- 파일 클릭 시 iPhone이 Shortcuts 앱에서 자동으로 가져오기 실행

---

## 11. 에러 시나리오 및 처리

### 11-1. 클라이언트 → API 구간

| 에러 상황 | HTTP 코드 | 서버 응답 | 클라이언트 처리 |
|-----------|-----------|-----------|-----------------|
| API Key 없음 / 잘못됨 | 401 | `{ error: "unauthorized" }` | iOS: 알림 "Auth error — check API key" |
| 이미지 Base64 손상 | 400 | `{ error: "invalid_image" }` | iOS: 알림 "Image error — retake screenshot" |
| 이미지 크기 초과 (10MB+) | 413 | `{ error: "image_too_large" }` | iOS: 알림 없음 (자동 무시) |
| 네트워크 연결 없음 | N/A | timeout | iOS: Shortcut 오류 "Network unavailable" |
| 서버 점검 중 | 503 | `{ error: "service_unavailable" }` | iOS: 알림 "SnapSum is temporarily down" |

### 11-2. AI 분석 구간

| 에러 상황 | 원인 | 처리 |
|-----------|------|------|
| Claude API 호출 실패 | ANTHROPIC_API_KEY 만료 또는 한도 초과 | 500 반환, Vercel 로그 기록 |
| JSON 파싱 실패 | Claude가 비정형 응답 반환 | 재시도 1회, 실패 시 `analysis_failed` 반환 |
| 스크린샷 내용 불인식 | 빈 화면, 사진, 비텍스트 이미지 | `{ error: "unrecognized" }` 반환, 저장 안 함 |
| 타입 분류 불가 | 혼합 콘텐츠 | 기본값 `article`로 처리 |

### 11-3. DB 저장 구간

| 에러 상황 | 원인 | 처리 |
|-----------|------|------|
| Supabase 연결 실패 | SERVICE_ROLE_KEY 오류 또는 네트워크 | 500 반환, 분석 결과 응답은 유지 |
| 중복 저장 | 동일 스크린샷 2회 전송 | `created_at + image hash` 중복 체크 (추후 구현) |
| 스토리지 업로드 실패 | 버킷 정책 오류 | `raw_screenshot_url: null`로 저장 (비중요 필드) |

### 11-4. PWA / 프론트엔드

| 에러 상황 | 처리 |
|-----------|------|
| API 응답 없음 (피드 로딩) | 스켈레톤 UI 표시 → "Failed to load. Tap to retry" |
| 아이템 삭제 실패 | 토스트 알림 "Delete failed, try again" |
| 오프라인 상태 | Service Worker 캐시에서 마지막 피드 표시, 상단 "You're offline" 배너 |
| 존재하지 않는 아이템 ID | 404 응답 → "Item not found" 화면 + Feed로 이동 버튼 |

---

## 12. MVP 범위 및 2차 로드맵

### 12-1. MVP (1차) — 우선 구현 대상

| 기능 | 세부 내용 | 우선순위 |
|------|-----------|---------|
| 백엔드 API | analyze + save + items (list, detail, delete) | P0 |
| Claude Vision 분석 | 4개 타입, Prompt Caching | P0 |
| Supabase 저장 | items 테이블, RLS 비활성 (1차) | P0 |
| Feed 화면 | 컴팩트 카드, 타입 필터 | P0 |
| Detail 화면 | 타입별 구조화 뷰 | P0 |
| iOS Shortcut 파일 | .shortcut 생성 + 웹에서 다운로드 | P0 |
| PWA manifest | 홈 화면 설치 지원 | P1 |
| Service Worker | 오프라인 피드 캐시 | P1 |
| 다크 테마 | 목업 디자인 그대로 | P0 |

### 12-2. 2차 로드맵

| 기능 | 예상 시점 | 비고 |
|------|-----------|------|
| Android APK | 2차 | Kotlin FileObserver + FCM |
| 검색 기능 | 2차 | Supabase Full-text search |
| Collections | 2차 | 폴더 개념, 다대다 관계 |
| Supabase Auth | 2차 | 이메일 / 구글 로그인 |
| Stripe 구독 | 2차 | $6~8/월, 무료 20개 제한 |
| 푸시 알림 서버 | 2차 | APNs + FCM 통합 |
| 공유 기능 | 3차 | 분석 결과 공개 링크 |
| 웹 확장 프로그램 | 3차 | Chrome Extension |

### 12-3. 구현 순서 권장

```
1단계: 백엔드 API 3종 구현 + Claude Vision 연동 검증
2단계: Supabase 스키마 생성 + save/items API 완성
3단계: 프론트엔드 Feed + Detail 화면 구현
4단계: iOS Shortcut 파일 생성 + 엔드투엔드 테스트
5단계: PWA manifest + Service Worker 추가
6단계: Vercel 배포 + 환경변수 등록
```

---

다음 단계: developer 에이전트로 구현 진행
