# Implementation Plan: 홈 페이지 ('/')

## 개요
- Home HeroSearch — `src/features/home/components/hero-search.tsx`: 검색/CTA 컴포넌트. 검색어를 `/courses?search=`로 라우팅.
- CategoryFilterBar — `src/features/home/components/category-filter-bar.tsx`: 카테고리/난이도 칩. `/courses`로 이동.
- HomeCourseSection — `src/features/home/components/home-course-section.tsx`: 코스 섹션(최신/인기). `useCourses` 재사용.
- LearnerWidgets — `src/features/home/components/learner-widgets.tsx`: 마감 임박/최근 피드백. `useDashboardSummary` 재사용.
- InstructorWidgets — `src/features/home/components/instructor-widgets.tsx`: 강사용 빠른 액션/최근 제출물. `useInstructorDashboard` 재사용.
- Page Composition — `src/app/page.tsx`: 위 컴포넌트 조합해 홈 화면 구성.

## Diagram
```mermaid
graph TB
  subgraph Home Page
    P[page.tsx]
    P --> H[HeroSearch]
    P --> C[CategoryFilterBar]
    P --> S1[HomeCourseSection(popular)]
    P --> S2[HomeCourseSection(latest)]
    P --> L[LearnerWidgets]
    P --> I[InstructorWidgets]
  end

  subgraph Hooks/API
    S1 --> UC[useCourses]
    S2 --> UC
    L --> UDS[useDashboardSummary]
    I --> UID[useInstructorDashboard]
    UC --> API[/api/courses]
    UDS --> API2[/api/dashboard/summary]
    UID --> API3[/api/instructor/dashboard]
  end
```

## Implementation Plan
- HeroSearch
  - 검색 인풋 + CTA 버튼. Enter/버튼 → `/courses?search=...`
  - QA
    - [ ] 빈 검색어 제출 시 무시
    - [ ] Enter/버튼 모두 동작
- CategoryFilterBar
  - 카테고리/난이도 칩 → `/courses?category=..&difficulty=..`
  - QA
    - [ ] 칩 클릭 시 라우팅 반영
- HomeCourseSection
  - props: `title`, `query`(CourseListQuery). `useCourses`로 로드 → Card 그리드
  - 로딩/Skeleton, 에러/Alert, 빈 상태 처리
  - QA
    - [ ] popular/latest 각각 정상 로드
    - [ ] 에러/빈 상태 UI
- LearnerWidgets
  - `useDashboardSummary`로 마감 임박/최근 피드백 표시
  - 인증/에러 시 섹션 숨김 처리
  - QA
    - [ ] 항목 클릭 시 해당 상세 페이지로 이동
- InstructorWidgets
  - `useInstructorDashboard`로 내 코스 요약/최근 제출물
  - 401/403/에러 시 섹션 숨김 처리
  - QA
    - [ ] 빠른 액션 링크(코스/과제 관리) 정상 이동
- page.tsx
  - 모든 컴포넌트 조합. 히어로 이미지: picsum.photos 유효 이미지 사용
  - 전부 Client Component 유지, params 불필요

