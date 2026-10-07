# 곰선임 홈페이지

홈페이지·업무 프로그램 제작 포트폴리오 사이트입니다. https://gompartner.co.kr

- 포트폴리오 26건과 직접 만져 볼 수 있는 데모
- 가격, 진행 안내, 자주 묻는 질문, 주요 경력
- 자료실: 개인정보처리방침·이용약관 생성기, 웹접근성 점검표, 검색 결과 미리보기 등 무료 도구

## 기술

- Next.js 16 (App Router, 정적 내보내기) + React + TypeScript
- Tailwind CSS 4, Pretendard 서브셋 폰트
- GitHub Pages 배포 (`.github/workflows/deploy.yml`, main 푸시 시 자동)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ 에 정적 파일 생성
npm run lint
```

## 폴더

| 경로 | 내용 |
| --- | --- |
| `app/(site)` | 첫 화면, 포트폴리오, 가격, 자주 묻는 질문, 주요 경력, 자료실 |
| `app/demo/[slug]` | 데모 페이지 (사용법 가이드, 예상 가격 표시) |
| `components/demos` | 데모 26개 |
| `components/tools` | 자료실 도구 |
| `data` | 포트폴리오 목록, 가격, 자주 묻는 질문, 업종, 도구 |
| `scripts` | 폰트 서브셋 생성, 검색엔진 IndexNow 알림 |

## 참고

- 데모의 상호, 지명, 사람 이름은 모두 가상이며 초성이나 마스킹으로 표기합니다.
- 데모 날짜는 오늘 기준으로 계산됩니다.
- 사진은 직접 촬영하거나 무료 이미지(Unsplash, Pexels), AI 생성 이미지를 사용했습니다.
