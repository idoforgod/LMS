# 003 Learner 대시보드 — 최소 모듈화 설계(Plan)

## 개요
- Module: Dashboard Backend Schema — `src/features/dashboard/backend/schema.ts`
  - 대시보드 요약 응답/내부 행 타입 정의(zod). 진행률/임박 기준/피드백 요약 스키마 포함.
- Module: Dashboard Backend Service — `src/features/dashboard/backend/service.ts`
  - Supabase 질의 및 집계(진행률·임박·최근 피드백) 로직. 비즈니스 규칙 적용.
- Module: Dashboard Backend Error — `src/features/dashboard/backend/error.ts`
  - 에러 코드 상수 및 타입 정의.
- Module: Dashboard Backend Route — `src/features/dashboard/backend/route.ts`
  - `GET /api/dashboard/summary` 라우트 등록. 인증/역할(Learner) 검증, 결과 응답.
- Module: Dashboard DTO Re-export — `src/features/dashboard/lib/dto.ts`
  - 프런트엔드에서 사용할 응답 스키마/타입 재노출.
- Module: Dashboard Constants — `src/features/dashboard/constants/index.ts`
  - 임박 임계치(기본 72h), 피드백 개수(기본 5) 등 기능 설정값.
- Module: useDashboardSummary Hook — `src/features/dashboard/hooks/useDashboardSummary.ts`
  - `@tanstack/react-query` 기반 조회 훅. `@/lib/remote/api-client` 경유, zod 파싱.
- Module: UI Components — `src/features/dashboard/components/*`
  - `dashboard-summary.tsx`(요약 헤더), `my-courses-list.tsx`, `imminent-assignments.tsx`, `recent-feedback.tsx`
  - 모두 Client Component(`"use client"`), shadcn-ui 조합, 접근성 준수.
- Integration: Page 연결 — `src/app/(protected)/dashboard/page.tsx`
  - 훅을 사용해 데이터 바인딩, 스켈레톤/에러 토스트/재시도 UI.

## Diagram
```mermaid
flowchart LR
  subgraph FE[Frontend]
    Page[dashboard/page.tsx]
    Hook[useDashboardSummary]
    Comp1[dashboard-summary]
    Comp2[my-courses-list]
    Comp3[imminent-assignments]
    Comp4[recent-feedback]
  end

  subgraph BE[Backend]
    Route[/api/dashboard/summary]
    Service[dashboard service]
    Schema[schema zod]
    Error[error codes]
  end

  subgraph Shared
    DTO[dto re-export]
    C[constants]
    API[api-client]
  end

  Page --> Hook
  Hook --> API
  API --> Route
  Route --> Service
  Service --> Schema
  Service --> Error
  Service --> DB[(Supabase DB)]
  Schema --> DTO
  DTO --> Hook
  C --> Service
  C --> Hook
  Hook --> Comp1
  Hook --> Comp2
  Hook --> Comp3
  Hook --> Comp4
```

## Implementation Plan

### 1) Backend
- schema.ts
  - 타입: `DashboardSummary`(myCourses[], imminentAssignments[], recentFeedback[]), 각 항목의 최소 필드(id, title, progress, dueDate, courseId, score, feedback, updatedAt 등) 정의.
  - 요청 파라미터 없음(쿼리 파라미터로 임계치/개수 옵션 허용: optional `hours`/`limit`).
- error.ts
  - 코드: `unauthorized`, `forbidden_role`, `database_error`, `invalid_query` 정의.
- service.ts
  - 입력: `client: SupabaseClient`, `userId: string`, 옵션 `{ hours=72, limit=5 }`.
  - 질의:
    - enrollments → 사용자의 수강 코스 id 수집.
    - assignments → 해당 코스의 `status='published'` 목록과 `due_date` 로 임박 목록 산출.
    - submissions → 사용자 제출물과 상태/점수/피드백 취합.
  - 집계:
    - 진행률 = (완료 과제 수) / (전체 published 과제 수). 완료 판단: `status='graded'` 또는 제출 요건 충족 상태(`status='submitted'`이면서 평가 정책상 완료로 간주 시 — 본 릴리즈에서는 graded + submitted 둘 다 완료로 계산 옵션화 가능, 기본은 graded|submitted).
    - 임박 = 현재 UTC 기준 `due_date <= now + hours` AND `status='published'` AND 미완료.
    - 최근 피드백 = `submissions.feedback IS NOT NULL` OR `status='graded'` 정렬 `graded_at DESC` 상위 `limit`.
  - 반환: `success(data)` 혹은 `failure` 공통 응답 사용.
- route.ts
  - `GET /api/dashboard/summary` 등록, `Authorization: Bearer <token>` 필수.
  - Learner 역할 검증(`profiles.role = 'learner'`) 후 service 호출.
  - `respond(c, result)`로 응답.
- app.ts 통합
  - `registerDashboardRoutes(app)` 호출 추가.

### 2) Frontend
- constants/index.ts
  - `DEFAULT_IMMINENT_HOURS=72`, `DEFAULT_FEEDBACK_LIMIT=5` export.
- lib/dto.ts
  - 백엔드 `schema.ts` 타입/스키마 재노출.
- hooks/useDashboardSummary.ts
  - "use client" 준수, `useQuery` 사용.
  - 요청: `/api/dashboard/summary` (필요 시 `?hours=&limit=`)를 `apiClient`로 호출.
  - 응답: dto 스키마로 파싱, 에러는 `extractApiErrorMessage`.
  - Query Key: `['dashboard','summary', hours, limit]`.
- components/*
  - 모든 파일 상단 `"use client"`.
  - `dashboard-summary.tsx`: 총 코스 수, 평균 진행률 등 요약 카드.
  - `my-courses-list.tsx`: 코스명/진행률 바(Progress), 비어있을 때 공백 상태와 CTA.
  - `imminent-assignments.tsx`: D-시간/마감일 표기, 최대 N개.
  - `recent-feedback.tsx`: 점수/피드백 스니펫, 최신순 N개.
  - UI: shadcn-ui의 `card`, `badge`, `separator`, `button` 재사용. 추가 필요 시 아래 명령으로 설치:
    - 설치 예시
      - npx shadcn@latest add progress
      - npx shadcn@latest add alert
      - npx shadcn@latest add skeleton
- page 연동 — `src/app/(protected)/dashboard/page.tsx`
  - 기존 레이아웃 유지, `useDashboardSummary` 데이터로 섹션 렌더.
  - 로딩: skeleton, 에러: toast 및 재시도 버튼.
  - 이미지 placeholder: `https://picsum.photos/seed/dashboard/960/420` 유지.
  - `params: Promise<Record<string, never>>` 유지(가이드 준수).

### 3) 에지 케이스 처리
- 코스/과제/피드백 없음: 빈 상태 문구 + 탐색/학습 시작 CTA.
- 권한 오류: “Learner만 접근 가능” 메시지 + 적절한 안내.
- 시간대: 서버 UTC → FE에서 `date-fns`로 로컬 표기.
- 부분 실패: Section 단위로 개별 보호(가능하면 서버에서 일괄 응답, FE는 전체 실패 시 토스트/재시도).

### 4) 테스트 & QA
- Business Logic Unit Tests (service)
  - 진행률 계산: 0%, 일부 완료, 전부 완료 케이스.
  - 임박 판정: 경계값(=72h), 과거/미래 조합.
  - 피드백 정렬/개수 제한: `graded_at` 기준 정렬, 상위 N.
  - 권한 검증 실패: learner 아님 → 403.
  - DB 오류 전파: `database_error` 코드 반환.
- Presentation QA Sheet (components)
  - 목록이 길 때 스크롤/접근성 보장(tab, role 속성).
  - 로딩 시 skeleton 노출, 완료 시 전환 애니메이션 최소화.
  - 에러 발생 시 토스트 노출 및 재시도 버튼 동작.
  - 모바일(≤375px)/태블릿/데스크톱 반응형 레이아웃 확인.
  - 색상 대비, 포커스 링, 키보드 네비게이션 확인.

### 5) 작업 순서 제안
1. Backend schema/error/service/route 초안 작성 → app.ts에 라우트 등록.
2. Frontend dto/constants/hook 작성.
3. Components 스켈레톤 구성 → page에 연결.
4. 로딩/에러 처리와 빈 상태 UX 보완.
5. 최소 단위 테스트 계획 반영 및 목데이터로 수기 검증.

### 6) 주의사항(가이드 반영)
- 모든 프런트 파일은 Client Component(`"use client"`).
- page.tsx의 `params`는 Promise 타입으로 유지.
- HTTP는 반드시 `@/lib/remote/api-client` 경유.
- zod로 스키마 검증, react-query로 서버 상태 관리.
- shadcn-ui 컴포넌트 추가 시 설치 명령 별도 실행.
- placeholder 이미지는 `picsum.photos` 유효 URL 사용.
