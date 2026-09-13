const courseName = "TypeScript";
console.log("이번 주 학습 주제: " + courseName);

// ===== 스터디 회원 관리 =====

// 1. 스터디 회원 타입 정의
type Role = "스터디장" | "파트장" | "멤버";

interface StudyMember {
  id: number;
  name: string;
  role: Role;
  githubId?: string;
}

// 2. 서로 정보가 다른 회원들 (githubId 있는 사람 / 없는 사람 포함)
const studyMembers: StudyMember[] = [
  { id: 1, name: "정재하", role: "스터디장", githubId: "jaeha-dev" },
  { id: 2, name: "김민수", role: "파트장" },
  { id: 3, name: "이서연", role: "멤버", githubId: "seoyeon123" },
];

// 3. findMember: 회원 ID로 찾아서 안내 문구 반환
function findMember(id: number): string {
  const member = studyMembers.find((m) => m.id === id);

  if (!member) {
    return "회원을 찾을 수 없어요.";
  }

  const githubInfo = member.githubId ? ` (GitHub: ${member.githubId})` : "";
  return `${member.name}님은 ${member.role}입니다.${githubInfo}`;
}

// 4. ID 1, 2, 999로 결과 확인
console.log(findMember(1));
console.log(findMember(2));
console.log(findMember(999));

// ===== 선택 과제 =====

// 5. interface와 동일한 모양을 type으로도 작성
type StudyMemberType = {
  id: number;
  name: string;
  role: Role;
  githubId?: string;
};

// interface는 동일한 이름으로 선언하면 자동으로 병합(declaration merging)되지만, type은 같은 이름을 재선언할 수 없다.
// interface는 주로 객체/클래스의 형태를 정의할 때 쓰이고, type은 유니온·튜플·매핑 타입 등 더 다양한 형태를 표현할 수 있다.
// 단순한 객체 모양을 정의하는 용도로는 둘 다 거의 동일하게 동작하며 상호 교체가 가능하다.

// 6. studyHour
const studyHour: number | undefined = 0;

console.log(studyHour || 1); // 1 출력
console.log(studyHour ?? 1); // 0 출력

// ||는 좌변이 falsy(0, "", null, undefined, NaN, false)이면 무조건 우변을 반환하므로 0도 falsy라 1이 출력된다.
// ??는 좌변이 null 또는 undefined일 때만 우변을 반환하므로, 0은 유효한 값으로 취급되어 그대로 0이 출력된다.

// 7. formatMemberId: unknown 좁히기 (any 사용 금지)
function formatMemberId(input: unknown): string {
  if (typeof input === "number") {
    return `회원 번호: ${input}번`;
  }

  if (typeof input === "string") {
    return `회원 번호(문자): ${input}`;
  }

  return "알 수 없는 형식의 회원 번호입니다.";
}

console.log(formatMemberId(1));
console.log(formatMemberId("1"));
console.log(formatMemberId(true));
