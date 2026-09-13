# UMC 11th · Web 학습 기록

UMC 11기 Product Engineering(Web) 트랙 활동 기록입니다.
워크북으로 배운 내용을 **내 언어로 다시 정리한 글**과, 주차별 **실습·미션 코드**를 함께 둡니다.

> 워크북 원문은 포함하지 않습니다. 학습한 개념을 재구성한 글과 직접 작성한 코드만 올립니다.

## 구조

```
.
├── notes/              주차별 개념 정리 (셀프 체크 포함)
├── week0/              0주차 실습 — HTML / CSS / JS
├── week1-typescript/   1주차 실습 — TypeScript 프로젝트
└── api/                0주차 실습 — Postman 워크스페이스
```

## 정리 글

### 0주차 — 웹 기초와 개발 환경

| 글 | 다루는 것 |
|---|---|
| [브라우저가 화면을 만드는 3단 구조](./notes/week00/01-html-css-js.md) | HTML/CSS/JS 역할, 시맨틱 태그, 박스 모델, Flex, DOM, `defer`, pnpm |
| [요청 한 번에 무슨 일이 일어나는가](./notes/week00/02-client-server-http.md) | 클라이언트/서버 vs 프론트/백엔드, API, URL 구조, HTTP Method, Status Code |

### 1주차 — 타입 시스템과 데이터 모델링

| 글 | 다루는 것 |
|---|---|
| [타입은 실행되지 않는다](./notes/week01/01-typescript.md) | 컴파일 타임/런타임, 추론, 유니언·좁히기, `??` vs `\|\|`, `unknown`, 제네릭 |
| [화면을 보고 테이블을 그리는 법](./notes/week01/02-erd-db-design.md) | RDB vs NoSQL, 정규화, ACID, 1:N/N:M, 중간 테이블, Soft Delete |

## 실습 코드

| 위치 | 내용 | 실행 |
|---|---|---|
| [`week0/`](./week0) | 자기소개 카드 — 시맨틱 구조, Flexbox, DOM 이벤트 | Live Server |
| [`week1-typescript/src/index.ts`](./week1-typescript/src/index.ts) | 스터디 회원 관리 — 리터럴 유니언, 옵셔널 프로퍼티, `find()` 좁히기, `\|\|` vs `??`, `unknown` 타입 가드 | `pnpm exec tsc && node dist/index.js` |
| [`api/`](./api) | Postman 컬렉션 — GET/POST, 쿼리 파라미터, 404 응답 확인 | Postman |

## 기록 방식

각 정리 글은 같은 뼈대를 따릅니다.

```
1. 왜 보게 됐나 / 내가 헷갈렸던 지점
2. 핵심 개념 (표 + 다이어그램)
3. 직접 작성한 코드로 확인
4. 셀프 체크 (답은 접어둠)
5. 공식 문서 링크
```

셀프 체크를 먼저 풀어보고 막히는 항목만 본문으로 돌아가면 복습이 빨라집니다.

---

작성자: [우준영](https://github.com/snow-jun-0) · [velog](https://velog.io/@snow-jun-0/posts)
