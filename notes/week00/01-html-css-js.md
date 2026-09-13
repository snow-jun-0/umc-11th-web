# 브라우저가 화면을 만드는 3단 구조 — HTML·CSS·JS 역할 다시 잡기

> **한 줄 요약** — HTML은 "무엇이 있는가", CSS는 "어떻게 보이는가", JS는 "무슨 일이 일어나는가"를 담당한다. 파일을 나누든 합치든 이 역할 분담은 변하지 않는다.

## 왜 다시 보게 됐나

React를 먼저 쓰다 보면 JSX가 HTML이고 스타일은 그냥 `className`인 줄 알고 넘어가게 된다.
근데 `div`만으로 다 만들어놓고 나중에 접근성이나 SEO 얘기가 나오면 그때 막힌다.
이번에 기초를 다시 보면서 정리한 건 **"역할로 나눈다"는 원칙이 프레임워크를 써도 그대로 유효하다**는 점이었다.

## 1. 화면이 뜨기까지

```
주소 입력
   ↓
서버에 파일 요청
   ↓
HTML / CSS / JS 응답
   ↓
브라우저가 파싱 → DOM 트리 구성
   ↓
CSS 적용 → 레이아웃 계산 → 화면에 그림
   ↓
JS 실행 → DOM 조작 → 화면 갱신
```

여기서 중요한 건 **JS는 "그 다음"에 온다**는 것. HTML이 먼저 구조를 만들어야 JS가 잡을 대상이 생긴다.
그래서 `<script>`를 `<head>`에 그냥 넣으면 아직 없는 요소를 찾으려다 `null`이 난다.

## 2. 세 기술 역할 비교

| | 담당 | 바뀌면 생기는 일 | 대표 질문 |
|---|---|---|---|
| HTML | 콘텐츠의 구조와 의미 | 문서의 뼈대가 바뀜 | "이건 제목인가 본문인가?" |
| CSS | 시각적 표현 | 보이는 모습만 바뀜 | "얼마나 떨어져 있어야 하나?" |
| JS | 상태 변화와 상호작용 | 동작이 바뀜 | "누르면 뭐가 달라지나?" |

## 3. 시맨틱 태그 — `div`를 쓸지 말지의 기준

내가 세운 판단 기준은 하나다. **"이 영역을 한 단어로 부르면 뭐라고 부를까?"**

- 그 단어에 해당하는 태그가 있다 → 그 태그를 쓴다 (`nav`, `main`, `footer`)
- 딱히 부를 이름이 없고 그냥 묶어서 스타일 주려는 거다 → `div`가 맞다

`div`가 나쁜 게 아니라, **이름이 있는데 안 쓰는 게** 아까운 거다.

```html
<!-- 역할이 이름으로 드러나는 구조 -->
<header>
  <nav>...</nav>
</header>
<main>
  <section>
    <h2>펀딩 현황</h2>
    <div class="progress-wrap">   <!-- 스타일용 묶음이라 div가 적절 -->
      <div class="progress-bar"></div>
    </div>
  </section>
</main>
<footer>...</footer>
```

스크린리더 사용자가 `main`으로 바로 점프할 수 있다는 것 하나만으로도 쓸 이유가 된다.

## 4. 박스 모델 — 크기가 예상과 다를 때

`width: 300px`인데 실제로 348px을 차지하는 상황.

```
┌─────────── 348px (기본 content-box) ───────────┐
│ border 4px │ padding 20px │ content 300px │ ... │
└────────────────────────────────────────────────┘

border-box를 켜면:
┌─────────────── 300px 고정 ──────────────┐
│ border │ padding │ content(줄어듦) │ ... │
└─────────────────────────────────────────┘
```

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

프로젝트 시작할 때 이 3줄을 리셋에 넣어두면 이 문제로 고민할 일이 거의 사라진다.

## 5. Flexbox — 축부터 잡기

Flex가 헷갈리는 이유는 `justify-content`와 `align-items`가 **고정된 방향이 아니기 때문**이다.
`flex-direction`에 따라 두 축이 통째로 뒤바뀐다.

```
flex-direction: row (기본)
  주축(main) →→→→→→→→   : justify-content 가 여기를 정렬
  교차축(cross) ↓        : align-items 가 여기를 정렬

flex-direction: column
  주축(main) ↓           : justify-content 가 여기를 정렬
  교차축(cross) →→→→     : align-items 가 여기를 정렬
```

**"justify는 주축, align은 교차축, 주축은 direction이 정한다."** 이 한 문장으로 외웠다.

```css
.tag-list {
  display: flex;
  flex-wrap: wrap;      /* 좁아지면 다음 줄로 */
  gap: 8px;             /* margin 대신 gap — 끝 요소 여백 안 생김 */
  align-items: center;
}
```

## 6. DOM과 이벤트

DOM은 "브라우저가 HTML을 읽고 만들어둔, JS가 만질 수 있는 객체 트리"다.
HTML 파일 자체가 아니라 **파싱 결과물**이라는 게 포인트. 그래서 JS로 바꾼 내용은 새로고침하면 사라진다.

```javascript
const $count = document.querySelector('#count');
const $btn = document.querySelector('#plus');

let count = 0;

$btn.addEventListener('click', () => {
  count += 1;
  $count.textContent = count;
});
```

React를 쓰면 이 흐름이 `useState` + 재렌더링으로 감춰지는 것이지, 없어지는 게 아니다.
결국 내부에서는 DOM을 이만큼 갱신하고 있다.

### `textContent` vs `innerHTML`

| | 동작 | 안전성 |
|---|---|---|
| `textContent` | 문자열 그대로 넣음 | 안전 |
| `innerHTML` | HTML로 해석해서 넣음 | 외부 입력 넣으면 XSS 위험 |

사용자가 입력한 값을 화면에 뿌릴 땐 기본이 `textContent`다.

## 7. `defer`가 하는 일

```html
<script src="./main.js" defer></script>
```

`defer`를 붙이면 HTML 파싱을 멈추지 않고 스크립트를 내려받고, **파싱이 끝난 뒤** 실행한다.
`<body>` 맨 아래로 옮기는 것과 결과가 비슷하지만, 다운로드를 미리 시작한다는 점에서 더 낫다.

| 속성 | 다운로드 | 실행 시점 | 순서 보장 |
|---|---|---|---|
| 없음 | 파싱 중단 후 | 즉시 | O |
| `async` | 병렬 | 다운로드 끝나는 대로 | X |
| `defer` | 병렬 | 파싱 완료 후 | O |

## 8. Node.js와 패키지 매니저가 왜 필요한가

처음엔 "프론트 하는데 왜 서버 런타임을 깔지?" 싶었는데, 이유가 명확했다.
**Node를 서버로 쓰려는 게 아니라, 개발 도구를 돌리는 실행 환경으로 쓰는 것**이다.
TypeScript 컴파일러, Vite, ESLint, Prettier — 전부 JS로 만들어져 있고 브라우저 밖에서 실행돼야 한다.

| | npm | pnpm |
|---|---|---|
| 전체 설치 | `npm install` | `pnpm install` |
| 추가 | `npm install <pkg>` | `pnpm add <pkg>` |
| 개발 의존성 | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| 제거 | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| 스크립트 | `npm run dev` | `pnpm dev` |

pnpm이 빠른 이유는 패키지를 전역 저장소에 한 번만 받아두고 프로젝트별로 링크를 걸기 때문이다.
같은 라이브러리를 프로젝트 10개가 쓰면 npm은 10벌, pnpm은 1벌이다.

⚠️ 한 프로젝트에 `package-lock.json`과 `pnpm-lock.yaml`이 둘 다 있으면 팀원마다 설치되는 버전이 갈린다. 하나만 남기고 커밋해야 한다.

## 셀프 체크

<details>
<summary>1. <code>&lt;script&gt;</code>를 <code>&lt;head&gt;</code>에 그냥 넣으면 왜 요소를 못 찾을까?</summary>

HTML은 위에서 아래로 파싱되는데, `head`의 스크립트는 `body`가 만들어지기 전에 실행된다.
그 시점엔 DOM에 해당 요소가 아직 없어서 `querySelector`가 `null`을 반환한다.
→ `defer`를 붙이거나 `DOMContentLoaded`를 기다리면 해결된다.
</details>

<details>
<summary>2. <code>width: 200px</code>인 요소가 240px을 차지한다. 뭘 확인해야 하나?</summary>

`padding`과 `border`. 기본값 `box-sizing: content-box`에서는 width가 콘텐츠 영역만 가리켜서,
좌우 padding 16px + border 4px이면 200 + 32 + 8 = 240px이 된다.
`box-sizing: border-box`로 바꾸면 200px 안에 전부 포함된다.
</details>

<details>
<summary>3. <code>flex-direction: column</code>일 때 세로 가운데 정렬은 어떤 속성인가?</summary>

`justify-content`. column에서는 주축이 세로 방향이기 때문이다.
가로 가운데 정렬은 `align-items`가 담당한다. row일 때와 정확히 반대다.
</details>

<details>
<summary>4. 사용자 입력을 화면에 표시할 때 <code>innerHTML</code>을 피하는 이유는?</summary>

`innerHTML`은 문자열을 HTML로 해석한다. 입력값에 `<script>`나 이벤트 핸들러 속성이 섞여 있으면
그대로 실행돼서 XSS 공격 경로가 된다. `textContent`는 전부 문자열로 취급하므로 안전하다.
</details>

<details>
<summary>5. 프론트엔드인데 Node.js를 설치하는 이유를 한 문장으로.</summary>

브라우저 밖에서 JS로 만들어진 개발 도구(컴파일러·번들러·린터)를 실행하기 위한 런타임이 필요해서.
서버를 만들려는 목적이 아니다.
</details>

## 참고

- [MDN — Structuring content with HTML](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Structuring_content)
- [MDN — The box model](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Styling_basics/Box_model)
- [MDN — Flexbox](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/CSS_layout/Flexbox)
- [MDN — DOM scripting introduction](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting)
- [pnpm — Motivation](https://pnpm.io/motivation)
