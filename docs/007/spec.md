# Use Case: Instructor 대시보드

## Primary Actor
- 강사(Instructor)

## Precondition (사용자 관점)
- 로그인 상태이며 역할이 Instructor이다.

## Trigger
- 대시보드 메뉴에서 Instructor 대시보드로 이동한다.

## Main Scenario
1. 사용자는 Instructor 대시보드에 진입한다.
2. 시스템은 사용자 역할이 Instructor인지 확인한다.
3. 시스템은 강사가 소유한 코스 목록(상태: draft/published/archived)을 조회한다.
4. 시스템은 각 코스의 채점 대기 제출물 수(제출물 status='submitted')를 집계한다.
5. 시스템은 최근 제출물(최신 submitted/graded 순)을 제한 개수로 조회하여 표시한다.
6. 시스템은 핵심 위젯(내 코스, 채점 대기 수, 최근 제출물)을 화면에 표시한다.

## Edge Cases (간략 처리)
- 권한 오류: Instructor가 아니면 접근 차단 및 안내(로그인/권한 요청).
- 코스 없음: 빈 상태 안내(코스 생성 유도).
- 채점 대기/최근 제출물 없음: 빈 상태 안내.
- 네트워크/서버 오류: "대시보드 불러오기 실패" 재시도 안내.

## Business Rules
- BR-001 역할 가드: Instructor만 대시보드 접근 가능.
- BR-002 소유 범위: 강사가 소유한 코스에 한해 데이터 집계/표시.
- BR-003 상태 구분: 코스는 draft/published/archived로 분류하여 표시.
- BR-004 채점 대기: 해당 코스의 과제에 연결된 제출물 중 status='submitted'만 채점 대기로 집계.
- BR-005 최근 제출물: 제출시각/채점시각 기준 내림차순 정렬, 서버에서 상한(limit) 적용.
- BR-006 최소 컬럼: 목록/집계에 필요한 컬럼만 조회하여 성능 확보.

## Sequence Diagram

```plantuml
@startuml
actor User
participant FE
participant BE
database Database

User -> FE: Instructor 대시보드 진입
FE -> BE: GET /api/instructor/dashboard
BE -> Database: SELECT profiles WHERE user_id (역할 확인)
Database --> BE: role = instructor
alt 권한 아님
  BE --> FE: 403 Forbidden
  FE --> User: 권한 없음 안내
else Instructor
  BE -> Database: SELECT courses WHERE instructor_id = :userId
  Database --> BE: courses(id, title, status)
  BE -> Database: SELECT assignments WHERE course_id IN (:courseIds)
  Database --> BE: assignments(id, course_id)
  BE -> Database: SELECT submissions WHERE assignment_id IN (:assignmentIds)
                    AND status='submitted'
  Database --> BE: pending submissions
  BE -> Database: SELECT submissions WHERE assignment_id IN (:assignmentIds)
                    ORDER BY COALESCE(graded_at, submitted_at) DESC LIMIT :N
  Database --> BE: recent submissions
  BE --> FE: 200 OK {courses, pendingCounts, recent}
  FE --> User: 내 코스/채점 대기/최근 제출물 표시
end
@enduml
```

