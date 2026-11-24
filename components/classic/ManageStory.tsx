import { ArrowDown, ArrowRight } from "lucide-react";
import s from "./ManageStory.module.css";

// 11-25 유지관리를 맡으면 하는 일(사용자 확인 장면 순서): 0 계약 전 사전 검토 > 1 현황 분석 > 2 시스템 구성도 > 3 ERD > 4 사용자별 서비스 흐름도 > 5 관리 항목 > 6 월간 점검.
// 대상은 곰파트너 카탈로그의 학원 홈페이지(가상의 사이트). 실제 고객, 실제 시스템 구조는 싣지 않는다. 문서는 일부만 보이고 전체는 계약 뒤에 드린다.

function Flow({ items }: { items: { name: string; sub?: string }[] }) {
  return (
    <ol className={s.flow} role="list">
      {items.map((it, i) => (
        <li key={it.name}>
          {i > 0 ? (
            <span className={s.arrow} aria-hidden>
              <ArrowRight size={18} className={s.h} />
              <ArrowDown size={18} className={s.v} />
            </span>
          ) : null}
          <span className={s.node}>
            <b>{it.name}</b>
            {it.sub ? <small>{it.sub}</small> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

const TABLES: { name: string; ko: string; cols: [string, string][]; more: number }[] = [
  { name: "member", ko: "회원", cols: [["id", "PK"], ["name", ""], ["phone", ""]], more: 6 },
  { name: "course", ko: "강좌", cols: [["id", "PK"], ["title", ""], ["fee", ""]], more: 5 },
  { name: "enroll", ko: "수강 신청", cols: [["id", "PK"], ["member_id", "FK"], ["course_id", "FK"]], more: 4 },
  { name: "inquiry", ko: "상담 신청", cols: [["id", "PK"], ["member_id", "FK"], ["status", ""]], more: 5 },
];

const LANES: { who: string; steps: string[] }[] = [
  { who: "학부모", steps: ["강좌 안내", "상담 신청", "접수 문자 수신"] },
  { who: "수강생", steps: ["로그인", "수강 신청", "시간표 확인"] },
  { who: "관리자", steps: ["상담 접수 확인", "수강 승인", "공지 등록"] },
];

const WATCH: [string, string, string][] = [
  ["도메인, SSL 인증서", "만료일", "월 1회"],
  ["문의, 상담 신청 폼", "접수와 알림 수신", "월 1회"],
  ["개인정보처리방침", "수집 항목과 화면 일치", "분기 1회"],
  ["관리자 계정", "미사용 계정, 권한", "분기 1회"],
  ["프로그램 버전", "보안 권고 대상 여부", "월 1회"],
];

const STEPS = ["사전 검토", "현황 분석", "시스템 구성도", "ERD", "서비스 흐름도", "관리 항목", "월간 점검"];

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
      <p className={s.subject}>카탈로그 학원 홈페이지를 대상으로 작성한 예시</p>

      <article className={s.doc}>
        <header>
          <p>0, 1</p>
          <h3>사전 검토, 현황 분석</h3>
        </header>
        <p className={s.lead}>상담 신청 시 사이트를 확인해 사전 검토서를 드립니다. 계약 후 소스, 서버, DB를 확인해 현재 구성을 정리합니다.</p>
        <dl className={s.kv}>
          {[
            ["확인 대상", "화면 62개, 관리자 화면 18개"],
            ["프로그램", "PHP, 게시판 프로그램, MySQL"],
            ["기존 문서", "화면 목록 일부, 설계서 없음"],
            ["작성 문서", "시스템 구성도, ERD, 서비스 흐름도"],
          ].map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className={s.doc}>
        <header>
          <p>2</p>
          <h3>시스템 구성도</h3>
        </header>
        <p className={s.lead}>접속 경로와 서버, DB, 외부 서비스의 연결을 한 장으로 정리합니다.</p>
        <div className={s.fig} role="img" aria-label="방문자가 도메인과 SSL 인증서를 거쳐 웹 서버에 접속하고, 웹 서버가 DB와 문자 발송, 메일 발송, 지도 서비스에 연결되는 시스템 구성도">
          <Flow items={[{ name: "방문자", sub: "PC, 모바일" }, { name: "도메인, SSL", sub: "등록업체, 인증서" }, { name: "웹 서버", sub: "웹호스팅, PHP" }, { name: "DB", sub: "MySQL" }]} />
          <div className={s.ext}>
            <span className={s.extLabel}>외부 서비스</span>
            {["문자 발송", "메일 발송", "지도"].map((x) => (
              <span key={x} className={s.extNode}>{x}</span>
            ))}
          </div>
        </div>
      </article>

      <article className={s.doc}>
        <header>
          <p>3</p>
          <h3>ERD</h3>
        </header>
        <p className={s.lead}>설계서가 없으면 DB 구조를 읽어 테이블과 관계를 문서로 작성합니다.</p>
        <div className={s.erd} role="img" aria-label="회원, 강좌, 수강 신청, 상담 신청 테이블과 관계를 나타낸 ERD 일부">
          {TABLES.map((t) => (
            <div key={t.name} className={s.table}>
              <p>
                <b>{t.name}</b>
                <span>{t.ko}</span>
              </p>
              <ul role="list">
                {t.cols.map(([c, k]) => (
                  <li key={c}>
                    <span>{c}</span>
                    {k ? <i>{k}</i> : null}
                  </li>
                ))}
                <li className={s.more}>외 {t.more}개 항목</li>
              </ul>
            </div>
          ))}
        </div>
        <ul className={s.rel} role="list">
          <li>member 1 : N enroll</li>
          <li>course 1 : N enroll</li>
          <li>member 1 : N inquiry</li>
          <li>전체 테이블 14개 중 4개</li>
        </ul>
      </article>

      <article className={s.doc}>
        <header>
          <p>4</p>
          <h3>사용자별 서비스 흐름도</h3>
        </header>
        <p className={s.lead}>사용자 유형별로 이용 화면과 순서를 정리합니다.</p>
        <div className={s.lanes}>
          {LANES.map((l) => (
            <div key={l.who} className={s.lane}>
              <p>{l.who}</p>
              <Flow items={l.steps.map((name) => ({ name }))} />
            </div>
          ))}
        </div>
      </article>

      <article className={s.doc}>
        <header>
          <p>5, 6</p>
          <h3>관리 항목, 월간 점검</h3>
        </header>
        <p className={s.lead}>분석 결과로 관리 항목을 정하고, 매월 점검해 월간 점검 보고서로 드립니다.</p>
        <div className={s.watch} role="table" aria-label="관리 항목">
          <div role="row" className={s.wHead}>
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
      </article>
    </div>
  );
}
