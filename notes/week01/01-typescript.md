# 타입은 실행되지 않는다 — TypeScript 타입 시스템 정리

> **한 줄 요약** — TS가 잡아주는 건 "컴파일 타임에 알 수 있는 실수"뿐이다. 타입은 JS로 변환되면서 전부 지워지므로, 런타임에 오는 값은 여전히 내가 좁혀야 한다.

## 0. 이번에 관점이 바뀐 지점

이전엔 TypeScript를 "에러 안 나게 해주는 것" 정도로 생각했다.
그런데 컴파일 결과물을 직접 열어보니 타입 표기가 **한 줄도 남아있지 않았다.**

```ts
// src/index.ts
const level: number = 1;
console.log('레벨: ' + level);
```

```js
// dist/index.js — 타입이 사라졌다
const level = 1;
console.log('레벨: ' + level);
```

즉 TS는 **실행 중에 나를 지켜주지 않는다.** 검사는 빌드할 때 끝나고, 런타임은 그냥 JS다.
이걸 알고 나니 "그럼 API 응답처럼 실행 중에 들어오는 값은?" 하는 질문이 자연스럽게 따라왔고, 그게 이번 주차의 진짜 주제였다.

## 1. 환경 세팅

```bash
mkdir ts-practice && cd ts-practice
pnpm init
pnpm add -D typescript
mkdir src
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
```

```bash
pnpm exec tsc            # 검사 + dist/ 생성
pnpm exec tsc --noEmit    # 검사만 (CI나 커밋 전 체크용)
node dist/index.js        # 실행
```

`--noEmit`은 실제로 자주 쓰게 된다. 파일을 만들 필요 없이 타입만 확인하고 싶을 때.

## 2. 컴파일 타임 vs 런타임

| | 언제 | 무엇을 확인 | 통과 못 하면 |
|---|---|---|---|
| 컴파일 타임 | `tsc` 실행 시 | 타입 정합성 | 빌드 실패 (코드 실행 안 됨) |
| 런타임 | `node dist/...` 실행 시 | 실제 값 | 앱이 죽음 |

**TS가 잡아주는 것**

```ts
function addScore(base: number, bonus: number) {
  return base + bonus;
}

addScore(80, '10');
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'
//    → 실행 전에 잡힘
```

JS였다면 `"8010"`이라는 문자열이 조용히 나왔을 것이다. 에러도 안 나고, 화면에만 이상하게 찍힌다. 이런 게 제일 찾기 어렵다.

**TS가 못 잡는 것**

```ts
const names = ['준영'];
console.log(names[5].toUpperCase());
// ✅ 컴파일 통과 (TS는 names[5]를 string으로 봄)
// ❌ 런타임: TypeError: Cannot read properties of undefined
```

배열 인덱스 접근은 TS가 항상 값이 있다고 가정한다. 실제 길이는 실행해봐야 아는 정보이기 때문이다.

> **정리** — 컴파일 성공은 "타입이 앞뒤가 맞는다"는 뜻이지 "실행이 성공한다"는 뜻이 아니다.

## 3. 타입 표기 vs 타입 추론

```ts
// 표기: 내가 직접 적는다
let score: number;
score = 90;

// 추론: 값을 보고 TS가 알아낸다
let name = '준영';     // string으로 추론
let count = 8;         // number로 추론
```

**내가 정한 기준**

| 상황 | 어떻게 |
|---|---|
| 선언과 동시에 값을 넣는다 | 추론에 맡긴다 |
| 함수 매개변수 | 반드시 적는다 (뭐가 들어올지 TS가 모름) |
| 값 없이 선언만 한다 | 적는다 |
| 함수 반환 타입 | 기본은 추론, 계약을 고정하고 싶을 때만 적는다 |

반환 타입을 굳이 적는 케이스가 이해가 안 갔는데, 이 예제로 납득했다.

```ts
function makeMessage(level: number): string {
  if (level > 0) {
    return `현재 ${level}레벨`;
  }
  // ❌ Function lacks ending return statement
  //    → 반환 타입을 적었기 때문에 빠진 return을 컴파일 타임에 잡아준다
}
```

추론에 맡겼다면 `string | undefined`로 조용히 넘어갔을 것이다.
**반환 타입 명시는 "이 함수는 반드시 이걸 준다"는 약속을 강제하는 장치**다.

## 4. 원시 값 vs 객체 값

```ts
const a = { id: 1 };
const b = { id: 1 };
const c = a;

console.log(a === b); // false — 내용은 같지만 다른 객체
console.log(a === c); // true  — 같은 객체를 가리킴
```

```
원시 값:   변수 ─→ [ 1 ]           값 자체를 비교
객체 값:   변수 ─→ [주소] ─→ { id: 1 }   주소를 비교
           변수 ─→ [주소] ─→ { id: 1 }   ← 다른 주소
```

React에서 `useEffect` 의존성 배열에 객체를 넣으면 매 렌더마다 새 객체가 만들어져서 계속 실행되는 문제도 같은 원리다. 이 부분은 예전에 겪었던 문제가 이제야 설명이 됐다.

`const`가 막는 것도 재할당뿐이지 내부 수정이 아니다.

```ts
const member = { name: '준영' };
member.name = '준영우';   // ✅ 가능
// member = { name: '다른사람' };  // ❌ 재할당은 불가
```

## 5. 객체와 함수에 타입 붙이기

```ts
interface FundingItem {
  id: number;
  title: string;
  targetAmount: number;
  imageUrl?: string;        // ? → 있어도 없어도 됨
}

function formatAmount(item: FundingItem) {
  return `${item.title} · ${item.targetAmount.toLocaleString()}원`;
}
// 반환 타입은 string으로 추론됨
```

### `type` vs `interface`

| | `type` | `interface` |
|---|---|---|
| 표현 범위 | 객체 + 원시 별칭 + 유니언 | 주로 객체 |
| 조합 | `&` (교차 타입) | `extends` |
| 같은 이름 재선언 | 불가 | 병합됨 |

```ts
// type만 할 수 있는 것
type Status = 'idle' | 'loading' | 'done';   // 유니언
type WithId = { id: number };
type Full = WithId & { name: string };       // 교차

// interface만 할 수 있는 것
interface User { name: string; }
interface User { level: number; }
// → { name: string; level: number; } 로 병합
```

팀 컨벤션이 없으면 **객체 모양은 `interface`, 그 외(유니언·원시 별칭)는 `type`** 으로 가고, 무엇보다 프로젝트 안에서 한 가지로 통일하는 게 중요하다.

## 6. 유니언 타입과 타입 좁히기

```ts
function format(id: string | number) {
  // id.toUpperCase();  ❌ number일 수도 있어서 막힘

  if (typeof id === 'string') {
    return id.toUpperCase();   // ✅ 이 블록 안에서는 string
  }
  return `ID-${id}`;           // ✅ 여기서는 number
}
```

**좁히기(narrowing)** = 넓은 타입을 조건문으로 확정해가는 과정. TS는 제어 흐름을 읽어서 블록마다 타입을 다르게 본다.

### 리터럴 타입

```ts
type Role = 'leader' | 'member';
const role: Role = 'leader';
// const wrong: Role = 'manager';  ❌ 오타를 컴파일 타임에 차단
```

문자열 상수를 여기저기 쓰는 대신 리터럴 유니언으로 묶으면 자동완성도 되고 오타도 막힌다.

### 판별 유니언 — API 응답 다룰 때 특히 유용

```ts
type FetchResult =
  | { status: 'success'; data: FundingItem[] }
  | { status: 'error'; message: string };

function render(result: FetchResult) {
  if (result.status === 'success') {
    return result.data.length;      // ✅ data 접근 가능
    // result.message;              // ❌ 여기엔 없음
  }
  return result.message;            // ✅ error 쪽에서만 message
}
```

`status` 하나만 확인하면 나머지 필드가 자동으로 결정된다.
**"성공했는데 message를 읽는" 류의 실수를 타입 레벨에서 없앨 수 있다**는 게 핵심 이득이다.

## 7. null / undefined 와 `??` `||`

| | 보통 의미 |
|---|---|
| `null` | 개발자가 "비어 있음"을 의도적으로 표시 |
| `undefined` | 아직 정해지지 않음 / 없는 프로퍼티 / 못 찾음 |

`find()`는 못 찾으면 `undefined`를 반환하므로 strict 모드에서는 바로 못 쓴다.

```ts
const found = members.find((m) => m.id === 3);
// found.name;  ❌ 'found' is possibly 'undefined'

if (found) {
  console.log(found.name);   // ✅ 좁혀짐
}
```

### falsy 함정

```ts
const hour: number | undefined = 0;

console.log(hour || 1);   // 1   ← 0이 falsy라서 기본값이 먹힘 ⚠️
console.log(hour ?? 1);   // 0   ← null/undefined일 때만 기본값 ✅

const nickname: string | null = '';

console.log(nickname || '이름 없음');   // '이름 없음'
console.log(nickname ?? '이름 없음');   // ''
```

falsy 값: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`
→ **빈 배열 `[]`과 빈 객체 `{}`는 truthy다.** `if (arr)`로 빈 배열을 걸러낼 수 없다.

**`0`이나 `''`이 유효한 값일 수 있으면 무조건 `??`.**
수량, 가격, 카운트 다루는 화면에서 `||`를 썼다가 0이 기본값으로 바뀌는 버그가 바로 이거다.

```ts
const github = found?.githubId ?? '등록 안 됨';
//                 └ 옵셔널 체이닝      └ 널 병합
// found가 없으면 undefined → '등록 안 됨'
```

`!` (non-null 단언)은 "TS야 믿어" 하는 것이라 근거가 확실할 때만. 틀리면 런타임에서 터진다.

## 8. `any` 대신 `unknown`

| | 값 저장 | 바로 사용 | 결과 |
|---|---|---|---|
| `any` | 아무거나 | 가능 | 타입 검사가 꺼짐 |
| `unknown` | 아무거나 | **불가** | 좁힌 뒤에만 사용 가능 |

```ts
function printNickname(value: unknown) {
  // value.toUpperCase();  ❌ 좁히기 전엔 아무것도 못 함

  if (typeof value === 'string') {
    console.log(value.toUpperCase());   // ✅
    return;
  }
  console.log('문자열이 아님');
}
```

`any`는 "검사하지 마"고 `unknown`은 "확인하고 써"다.
외부에서 들어오는 값(API 응답, `JSON.parse` 결과, 라이브러리 리턴)은 `unknown`으로 받는 게 안전한 기본값이다.

## 9. 제네릭 `<T>`

제네릭은 **타입의 빈칸**이다. 함수를 쓰는 시점에 채워진다.

```ts
function wrap<T>(value: T) {
  return { value };
}

const a = wrap('준영');   // { value: string }
const b = wrap(42);       // { value: number }
```

`any`로 했다면 `a.value`가 `any`가 되어 타입 정보를 잃는다.
제네릭은 **입력 타입과 출력 타입의 연결을 유지**한다. 이게 결정적인 차이다.

```
any     : string ──→ [ 함수 ] ──→ any      (관계 끊김)
제네릭   : string ──→ [ 함수 ] ──→ string   (관계 유지)
```

실무 감각으로는 API 래퍼에서 바로 쓰인다.

```ts
interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  result: T;
}

type FundingListResponse = ApiResponse<FundingItem[]>;
type FundingDetailResponse = ApiResponse<FundingItem>;
```

공통 응답 껍데기는 한 번만 정의하고 알맹이만 갈아끼운다. 투겟에서 응답 타입을 매번 따로 썼던 게 딱 이걸로 줄일 수 있는 부분이었다.

### 제약 조건

```ts
interface HasName { name: string; }

function getName<T extends HasName>(item: T) {
  return item.name;
}
```

`T extends HasName` = "`name`을 가진 타입만 받겠다". 빈칸이되 최소 조건은 건다.

## 10. 타입 에러 읽는 순서

```
src/index.ts:12:3 - error TS2322:
  Type 'string' is not assignable to type 'number'.
       └ 실제 준 것        └ 기대한 것
```

1. 파일과 줄 번호
2. `Type 'A' is not assignable to type 'B'` → **A가 내가 준 것, B가 필요한 것**
3. 그 줄의 변수/함수 타입 확인
4. 고치고 `pnpm exec tsc --noEmit` 재실행

에러 문장이 길면 따옴표 안의 타입 두 개만 먼저 본다. 대부분 그걸로 끝난다.

## 11. 직접 써본 것 — 스터디 회원 관리

전체 코드: [`week1-typescript/src/index.ts`](../../week1-typescript/src/index.ts)

이번 주 배운 걸 한 파일에 몰아넣어봤다. 짧은데 이번 주차 내용이 거의 다 들어간다.

```ts
type Role = "스터디장" | "파트장" | "멤버";

interface StudyMember {
  id: number;
  name: string;
  role: Role;
  githubId?: string;
}

function findMember(id: number): string {
  const member = studyMembers.find((m) => m.id === id);
  if (!member) return "회원을 찾을 수 없어요.";

  const githubInfo = member.githubId ? ` (GitHub: ${member.githubId})` : "";
  return `${member.name}님은 ${member.role}입니다.${githubInfo}`;
}
```

**여기서 실제로 쓰인 것들**

| 줄 | 개념 |
|---|---|
| `type Role = "스터디장" \| ...` | 리터럴 유니언 — 오타를 컴파일 타임에 차단 |
| `githubId?: string` | 옵셔널 프로퍼티 |
| `if (!member) return ...` | `find()`의 `undefined`를 조건문으로 좁히기 |
| `findMember(id): string` | 반환 타입 명시 — 모든 분기가 문자열을 반환하도록 강제 |

`findMember(999)`가 터지지 않는 이유가 `if (!member)` 한 줄이다.
이걸 빼면 strict 모드에서 `'member' is possibly 'undefined'` 로 **컴파일 자체가 안 된다.** 실행해보기 전에 막힌다는 게 이번 주차의 요지 그대로였다.

```ts
function formatMemberId(input: unknown): string {
  if (typeof input === "number") return `회원 번호: ${input}번`;
  if (typeof input === "string") return `회원 번호(문자): ${input}`;
  return "알 수 없는 형식의 회원 번호입니다.";
}

formatMemberId(1);     // "회원 번호: 1번"
formatMemberId("1");   // "회원 번호(문자): 1"
formatMemberId(true);  // "알 수 없는 형식의 회원 번호입니다."
```

`unknown`으로 받으면 **세 번째 경우를 처리하지 않으면 안 되게** 된다.
`any`였다면 `input.toFixed()` 같은 걸 바로 써도 통과하고, `true`가 들어온 순간 런타임에서 터졌을 것이다.

### 고쳐볼 지점 하나

```ts
const githubInfo = member.githubId ? ` (GitHub: ${member.githubId})` : "";
```

지금은 truthy 검사라 **`githubId`가 빈 문자열이면 "없음"으로 처리**된다.
빈 문자열을 유효한 값으로 볼 일이 없어서 지금은 문제가 없지만, `0`이나 `""`이 의미를 가지는 필드였다면 이 자리가 버그가 된다.

```ts
// 값의 "존재"만 따지고 싶을 때
const githubInfo = member.githubId != null ? ` (GitHub: ${member.githubId})` : "";
```

6번에서 `||`와 `??`를 비교해놓고 정작 여기선 truthy 검사를 썼다는 게 스스로 걸렸다. 같은 함정이 조건문 자리에도 똑같이 있다는 걸 이번에 인지했다.

## 셀프 체크

<details>
<summary>1. 컴파일이 통과했는데 런타임 에러가 나는 경우를 하나 들어라.</summary>

`const arr = ['a']; arr[5].toUpperCase();`
TS는 배열 인덱스 접근 결과를 항상 요소 타입으로 보기 때문에 통과하지만,
실제로는 `undefined`라서 실행 중 TypeError가 난다. 실제 데이터의 상태는 컴파일 타임에 알 수 없다.
</details>

<details>
<summary>2. <code>hour</code>가 0일 때 <code>hour || 1</code>과 <code>hour ?? 1</code>의 결과와 이유는?</summary>

`||`는 1, `??`는 0.
`||`는 falsy 전체(0, '', false, NaN 포함)에 기본값을 적용하고,
`??`는 `null`과 `undefined`일 때만 적용한다. 0이 유효한 값이면 `??`를 써야 한다.
</details>

<details>
<summary>3. <code>any</code> 대신 <code>unknown</code>을 쓰면 뭐가 달라지나?</summary>

`any`는 타입 검사를 무력화해서 잘못된 프로퍼티 접근도 통과시킨다.
`unknown`은 `typeof` 등으로 좁히기 전에는 어떤 연산도 허용하지 않으므로,
"확인 후 사용"이 강제된다. 외부 입력을 받을 때의 기본값으로 적합하다.
</details>

<details>
<summary>4. 제네릭이 <code>any</code>보다 나은 지점을 한 문장으로.</summary>

입력 타입과 출력 타입의 관계를 유지한다. `any`는 함수를 통과하는 순간 타입 정보가 사라지지만,
제네릭은 호출 시점의 타입이 결과까지 이어진다.
</details>

<details>
<summary>5. 판별 유니언이 해결하는 문제는?</summary>

여러 모양 중 하나인 객체에서, 공통 리터럴 프로퍼티(`status` 등)를 확인하는 것만으로
그 분기에 존재하는 프로퍼티만 접근 가능하도록 타입이 좁혀진다.
성공 응답에서 에러 메시지를 읽는 식의 실수를 컴파일 타임에 차단할 수 있다.
</details>

<details>
<summary>6. 함수 반환 타입을 일부러 명시하는 이유는?</summary>

반환 계약을 고정하기 위해서. 조건 분기에서 `return`이 빠지면 추론에 맡겼을 땐
`T | undefined`로 조용히 넘어가지만, 명시하면 컴파일 타임에 에러로 잡힌다.
</details>

## 참고

- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [MDN — Nullish coalescing operator](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
