# short_front

Vue 3 + TypeScript 기반 URL 단축 서비스 프론트엔드입니다.

## 기능
- 회원가입/로그인 화면
- 로그인 사용자 전용 어드민 접근
- 링크 생성 폼: 원본 URL, 기간(TTL/만료시각), 비밀번호, 최대 허용 사용량, 일회용
- 어드민 패널: 생성된 단축 링크 목록/정책/상태/사용량 확인
- 한국어/영어 i18n 토글
- 모바일 반응형 UI

## 실행
```bash
cd short_front
npm install
npm run dev
```

기본 API 주소는 `http://localhost:8000` 입니다.
필요하면 `.env` 파일에 아래 값 추가:

```bash
VITE_API_BASE=http://localhost:8000
```
