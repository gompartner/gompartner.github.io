import s from "./ManageStory.module.css";

// 11-25 유지관리를 맡으면 하는 일(사용자 확인 장면 순서): 0 계약 전 사전 검토 > 1 현황 분석 > 2 시스템 구성도 > 3 ERD > 4 업무 흐름도 > 5 관리 항목 > 6 월간 점검.
// 11-25 2판: 실무 수준으로 다시 그림(1판은 상자 네 개짜리라 반려). 대상은 가상의 기관 대표 홈페이지. 실제 고객, 실제 시스템 구조는 싣지 않는다.
// 그림은 SVG로 직접 그린다. 좁은 화면에서는 그림 칸 안에서 가로로 밀어 본다.

const INK = "#15171c", SUB = "#5b6370", LINE = "#9aa4b2", BLUE = "#1552cc", SOFT = "#f4f6fa";
const F = { fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif" };
const MONO = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

function Defs() {
  return (
    <defs>
      <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill={INK} />
      </marker>
      <marker id="arb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill={BLUE} />
      </marker>
    </defs>
  );
}

function Box({ x, y, w, h, t, sub, dash, fill = "#fff" }: { x: number; y: number; w: number; h: number; t: string; sub?: string; dash?: boolean; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={INK} strokeWidth={1.5} strokeDasharray={dash ? "5 4" : undefined} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK} {...F}>{t}</text>
      {sub ? <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize={12} fill={SUB} {...F}>{sub}</text> : null}
    </g>
  );
}
const Ln = ({ d, blue, dash }: { d: string; blue?: boolean; dash?: boolean }) => <path d={d} fill="none" stroke={blue ? BLUE : INK} strokeWidth={1.5} strokeDasharray={dash ? "5 4" : undefined} markerEnd={`url(#${blue ? "arb" : "ar"})`} />;
const Tx = ({ x, y, children, size = 12, bold, fill = SUB, anchor = "start" }: { x: number; y: number; children: string; size?: number; bold?: boolean; fill?: string; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize={size} fontWeight={bold ? 800 : 500} fill={fill} textAnchor={anchor} {...F}>{children}</text>
);

/** 시스템 구성도: 인터넷, DMZ, 내부망 */
function Architecture() {
  return (
    <svg viewBox="0 0 1180 600" role="img" aria-labelledby="arch-t arch-d" className={s.svg}>
      <title id="arch-t">시스템 구성도</title>
      <desc id="arch-d">이용자가 DNS, 방화벽과 웹방화벽, L4 스위치를 거쳐 DMZ의 웹 서버 2대에 접속하고, 웹 서버가 내부망의 WAS 2대, 이중화한 DB, 첨부파일 저장소에 연결된다. 통합검색, 본인인증, 문자 발송, 행정 시스템과 연계하고 백업 서버와 모니터링이 내부망에 있다.</desc>
      <Defs />
      {/* 구역 */}
      <rect x={10} y={40} width={200} height={550} fill={SOFT} stroke={LINE} strokeDasharray="6 5" />
      <rect x={225} y={40} width={330} height={550} fill="#fff" stroke={LINE} strokeDasharray="6 5" />
      <rect x={570} y={40} width={600} height={550} fill={SOFT} stroke={LINE} strokeDasharray="6 5" />
      <Tx x={22} y={62} size={13} bold fill={INK}>인터넷</Tx>
      <Tx x={237} y={62} size={13} bold fill={INK}>DMZ</Tx>
      <Tx x={582} y={62} size={13} bold fill={INK}>내부망</Tx>

      <Box x={30} y={150} w={160} h={56} t="이용자" sub="PC, 모바일" />
      <Box x={30} y={260} w={160} h={56} t="DNS" sub="도메인, SSL 인증서" />
      <Ln d="M110 206V258" />
      <Box x={245} y={150} w={130} h={56} t="방화벽" sub="80, 443 허용" />
      <Box x={245} y={260} w={130} h={56} t="웹방화벽" sub="WAF" />
      <Ln d="M190 178H243" />
      <Ln d="M310 206V258" />
      <Box x={245} y={370} w={130} h={56} t="L4 스위치" sub="부하 분산" />
      <Ln d="M310 316V368" />
      <Box x={410} y={330} w={125} h={56} t="WEB #1" sub="Apache" />
      <Box x={410} y={410} w={125} h={56} t="WEB #2" sub="Apache" />
      <Ln d="M375 390H392V358H408" />
      <Ln d="M375 406H392V438H408" />

      <Box x={600} y={330} w={125} h={56} t="WAS #1" sub="Tomcat" />
      <Box x={600} y={410} w={125} h={56} t="WAS #2" sub="Tomcat" />
      <Ln d="M535 358H598" />
      <Ln d="M535 438H598" />
      <Tx x={566} y={350} anchor="middle" size={11}>AJP</Tx>
      <Box x={790} y={330} w={150} h={56} t="DB (Active)" sub="MariaDB" />
      <Box x={790} y={410} w={150} h={56} t="DB (Standby)" sub="복제" />
      <Ln d="M725 358H788" />
      <Ln d="M725 438H750V372H788" />
      <Ln d="M865 386V408" dash />
      <Tx x={873} y={402} size={11}>실시간 복제</Tx>
      <Box x={600} y={500} w={125} h={56} t="첨부파일" sub="NAS" />
      <Ln d="M662 466V498" />
      <Box x={790} y={500} w={150} h={56} t="백업 서버" sub="일 1회, 주 1회 전체" />
      <Ln d="M865 466V498" dash />
      <Ln d="M725 528H788" dash />

      {/* 연계 */}
      <Tx x={600} y={100} size={12} bold fill={BLUE}>연계</Tx>
      <Box x={600} y={112} w={125} h={50} t="통합검색" sub="검색엔진" dash />
      <Box x={740} y={112} w={125} h={50} t="본인인증" sub="외부 기관" dash />
      <Box x={880} y={112} w={125} h={50} t="문자 발송" sub="SMS, 알림톡" dash />
      <Box x={1020} y={112} w={130} h={50} t="행정 시스템" sub="신청 연계" dash />
      <Ln d="M640 328V164" blue />
      <Ln d="M690 328V260H802V164" blue />
      <Ln d="M705 328V246H942V164" blue />
      <Ln d="M715 328V232H1085V164" blue />

      {/* 운영 */}
      <Box x={990} y={330} w={160} h={56} t="모니터링" sub="자원, 응답, 로그" />
      <Box x={990} y={410} w={160} h={56} t="배치" sub="통계, 휴면 전환, 파기" />
      <Ln d="M990 438H966V372H942" />
      <Tx x={590} y={582} size={12}>실선: 서비스 요청, 점선: 복제와 백업, 파란 선: 외부 연계</Tx>
    </svg>
  );
}

/** ERD: 표와 관계선(까마귀발 표기) */
type Col = [name: string, type: string, key?: "PK" | "FK"];
const ERD: { id: string; ko: string; x: number; y: number; cols: Col[] }[] = [
  { id: "TB_MEMBER", ko: "회원", x: 20, y: 30, cols: [["MEMBER_ID", "VARCHAR(20)", "PK"], ["MEMBER_NM", "VARCHAR(50)"], ["MOBILE_NO", "VARCHAR(256)"], ["EMAIL", "VARCHAR(256)"], ["AUTH_GRP_CD", "CHAR(4)", "FK"], ["LAST_LOGIN_DT", "DATETIME"], ["DORMANT_YN", "CHAR(1)"]] },
  { id: "TB_AUTH_GROUP", ko: "권한 그룹", x: 20, y: 320, cols: [["AUTH_GRP_CD", "CHAR(4)", "PK"], ["AUTH_GRP_NM", "VARCHAR(50)"], ["USE_YN", "CHAR(1)"]] },
  { id: "TB_MENU_AUTH", ko: "메뉴 권한", x: 20, y: 480, cols: [["AUTH_GRP_CD", "CHAR(4)", "PK"], ["MENU_ID", "VARCHAR(20)", "PK"], ["WRITE_YN", "CHAR(1)"]] },
  { id: "TB_MENU", ko: "메뉴", x: 330, y: 480, cols: [["MENU_ID", "VARCHAR(20)", "PK"], ["UPPER_MENU_ID", "VARCHAR(20)", "FK"], ["MENU_NM", "VARCHAR(100)"], ["BOARD_ID", "VARCHAR(20)", "FK"]] },
  { id: "TB_BOARD", ko: "게시판", x: 640, y: 480, cols: [["BOARD_ID", "VARCHAR(20)", "PK"], ["BOARD_NM", "VARCHAR(100)"], ["BOARD_TYPE_CD", "CHAR(2)"], ["FILE_YN", "CHAR(1)"]] },
  { id: "TB_ARTICLE", ko: "게시물", x: 640, y: 210, cols: [["ARTICLE_NO", "BIGINT", "PK"], ["BOARD_ID", "VARCHAR(20)", "FK"], ["TITLE", "VARCHAR(200)"], ["CONTENT", "MEDIUMTEXT"], ["REG_ID", "VARCHAR(20)", "FK"], ["REG_DT", "DATETIME"]] },
  { id: "TB_ATTACH_FILE", ko: "첨부파일", x: 950, y: 210, cols: [["FILE_NO", "BIGINT", "PK"], ["ARTICLE_NO", "BIGINT", "FK"], ["ORG_FILE_NM", "VARCHAR(255)"], ["SAVE_PATH", "VARCHAR(500)"], ["FILE_SIZE", "BIGINT"]] },
  { id: "TB_APPLY", ko: "신청", x: 330, y: 30, cols: [["APPLY_NO", "BIGINT", "PK"], ["MEMBER_ID", "VARCHAR(20)", "FK"], ["PROGRAM_ID", "VARCHAR(20)", "FK"], ["APPLY_STTS_CD", "CHAR(2)"], ["APPLY_DT", "DATETIME"]] },
  { id: "TB_ACCESS_LOG", ko: "개인정보 접속기록", x: 640, y: 30, cols: [["LOG_NO", "BIGINT", "PK"], ["ADMIN_ID", "VARCHAR(20)", "FK"], ["TARGET_ID", "VARCHAR(20)"], ["ACT_CD", "CHAR(2)"], ["ACCESS_IP", "VARCHAR(40)"], ["ACCESS_DT", "DATETIME"]] },
];
const TW = 250, RH = 22, HH = 30;

function ErdTable({ t }: { t: (typeof ERD)[number] }) {
  return (
    <g>
      <rect x={t.x} y={t.y} width={TW} height={HH + t.cols.length * RH + 4} fill="#fff" stroke={INK} strokeWidth={1.5} />
      <rect x={t.x} y={t.y} width={TW} height={HH} fill={INK} />
      <text x={t.x + 9} y={t.y + 20} fontSize={12.5} fontWeight={700} fill="#fff" {...MONO}>{t.id}</text>
      <text x={t.x + TW - 9} y={t.y + 20} fontSize={11.5} fill="#c9d0da" textAnchor="end" {...F}>{t.ko}</text>
      {t.cols.map(([n, ty, k], i) => (
        <g key={n}>
          {i > 0 && t.cols[i - 1][2] === "PK" && k !== "PK" ? <line x1={t.x} x2={t.x + TW} y1={t.y + HH + i * RH + 2} y2={t.y + HH + i * RH + 2} stroke={INK} strokeWidth={1} /> : null}
          <text x={t.x + 9} y={t.y + HH + i * RH + 17} fontSize={11.5} fontWeight={k === "PK" ? 700 : 400} fill={INK} {...MONO}>{n}</text>
          <text x={t.x + TW - 36} y={t.y + HH + i * RH + 17} fontSize={10.5} fill={SUB} textAnchor="end" {...MONO}>{ty}</text>
          {k ? <text x={t.x + TW - 9} y={t.y + HH + i * RH + 17} fontSize={10.5} fontWeight={800} fill={k === "PK" ? INK : BLUE} textAnchor="end" {...MONO}>{k}</text> : null}
        </g>
      ))}
    </g>
  );
}
/** 관계선: 1쪽은 세로 막대 둘, N쪽은 까마귀발 */
function Rel({ d, one, many }: { d: string; one: [number, number, "h" | "v"]; many: [number, number, "l" | "r" | "u" | "d"] }) {
  const [ox, oy, od] = one, [mx, my, md] = many;
  const foot = md === "l" ? `M${mx + 12} ${my}L${mx} ${my - 7}M${mx + 12} ${my}L${mx} ${my + 7}` : md === "r" ? `M${mx - 12} ${my}L${mx} ${my - 7}M${mx - 12} ${my}L${mx} ${my + 7}` : md === "u" ? `M${mx} ${my + 12}L${mx - 7} ${my}M${mx} ${my + 12}L${mx + 7} ${my}` : `M${mx} ${my - 12}L${mx - 7} ${my}M${mx} ${my - 12}L${mx + 7} ${my}`;
  const bar = od === "h" ? `M${ox} ${oy - 7}V${oy + 7}M${ox + (ox < mx ? 5 : -5)} ${oy - 7}V${oy + 7}` : `M${ox - 7} ${oy}H${ox + 7}M${ox - 7} ${oy + (oy < my ? 5 : -5)}H${ox + 7}`;
  return <path d={`${d}${foot}${bar}`} fill="none" stroke={INK} strokeWidth={1.3} />;
}

function Erd() {
  return (
    <svg viewBox="0 0 1220 640" role="img" aria-labelledby="erd-t erd-d" className={s.svg}>
      <title id="erd-t">ERD</title>
      <desc id="erd-d">회원, 권한 그룹, 메뉴 권한, 메뉴, 게시판, 게시물, 첨부파일, 신청, 개인정보 접속기록 테이블과 관계. 회원은 권한 그룹에 속하고 신청, 게시물, 접속기록과 1대 다 관계다. 게시판은 게시물과, 게시물은 첨부파일과 1대 다 관계다.</desc>
      {ERD.map((t) => <ErdTable key={t.id} t={t} />)}
      {/* 권한 그룹 1 : N 회원 */}
      <Rel d="M145 320V218" one={[145, 310, "v"]} many={[145, 218, "u"]} />
      {/* 권한 그룹 1 : N 메뉴 권한 */}
      <Rel d="M145 420V480" one={[145, 430, "v"]} many={[145, 480, "d"]} />
      {/* 메뉴 1 : N 메뉴 권한 */}
      <Rel d="M330 530H270" one={[320, 530, "h"]} many={[270, 530, "l"]} />
      {/* 게시판 1 : N 메뉴 */}
      <Rel d="M640 560H580" one={[630, 560, "h"]} many={[580, 560, "l"]} />
      {/* 게시판 1 : N 게시물 */}
      <Rel d="M765 480V376" one={[765, 470, "v"]} many={[765, 376, "u"]} />
      {/* 게시물 1 : N 첨부파일 */}
      <Rel d="M890 270H950" one={[900, 270, "h"]} many={[950, 270, "r"]} />
      {/* 회원 1 : N 신청 */}
      <Rel d="M270 80H330" one={[280, 80, "h"]} many={[330, 80, "r"]} />
      {/* 회원 1 : N 게시물(등록자) */}
      <Rel d="M270 190H300V330H640" one={[280, 190, "h"]} many={[640, 330, "r"]} />
      {/* 회원 1 : N 접속기록(관리자) */}
      <Rel d="M270 205H590V80H640" one={[280, 205, "h"]} many={[640, 80, "r"]} />
      <Tx x={950} y={470} size={12.5} bold fill={INK}>표기</Tx>
      <Tx x={950} y={492} size={12}>굵은 항목: 기본 키(PK), 파란 FK: 외래 키</Tx>
      <Tx x={950} y={512} size={12}>막대 둘: 1, 갈래: N</Tx>
      <Tx x={950} y={540} size={12}>MOBILE_NO, EMAIL: 암호화 저장 항목</Tx>
      <Tx x={950} y={560} size={12}>전체 테이블 47개 중 9개</Tx>
    </svg>
  );
}

/** 업무 흐름도: 신청 접수(신청자, 시스템, 담당자) */
function Swim() {
  const D = ({ x, y, t }: { x: number; y: number; t: string }) => (
    <g>
      <path d={`M${x} ${y - 30}L${x + 62} ${y}L${x} ${y + 30}L${x - 62} ${y}z`} fill="#fff" stroke={INK} strokeWidth={1.5} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} {...F}>{t}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 1180 470" role="img" aria-labelledby="sw-t sw-d" className={s.svg}>
      <title id="sw-t">업무 흐름도: 프로그램 신청 접수</title>
      <desc id="sw-d">신청자가 본인인증 후 신청서를 작성하면 시스템이 입력값을 검증하고 정원을 확인한다. 정원 안이면 접수하고 접수 문자를 보내며, 정원을 넘으면 대기로 접수한다. 담당자가 신청 내역을 확인해 승인 또는 반려하고 시스템이 결과를 문자로 알린다.</desc>
      <Defs />
      {["신청자", "시스템", "담당자"].map((t, i) => (
        <g key={t}>
          <rect x={10} y={20 + i * 145} width={1160} height={145} fill={i === 1 ? SOFT : "#fff"} stroke={LINE} />
          <rect x={10} y={20 + i * 145} width={72} height={145} fill={INK} />
          <text x={46} y={98 + i * 145} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff" {...F}>{t}</text>
        </g>
      ))}
      <Box x={110} y={64} w={120} h={56} t="본인인증" sub="회원, 비회원" />
      <Box x={270} y={64} w={130} h={56} t="신청서 작성" sub="첨부파일" />
      <Ln d="M230 92H268" />
      <Box x={270} y={210} w={130} h={56} t="입력값 검증" sub="필수, 형식, 중복" />
      <Ln d="M335 120V208" />
      <D x={500} y={238} t="정원 이내" />
      <Ln d="M400 238H436" />
      <Box x={610} y={210} w={120} h={56} t="접수" sub="접수번호 발급" />
      <Ln d="M562 238H608" />
      <Tx x={572} y={230} size={11.5}>예</Tx>
      <Box x={440} y={64} w={120} h={56} t="대기 접수" sub="순번 안내" />
      <Ln d="M500 208V122" />
      <Tx x={508} y={170} size={11.5}>아니오</Tx>
      <Box x={770} y={210} w={130} h={56} t="접수 문자 발송" sub="SMS, 알림톡" />
      <Ln d="M730 238H768" />
      <Box x={770} y={64} w={130} h={56} t="접수 확인" sub="마이페이지" />
      <Ln d="M835 208V122" />
      <Box x={610} y={355} w={120} h={56} t="신청 내역 확인" sub="관리자 화면" />
      <Ln d="M670 266V353" />
      <D x={835} y={383} t="승인" />
      <Ln d="M730 383H771" />
      <Box x={960} y={210} w={170} h={56} t="결과 문자 발송" sub="승인, 반려 사유" />
      <Ln d="M897 383H1045V268" />
      <Tx x={905} y={375} size={11.5}>예, 아니오(반려 사유 입력)</Tx>
      <Box x={960} y={64} w={170} h={56} t="결과 확인" sub="마이페이지, 문자" />
      <Ln d="M1045 208V122" />
      <Box x={110} y={210} w={130} h={56} t="접속기록 저장" sub="개인정보 조회 시" dash />
      <Ln d="M608 383H175V268" dash />
    </svg>
  );
}

const DOCS: [string, string, string][] = [
  ["현황분석서", "서버, 프로그램, 버전, 계정, 만료일, 위험 요소", "착수 2주"],
  ["시스템 구성도", "구역, 서버, 접속 경로, 연계", "착수 2주"],
  ["메뉴 구조도, 프로그램 목록", "이용자 화면, 관리자 화면, 배치", "착수 4주"],
  ["ERD, 테이블 정의서", "사용 테이블과 미사용 테이블, 항목, 관계, 암호화 항목", "착수 6주"],
  ["인터페이스 정의서", "연계 대상, 방식, 주기, 장애 시 처리", "착수 4주"],
  ["계정, 권한 목록", "서버, DB, 관리자 계정과 권한, 미사용 계정", "착수 2주"],
  ["운영 매뉴얼", "배포, 백업과 복구, 정기 작업 순서", "착수 6주"],
];

const WATCH: [string, string, string][] = [
  ["도메인, SSL 인증서", "만료일, 자동 갱신 여부", "월 1회"],
  ["백업", "수행 결과, 복구 시험", "월 1회, 분기 1회"],
  ["보안 업데이트", "운영체제, WEB, WAS, 프레임워크 보안 권고", "월 1회"],
  ["개인정보", "처리방침과 수집 항목 일치, 접속기록 보관, 파기", "분기 1회"],
  ["계정, 권한", "퇴직자, 미사용 계정, 권한 변경 이력", "분기 1회"],
  ["성능", "응답 시간, 느린 쿼리, 자원 사용량", "월 1회"],
  ["웹 접근성", "신규 화면 점검", "변경 시"],
];

const STEPS = ["사전 검토", "현황 분석", "시스템 구성도", "ERD", "업무 흐름도", "관리 항목", "월간 점검"];

function Doc({ no, title, lead, children }: { no: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <article className={s.doc}>
      <header>
        <p>{no}</p>
        <h3>{title}</h3>
      </header>
      <p className={s.lead}>{lead}</p>
      {children}
    </article>
  );
}

export function ManageStory() {
  return (
    <div className={`keep-light ${s.root}`}>
      <ol className={s.steps} role="list">
        {STEPS.map((t, i) => (
          <li key={t}>
            <span>{i}</span>
            {t}
          </li>
        ))}
      </ol>
      <p className={s.subject}>기관 대표 홈페이지를 대상으로 작성한 예시</p>

      <Doc no="0, 1" title="사전 검토, 현황 분석" lead="상담 신청 시 사이트를 확인해 사전 검토서를 드립니다. 계약 후 소스, 서버, DB를 확인하고 아래 문서를 작성합니다.">
        <div className={s.tbl} role="table" aria-label="분석 산출물">
          <div role="row" className={s.tHead}>
            <span role="columnheader">산출물</span>
            <span role="columnheader">내용</span>
            <span role="columnheader">작성 시점</span>
          </div>
          {DOCS.map(([a, b, c]) => (
            <div role="row" key={a}>
              <span role="rowheader">{a}</span>
              <span role="cell">{b}</span>
              <span role="cell">{c}</span>
            </div>
          ))}
        </div>
      </Doc>

      <Doc no="2" title="시스템 구성도" lead="구역별 서버와 접속 경로, 이중화, 외부 연계, 백업 구성을 정리합니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="시스템 구성도 그림">
          <Architecture />
        </div>
      </Doc>

      <Doc no="3" title="ERD" lead="설계서가 없는 DB는 테이블 정의만으로 관계가 드러나지 않습니다. 소스의 쿼리와 실제 데이터를 대조해 사용 중인 테이블과 관계를 확인하고, 미사용 테이블, 암호화 항목, 개인정보 항목을 표시합니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="ERD 그림">
          <Erd />
        </div>
      </Doc>

      <Doc no="4" title="업무 흐름도" lead="업무별로 이용자, 시스템, 담당자의 처리 순서와 분기를 정리합니다. 아래는 프로그램 신청 접수 업무입니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="업무 흐름도 그림">
          <Swim />
        </div>
      </Doc>

      <Doc no="5, 6" title="관리 항목, 월간 점검" lead="분석 결과로 관리 항목과 주기를 정하고, 점검 결과를 월간 점검 보고서로 드립니다.">
        <div className={s.tbl} role="table" aria-label="관리 항목">
          <div role="row" className={s.tHead}>
            <span role="columnheader">관리 항목</span>
            <span role="columnheader">확인 내용</span>
            <span role="columnheader">주기</span>
          </div>
          {WATCH.map(([a, b, c]) => (
            <div role="row" key={a}>
              <span role="rowheader">{a}</span>
              <span role="cell">{b}</span>
              <span role="cell">{c}</span>
            </div>
          ))}
        </div>
      </Doc>
    </div>
  );
}
