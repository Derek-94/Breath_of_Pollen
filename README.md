<div align="center">

🟢 🟡 🟠 🔴 🟣

# 花粉の呼吸

**한국어** | [日本語](./README.ja.md)

오늘의 꽃가루 레벨과 기온으로 최적의 코디를 제안하는 일본 날씨 앱

🔗 **[breath-of-pollen.vercel.app](https://breath-of-pollen.vercel.app)**

</div>

---

## 소개

일본은 전체 인구의 절반 이상이 꽃가루 알레르기를 가지고 있습니다. 기존 날씨 앱들은 날씨 정보를 제공하지만, "그래서 오늘 뭘 입어야 하지?"라는 질문까지는 답해주지 않습니다.

**花粉の呼吸**은 스기(삼나무)·히노키(편백) 꽃가루 지수와 기온을 결합해, 마스크 착용 여부부터 코트 필요 여부까지 한 화면에서 알려주는 모바일 웹 앱입니다.

---

## 주요 기능

- 🌡️ **실시간 날씨** — 현재 기온, 최고/최저, 시간대별 예보
- 🌿 **꽃가루 정보** — 스기(スギ)·히노키(ヒノキ) 5단계 레벨 표시
- 🧥 **코디 추천** — 기온 + 꽃가루 레벨 기반 옷차림 제안
- 🧺 **야외 빨래 가능 여부** — 꽃가루 수준에 따른 빨래 조언
- 📅 **주간 예보** — 7일간 날씨 + 날짜별 꽃가루 레벨
- 📍 **위치 선택** — GPS 자동 감지 또는 47개 도도부현 수동 선택

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| 날씨 데이터 | [Open-Meteo](https://open-meteo.com) (JMA 모델, 무료) |
| 꽃가루 데이터 | [Google Pollen API](https://developers.google.com/maps/documentation/pollen) |
| 위치 역지오코딩 | [Nominatim](https://nominatim.openstreetmap.org) (OpenStreetMap) |
| 배포 | Vercel |

---

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/Derek-94/Breath_of_Pollen.git
cd Breath_of_Pollen
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 내용을 입력합니다.

```bash
GOOGLE_POLLEN_API_KEY=your_api_key_here
```

Google Pollen API 키 발급 방법:
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. **Pollen API** 활성화
4. 사용자 인증 정보 → API 키 생성

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Derek-94/Breath_of_Pollen)

Vercel 배포 시 Environment Variables에 `GOOGLE_POLLEN_API_KEY`를 반드시 추가해야 합니다.

---

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── weather/     # Open-Meteo 날씨 API 프록시
│   │   ├── pollen/      # Google Pollen API 프록시
│   │   └── location/    # Nominatim 역지오코딩 프록시
│   ├── opengraph-image.tsx  # 동적 OG 이미지 생성
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── weather/
│       ├── pollen-card.tsx      # 꽃가루 정보 카드
│       ├── outfit-card.tsx      # 코디 추천 카드
│       ├── outfit-detail.tsx    # 코디 상세 모달
│       ├── location-picker.tsx  # 지역 선택 화면
│       ├── weekly-view.tsx      # 주간 예보
│       └── ...
└── lib/
    ├── weather-utils.ts         # 날씨 코드 변환, 코디 로직
    └── prefecture-coords.ts     # 47도도부현 좌표 데이터
```

---

## 라이선스

MIT
