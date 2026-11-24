import s from "./ManageStory.module.css";

// 11-25 유지관리를 맡으면 하는 일(사용자 확인 장면 순서): 0 계약 전 사전 검토 > 1 현황 분석 > 2 시스템 구성도 > 3 ERD > 4 업무 흐름도 > 5 관리 항목 > 6 월간 점검.
// 4판(사용자 "다시 만들어"): 대상은 곰파트너 거래장부. 그림은 설계 예시로, 실제 운영 구성을 그대로 옮기지 않는다. 색은 모듈 CSS 변수로 두어 다크 모드에서 바뀐다.
const F = { fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif" };
const MONO = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

function Defs({ id }: { id: string }) {
  return (
    <defs>
      {(["k", "b"] as const).map((c) => (
        <marker key={c} id={`${id}-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className={c === "k" ? s.fInk : s.fBlue} />
        </marker>
      ))}
    </defs>
  );
}
const Ln = ({ id, d, blue, dash }: { id: string; d: string; blue?: boolean; dash?: boolean }) => <path d={d} fill="none" className={blue ? s.sBlue : s.sInk} strokeWidth={1.5} strokeDasharray={dash ? "5 4" : undefined} markerEnd={`url(#${id}-${blue ? "b" : "k"})`} />;
const Tx = ({ x, y, children, size = 12, bold, ink, blue, anchor = "start" }: { x: number; y: number; children: string; size?: number; bold?: boolean; ink?: boolean; blue?: boolean; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize={size} fontWeight={bold ? 800 : 500} className={blue ? s.fBlue : ink ? s.fInk : s.fSub} textAnchor={anchor} {...F}>{children}</text>
);
function Box({ x, y, w, h, t, sub, dash }: { x: number; y: number; w: number; h: number; t: string; sub?: string; dash?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className={s.box} strokeWidth={1.5} strokeDasharray={dash ? "5 4" : undefined} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" fontSize={15} fontWeight={800} className={s.fInk} {...F}>{t}</text>
      {sub ? <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize={12} className={s.fSub} {...F}>{sub}</text> : null}
    </g>
  );
}

/** 시스템 구성도: 묶음(컨테이너) 12개와 구성 요소, 묶음 사이 흐름 */
const IH = 30, IG = 7, GP = 11, GH = 26;
type Grp = { x: number; y: number; w: number; t: string; cols: number; items: string[]; dash?: boolean };
const gh = (g: Grp) => GH + GP * 2 + Math.ceil(g.items.length / g.cols) * (IH + IG) - IG;
const GROUPS: Record<string, Grp> = {
  ch: { x: 10, y: 60, w: 168, t: "이용 채널", cols: 1, items: ["PC 웹", "모바일 웹", "태블릿", "공유 링크 수신자", "관리자 콘솔", "외부 API 이용자"] },
  edge: { x: 212, y: 34, w: 168, t: "경계 보안", cols: 1, items: ["DNS", "DDoS 차단", "CDN", "웹방화벽", "TLS 종단", "요청 제한", "봇 차단", "API 게이트웨이"] },
  auth: { x: 414, y: 34, w: 178, t: "인증, 권한", cols: 1, items: ["로그인", "세션 관리", "2단계 인증", "토큰 발급", "권한 검사", "사업체 전환", "기기 인증", "비밀번호 정책"] },
  doc: { x: 626, y: 34, w: 388, t: "문서 서비스", cols: 2, items: ["견적서", "거래명세서", "금액 조정", "부가세 계산", "문서 번호", "문서 확정", "임시 저장", "문서 복사, 전환"] },
  base: { x: 626, y: 250, w: 388, t: "기준 정보 서비스", cols: 2, items: ["거래처", "품목", "거래처별 단가", "공급자 정보", "직인 관리", "서식 설정"] },
  ar: { x: 626, y: 429, w: 388, t: "미수, 수금 서비스", cols: 2, items: ["미수 대장", "수금 처리", "전잔액 이월", "월별 집계", "거래처별 잔액", "마감"] },
  out: { x: 626, y: 608, w: 388, t: "공유, 출력 서비스", cols: 2, items: ["공유 링크", "열람 기록", "인쇄, PDF", "엑셀 내보내기", "문자 안내", "링크 만료"] },
  job: { x: 1048, y: 34, w: 190, t: "비동기 처리", cols: 1, items: ["작업 큐", "작업 처리기", "일정 작업", "재시도, 보류", "알림 발송", "파일 변환"] },
  cmn: { x: 1048, y: 320, w: 190, t: "공통 서비스", cols: 1, items: ["검색", "통계 집계", "감사 로그", "코드, 서식", "첨부파일", "설정 관리"] },
  data: { x: 1272, y: 34, w: 258, t: "데이터", cols: 1, items: ["주 DB", "읽기 복제본", "캐시", "객체 저장소", "검색 색인", "메시지 저장소", "로그 저장소"] },
  keep: { x: 1272, y: 357, w: 258, t: "백업, 보관", cols: 1, items: ["백업 저장소", "장기 보관", "암호 키 보관", "복구 시험 환경"] },
  ext: { x: 626, y: 800, w: 904, t: "외부 연계", cols: 8, dash: true, items: ["문자 발송", "알림톡", "메일 발송", "전자세금계산서", "입금 알림", "본인인증", "주소 검색", "환율 정보"] },
  ops: { x: 10, y: 910, w: 1520, t: "운영, 보안 관리", cols: 9, items: ["모니터링", "로그 수집", "경보", "배포 자동화", "형상관리", "비밀 값 관리", "접근 통제", "취약점 점검", "복구 훈련"] },
};
function Group({ g }: { g: Grp }) {
  const iw = (g.w - GP * 2 - (g.cols - 1) * IG) / g.cols;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.w} height={gh(g)} className={s.grp} strokeDasharray={g.dash ? "6 5" : undefined} />
      <rect x={g.x} y={g.y} width={g.w} height={GH} className={s.hd} />
      <text x={g.x + 10} y={g.y + 18} fontSize={13} fontWeight={800} className={s.fPaper} {...F}>{g.t}</text>
      <text x={g.x + g.w - 9} y={g.y + 18} fontSize={11.5} textAnchor="end" className={s.fPaper} opacity={0.75} {...F}>{g.items.length}</text>
      {g.items.map((t, i) => {
        const x = g.x + GP + (i % g.cols) * (iw + IG), y = g.y + GH + GP + Math.floor(i / g.cols) * (IH + IG);
        return (
          <g key={t}>
            <rect x={x} y={y} width={iw} height={IH} className={s.box} strokeWidth={1.2} strokeDasharray={g.dash ? "5 4" : undefined} />
            <text x={x + iw / 2} y={y + IH / 2 + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={700} className={s.fInk} {...F}>{t}</text>
          </g>
        );
      })}
    </g>
  );
}
function Architecture() {
  const G = GROUPS, id = "ar";
  const n = Object.values(G).reduce((a, g) => a + g.items.length, 0);
  const my = (k: string) => G[k].y + gh(G[k]) / 2;
  return (
    <svg viewBox="0 -10 1546 1022" role="img" aria-labelledby="arch-t arch-d" className={s.svgWide}>
      <title id="arch-t">거래장부 시스템 구성도</title>
      <desc id="arch-d">{`묶음 ${Object.keys(G).length}개, 구성 요소 ${n}개. ${Object.values(G).map((g) => `${g.t}: ${g.items.join(", ")}`).join(". ")}. 이용 채널의 요청은 경계 보안, 인증과 권한을 거쳐 업무 서비스로 가고, 업무 서비스는 비동기 처리와 공통 서비스, 데이터, 외부 연계와 연결된다. 운영과 보안 관리는 전 계층을 수집하고 통제한다.`}</desc>
      <Defs id={id} />
      {Object.values(G).map((g) => <Group key={g.t} g={g} />)}
      {/* 요청 흐름 */}
      <Ln id={id} d={`M178 ${my("ch")}H210`} />
      <Tx x={194} y={my("ch") - 8} anchor="middle" size={11}>HTTPS</Tx>
      <Ln id={id} d={`M380 ${my("edge")}H412`} />
      <Ln id={id} d={`M592 120H624`} />
      <Ln id={id} d={`M592 330H624`} />
      <Ln id={id} d={`M592 300H608V510H624`} />
      <Ln id={id} d={`M592 270H602V690H624`} />
      <Tx x={596} y={108} size={11}>인가</Tx>
      {/* 업무 서비스에서 비동기, 공통 */}
      <Ln id={id} d={`M1014 120H1046`} />
      <Tx x={1030} y={112} anchor="middle" size={11}>이벤트</Tx>
      <Ln id={id} d={`M1014 330H1030V400H1046`} />
      <Ln id={id} d={`M1014 510H1036V440H1046`} />
      <Ln id={id} d={`M1014 690H1042V480H1046`} />
      {/* 데이터 */}
      <Ln id={id} d={`M820 34V14H1400V32`} />
      <Tx x={1110} y={8} anchor="middle" size={11}>조회, 저장</Tx>
      <Ln id={id} d={`M1238 150H1270`} />
      <Ln id={id} d={`M1238 420H1255V230H1270`} />
      <Ln id={id} d={`M1400 ${G.data.y + gh(G.data)}V355`} dash />
      <Tx x={1408} y={346} size={11}>백업</Tx>
      {/* 외부 연계 */}
      <Ln id={id} d={`M820 ${G.out.y + gh(G.out)}V798`} blue />
      <Ln id={id} d={`M1143 ${G.cmn.y + gh(G.cmn)}V798`} blue />
      <Tx x={828} y={790} size={11} blue>연계 요청</Tx>
      {/* 운영 */}
      <path d={`M94 ${G.ch.y + gh(G.ch)}V890M296 ${G.edge.y + gh(G.edge)}V890M503 ${G.auth.y + gh(G.auth)}V890M94 890H1538M1530 ${G.keep.y + gh(G.keep) / 2}H1538V890`} fill="none" className={s.sInk} strokeWidth={1.3} strokeDasharray="5 4" />
      <Ln id={id} d="M300 890V908" dash />
      <Tx x={104} y={884} size={11}>지표, 로그 수집과 접근 통제</Tx>
      <Tx x={10} y={1004} size={12}>{`묶음 ${Object.keys(G).length}개, 구성 요소 ${n}개. 실선: 요청 흐름, 파란 선: 외부 연계, 점선: 백업과 운영 관리`}</Tx>
    </svg>
  );
}

/** ERD */
type Col = [name: string, type: string, key?: "PK" | "FK"];
const TW = 270, RH = 22, HH = 30;
const X = (c: number) => 20 + c * 300, Y = (r: number) => 40 + r * 230;
const ERD: { id: string; ko: string; c: number; r: number; cols: Col[] }[] = [
  { id: "TB_BIZ", ko: "사업체", c: 0, r: 0, cols: [["BIZ_ID", "BIGINT", "PK"], ["BIZ_NM", "VARCHAR(100)"], ["BIZ_REG_NO", "VARCHAR(256)"], ["OWNER_NM", "VARCHAR(50)"], ["STAMP_FILE_ID", "BIGINT"]] },
  { id: "TB_CLIENT", ko: "거래처", c: 1, r: 0, cols: [["CLIENT_ID", "BIGINT", "PK"], ["BIZ_ID", "BIGINT", "FK"], ["CLIENT_NM", "VARCHAR(100)"], ["CONTACT_NO", "VARCHAR(256)"], ["PREV_BALANCE", "DECIMAL(15)"]] },
  { id: "TB_CLIENT_PRICE", ko: "거래처별 단가", c: 2, r: 0, cols: [["CLIENT_ID", "BIGINT", "PK"], ["ITEM_ID", "BIGINT", "PK"], ["UNIT_PRICE", "DECIMAL(15)"], ["APPLY_DT", "DATE"]] },
  { id: "TB_ITEM", ko: "품목", c: 3, r: 0, cols: [["ITEM_ID", "BIGINT", "PK"], ["BIZ_ID", "BIGINT", "FK"], ["ITEM_NM", "VARCHAR(100)"], ["SPEC", "VARCHAR(100)"], ["UNIT", "VARCHAR(10)"], ["STD_PRICE", "DECIMAL(15)"], ["TAX_FREE_YN", "CHAR(1)"]] },
  { id: "TB_USER_BIZ", ko: "이용자 사업체", c: 0, r: 1, cols: [["USER_ID", "BIGINT", "PK"], ["BIZ_ID", "BIGINT", "PK"], ["ROLE_CD", "CHAR(2)"]] },
  { id: "TB_DOC", ko: "문서", c: 1, r: 1, cols: [["DOC_ID", "BIGINT", "PK"], ["BIZ_ID", "BIGINT", "FK"], ["CLIENT_ID", "BIGINT", "FK"], ["DOC_KIND_CD", "CHAR(2)"], ["DOC_NO", "VARCHAR(30)"], ["SUPPLY_AMT", "DECIMAL(15)"], ["CONFIRM_DT", "DATETIME"]] },
  { id: "TB_DOC_ITEM", ko: "문서 품목", c: 2, r: 1, cols: [["DOC_ID", "BIGINT", "PK"], ["LINE_NO", "INT", "PK"], ["ITEM_ID", "BIGINT", "FK"], ["QTY", "DECIMAL(12,2)"], ["UNIT_PRICE", "DECIMAL(15)"], ["AMT", "DECIMAL(15)"]] },
  { id: "TB_RECEIPT", ko: "수금", c: 3, r: 1, cols: [["RECEIPT_ID", "BIGINT", "PK"], ["CLIENT_ID", "BIGINT", "FK"], ["RECEIPT_AMT", "DECIMAL(15)"], ["RECEIPT_DT", "DATE"], ["METHOD_CD", "CHAR(2)"]] },
  { id: "TB_USER", ko: "이용자", c: 0, r: 2, cols: [["USER_ID", "BIGINT", "PK"], ["LOGIN_ID", "VARCHAR(50)"], ["PWD_HASH", "VARCHAR(256)"], ["LAST_LOGIN_DT", "DATETIME"]] },
  { id: "TB_DOC_ADJ", ko: "금액 조정", c: 1, r: 2, cols: [["DOC_ID", "BIGINT", "PK"], ["ADJ_NO", "INT", "PK"], ["ADJ_NM", "VARCHAR(50)"], ["RATE", "DECIMAL(5,1)"], ["ADJ_AMT", "DECIMAL(15)"]] },
  { id: "TB_SHARE_LINK", ko: "공유 링크", c: 2, r: 2, cols: [["LINK_KEY", "CHAR(24)", "PK"], ["DOC_ID", "BIGINT", "FK"], ["EXPIRE_DT", "DATETIME"], ["VIEW_CNT", "INT"]] },
  { id: "TB_AUDIT_LOG", ko: "감사 로그", c: 3, r: 2, cols: [["LOG_NO", "BIGINT", "PK"], ["USER_ID", "BIGINT", "FK"], ["ACT_CD", "CHAR(2)"], ["TARGET_ID", "BIGINT"], ["ACCESS_IP", "VARCHAR(40)"], ["ACCESS_DT", "DATETIME"]] },
];
function ErdTable({ t }: { t: (typeof ERD)[number] }) {
  const x = X(t.c), y = Y(t.r);
  return (
    <g>
      <rect x={x} y={y} width={TW} height={HH + t.cols.length * RH + 4} className={s.box} strokeWidth={1.5} />
      <rect x={x} y={y} width={TW} height={HH} className={s.hd} />
      <text x={x + 9} y={y + 20} fontSize={12.5} fontWeight={700} className={s.fPaper} {...MONO}>{t.id}</text>
      <text x={x + TW - 9} y={y + 20} fontSize={11.5} className={s.fPaper} opacity={0.75} textAnchor="end" {...F}>{t.ko}</text>
      {t.cols.map(([n, ty, k], i) => (
        <g key={n}>
          {i > 0 && t.cols[i - 1][2] === "PK" && k !== "PK" ? <line x1={x} x2={x + TW} y1={y + HH + i * RH + 2} y2={y + HH + i * RH + 2} className={s.sInk} strokeWidth={1} /> : null}
          <text x={x + 9} y={y + HH + i * RH + 17} fontSize={11.5} fontWeight={k === "PK" ? 700 : 400} className={s.fInk} {...MONO}>{n}</text>
          <text x={x + TW - 36} y={y + HH + i * RH + 17} fontSize={10.5} className={s.fSub} textAnchor="end" {...MONO}>{ty}</text>
          {k ? <text x={x + TW - 9} y={y + HH + i * RH + 17} fontSize={10.5} fontWeight={800} className={k === "PK" ? s.fInk : s.fBlue} textAnchor="end" {...MONO}>{k}</text> : null}
        </g>
      ))}
    </g>
  );
}
/** 관계선: 1쪽은 막대 둘, N쪽은 갈래 */
function Rel({ d, one, many }: { d: string; one: [number, number, "h" | "v"]; many: [number, number, "l" | "r" | "u" | "d"] }) {
  const [ox, oy, od] = one, [mx, my, md] = many;
  const foot = md === "l" ? `M${mx + 12} ${my}L${mx} ${my - 7}M${mx + 12} ${my}L${mx} ${my + 7}` : md === "r" ? `M${mx - 12} ${my}L${mx} ${my - 7}M${mx - 12} ${my}L${mx} ${my + 7}` : md === "u" ? `M${mx} ${my + 12}L${mx - 7} ${my}M${mx} ${my + 12}L${mx + 7} ${my}` : `M${mx} ${my - 12}L${mx - 7} ${my}M${mx} ${my - 12}L${mx + 7} ${my}`;
  const bar = od === "h" ? `M${ox} ${oy - 7}V${oy + 7}M${ox + (ox < mx ? 5 : -5)} ${oy - 7}V${oy + 7}` : `M${ox - 7} ${oy}H${ox + 7}M${ox - 7} ${oy + (oy < my ? 5 : -5)}H${ox + 7}`;
  return <path d={`${d}${foot}${bar}`} fill="none" className={s.sInk} strokeWidth={1.3} />;
}
function Erd() {
  return (
    <svg viewBox="0 0 1230 740" role="img" aria-labelledby="erd-t erd-d" className={s.svg}>
      <title id="erd-t">거래장부 ERD</title>
      <desc id="erd-d">{`테이블 ${ERD.length}개: ${ERD.map((t) => `${t.id}(${t.ko})`).join(", ")}. 사업체는 거래처, 이용자 사업체와 1대 다. 거래처는 거래처별 단가, 문서, 수금과 1대 다. 품목은 거래처별 단가, 문서 품목과 1대 다. 문서는 문서 품목, 금액 조정, 공유 링크와 1대 다. 이용자는 이용자 사업체, 감사 로그와 1대 다.`}</desc>
      {ERD.map((t) => <ErdTable key={t.id} t={t} />)}
      <Rel d="M290 100H320" one={[298, 100, "h"]} many={[320, 100, "r"]} />
      <Rel d="M590 100H620" one={[598, 100, "h"]} many={[620, 100, "r"]} />
      <Rel d="M920 100H890" one={[912, 100, "h"]} many={[890, 100, "l"]} />
      <Rel d="M155 184V270" one={[155, 194, "v"]} many={[155, 270, "d"]} />
      <Rel d="M455 184V270" one={[455, 194, "v"]} many={[455, 270, "d"]} />
      <Rel d="M590 330H620" one={[598, 330, "h"]} many={[620, 330, "r"]} />
      <Rel d="M455 458V500" one={[455, 466, "v"]} many={[455, 500, "d"]} />
      <Rel d="M155 500V370" one={[155, 490, "v"]} many={[155, 370, "u"]} />
      <Rel d="M590 430H605V560H620" one={[598, 430, "h"]} many={[620, 560, "r"]} />
      <Rel d="M1055 228V249H755V270" one={[1055, 236, "v"]} many={[755, 270, "d"]} />
      <Rel d="M455 40V18H1207V330H1190" one={[455, 32, "v"]} many={[1190, 330, "l"]} />
      <Rel d="M155 622V706H1055V666" one={[155, 632, "v"]} many={[1055, 666, "u"]} />
      <Tx x={20} y={732} size={12}>굵은 항목: 기본 키(PK), 파란 FK: 외래 키, 막대 둘: 1, 갈래: N. BIZ_REG_NO, CONTACT_NO: 암호화 저장. 전체 테이블 38개 중 12개</Tx>
    </svg>
  );
}

/** 업무 흐름도: 거래명세서 발행 */
function Swim() {
  const id = "sw";
  const D = ({ x, y, t }: { x: number; y: number; t: string }) => (
    <g>
      <path d={`M${x} ${y - 30}L${x + 62} ${y}L${x} ${y + 30}L${x - 62} ${y}z`} className={s.box} strokeWidth={1.5} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={800} className={s.fInk} {...F}>{t}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 1180 470" role="img" aria-labelledby="sw-t sw-d" className={s.svg}>
      <title id="sw-t">업무 흐름도: 거래명세서 발행</title>
      <desc id="sw-d">작성자가 거래처와 품목을 선택해 문서를 작성하면 시스템이 금액을 계산한다. 확정하지 않으면 임시 저장하고, 확정하면 문서 번호를 발급하고 공유 링크를 만든다. 작성자가 링크를 발송하면 거래처가 문서를 열람하고, 시스템이 열람 기록을 저장한다. 거래처가 확인하면 미수 대장에 반영하고 작성자가 수금을 등록한다. 확인하지 않으면 수정 요청을 보낸다.</desc>
      <Defs id={id} />
      {["작성자", "시스템", "거래처"].map((t, i) => (
        <g key={t}>
          <rect x={10} y={20 + i * 145} width={1160} height={145} className={i === 1 ? s.lane : s.laneP} />
          <rect x={10} y={20 + i * 145} width={72} height={145} className={s.hd} />
          <text x={46} y={98 + i * 145} textAnchor="middle" fontSize={14} fontWeight={800} className={s.fPaper} {...F}>{t}</text>
        </g>
      ))}
      <Box x={104} y={64} w={136} h={56} t="거래처, 품목 선택" sub="거래처별 단가" />
      <Box x={270} y={64} w={130} h={56} t="문서 작성" sub="견적서, 거래명세서" />
      <Ln id={id} d="M240 92H268" />
      <Box x={270} y={210} w={130} h={56} t="금액 계산" sub="조정, 부가세, 단수" />
      <Ln id={id} d="M335 120V208" />
      <D x={500} y={238} t="확정" />
      <Ln id={id} d="M400 238H436" />
      <Box x={610} y={210} w={120} h={56} t="문서 확정" sub="문서 번호 발급" />
      <Ln id={id} d="M562 238H608" />
      <Tx x={572} y={230} size={11.5}>예</Tx>
      <Box x={440} y={64} w={120} h={56} t="임시 저장" sub="수정 계속" />
      <Ln id={id} d="M500 208V122" />
      <Tx x={508} y={170} size={11.5}>아니오</Tx>
      <Box x={770} y={210} w={130} h={56} t="공유 링크 발급" sub="만료일 설정" />
      <Ln id={id} d="M730 238H768" />
      <Box x={770} y={64} w={130} h={56} t="발송" sub="문자, 알림톡, 링크" />
      <Ln id={id} d="M835 208V122" />
      <Box x={770} y={355} w={130} h={56} t="문서 열람" sub="공유 링크" />
      <Ln id={id} d="M870 120V140H930V330H870V353" dash />
      <D x={1000} y={383} t="확인" />
      <Ln id={id} d="M900 383H936" />
      <Box x={960} y={210} w={170} h={56} t="미수 대장 반영" sub="거래처별 잔액" />
      <Ln id={id} d="M1000 353V268" />
      <Tx x={1008} y={316} size={11.5}>예</Tx>
      <Box x={1084} y={362} w={80} h={42} t="수정 요청" />
      <Ln id={id} d="M1062 383H1082" />
      <Tx x={1066} y={352} size={11.5}>아니오</Tx>
      <Box x={960} y={64} w={170} h={56} t="수금 등록" sub="입금 확인, 잔액 차감" />
      <Ln id={id} d="M1045 208V122" />
      <Box x={104} y={210} w={136} h={56} t="열람 기록 저장" sub="일시, 횟수" dash />
      <Ln id={id} d="M768 383H172V268" dash />
    </svg>
  );
}

const DOCS: [string, string, string][] = [
  ["현황분석서", "서버, 프로그램, 버전, 계정, 만료일, 위험 요소", "착수 2주"],
  ["시스템 구성도", "묶음별 구성 요소, 요청 흐름, 연계, 운영 범위", "착수 2주"],
  ["메뉴 구조도, 프로그램 목록", "이용자 화면, 관리자 화면, 일정 작업", "착수 4주"],
  ["ERD, 테이블 정의서", "사용 테이블과 미사용 테이블, 항목, 관계, 암호화 항목", "착수 6주"],
  ["업무 흐름도", "업무별 처리 순서, 분기, 알림", "착수 6주"],
  ["인터페이스 정의서", "연계 대상, 방식, 주기, 실패 시 처리", "착수 4주"],
  ["계정, 권한 목록", "서버, DB, 관리자 계정과 권한, 미사용 계정", "착수 2주"],
  ["운영 매뉴얼", "배포, 백업과 복구, 정기 작업 순서", "착수 6주"],
];
const WATCH: [string, string, string][] = [
  ["도메인, SSL 인증서", "만료일, 자동 갱신 여부", "월 1회"],
  ["백업", "수행 결과, 복구 시험", "월 1회, 분기 1회"],
  ["보안 업데이트", "프로그램, 라이브러리 보안 권고", "월 1회"],
  ["개인정보", "처리방침과 수집 항목 일치, 접속기록 보관, 파기", "분기 1회"],
  ["계정, 권한", "미사용 계정, 권한 변경 이력", "분기 1회"],
  ["성능", "응답 시간, 느린 쿼리, 자원 사용량", "월 1회"],
  ["연계", "발송 실패, 인증 키 만료", "월 1회"],
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
function Tbl({ label, head, rows }: { label: string; head: [string, string, string]; rows: [string, string, string][] }) {
  return (
    <div className={s.tbl} role="table" aria-label={label}>
      <div role="row" className={s.tHead}>
        {head.map((h) => <span role="columnheader" key={h}>{h}</span>)}
      </div>
      {rows.map(([a, b, c]) => (
        <div role="row" key={a}>
          <span role="rowheader">{a}</span>
          <span role="cell">{b}</span>
          <span role="cell">{c}</span>
        </div>
      ))}
    </div>
  );
}

export function ManageStory() {
  return (
    <div className={s.root}>
      <ol className={s.steps} role="list">
        {STEPS.map((t, i) => (
          <li key={t}>
            <span>{i}</span>
            {t}
          </li>
        ))}
      </ol>
      <p className={s.subject}>곰파트너 거래장부를 대상으로 작성한 설계 예시</p>

      <Doc no="0, 1" title="사전 검토, 현황 분석" lead="상담 신청 시 사이트를 확인해 사전 검토서를 드립니다. 계약 후 소스, 서버, DB를 확인하고 아래 문서를 작성합니다.">
        <Tbl label="분석 산출물" head={["산출물", "내용", "작성 시점"]} rows={DOCS} />
      </Doc>
      <Doc no="2" title="시스템 구성도" lead="묶음별 구성 요소와 요청 흐름, 외부 연계, 백업, 운영 관리 범위를 한 장으로 정리합니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="시스템 구성도 그림">
          <Architecture />
        </div>
      </Doc>
      <Doc no="3" title="ERD" lead="설계서가 없는 DB는 테이블 정의만으로 관계가 드러나지 않습니다. 소스의 쿼리와 실제 데이터를 대조해 사용 중인 테이블과 관계를 확인하고, 미사용 테이블, 암호화 항목, 개인정보 항목을 표시합니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="ERD 그림">
          <Erd />
        </div>
      </Doc>
      <Doc no="4" title="업무 흐름도" lead="업무별로 이용자, 시스템, 상대방의 처리 순서와 분기를 정리합니다. 아래는 거래명세서 발행 업무입니다.">
        <div className={s.scroll} tabIndex={0} role="group" aria-label="업무 흐름도 그림">
          <Swim />
        </div>
      </Doc>
      <Doc no="5, 6" title="관리 항목, 월간 점검" lead="분석 결과로 관리 항목과 주기를 정하고, 점검 결과를 월간 점검 보고서로 드립니다.">
        <Tbl label="관리 항목" head={["관리 항목", "확인 내용", "주기"]} rows={WATCH} />
      </Doc>
    </div>
  );
}
