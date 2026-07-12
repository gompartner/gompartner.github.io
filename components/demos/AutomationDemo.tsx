"use client";

import { useRef, useState } from "react";
import { Play, Plus, Power, Terminal, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:automation:v1";
const MAX_LOGS = 50;

const TRIGGERS = ["상담 신청 접수됨", "결제 완료됨", "예약 취소됨", "문의 폼 제출됨"];
const ACTIONS = ["알림톡 발송", "이메일 발송", "슬랙 알림", "구글 시트에 기록", "주문 상태 변경"];

interface Rule {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

interface AutomationState {
  rules: Rule[];
  logs: string[];
}

const seedRules: Rule[] = [
  { id: "rule-1", trigger: "상담 신청 접수됨", action: "알림톡 발송", enabled: true },
  { id: "rule-2", trigger: "결제 완료됨", action: "구글 시트에 기록", enabled: true },
];

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function AutomationDemo() {
  const [state, setState] = useLocalStorage<AutomationState>(STORAGE_KEY, {
    rules: seedRules,
    logs: [],
  });
  const [draft, setDraft] = useState({ trigger: TRIGGERS[0], action: ACTIONS[0] });
  const [running, setRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const appendLog = (line: string) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, line].slice(-MAX_LOGS),
    }));
    requestAnimationFrame(() => {
      logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const addRule = () => {
    setState((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        { id: `rule-${Date.now()}`, trigger: draft.trigger, action: draft.action, enabled: true },
      ],
    }));
  };

  const toggleRule = (id: string) => {
    setState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  const deleteRule = (id: string) => {
    setState((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== id),
    }));
  };

  const runSimulation = () => {
    const enabled = state.rules.filter((r) => r.enabled);
    if (running) return;
    if (enabled.length === 0) {
      appendLog(`[${timestamp()}] ⚠ 활성화된 규칙이 없습니다. 규칙을 추가하거나 켜주세요.`);
      return;
    }
    setRunning(true);
    appendLog(`[${timestamp()}] ▶ 시뮬레이션 시작 — 규칙 ${enabled.length}개 실행`);
    enabled.forEach((rule, i) => {
      setTimeout(() => {
        appendLog(`[${timestamp()}] ▸ 이벤트 감지: ${rule.trigger}`);
      }, 500 + i * 900);
      setTimeout(() => {
        const ms = 80 + Math.floor(Math.random() * 300);
        appendLog(`[${timestamp()}]   └ ${rule.action} ... OK (${ms}ms)`);
      }, 900 + i * 900);
    });
    setTimeout(() => {
      appendLog(`[${timestamp()}] ■ 완료 — 성공 ${enabled.length} / 실패 0`);
      setRunning(false);
    }, 1100 + enabled.length * 900);
  };

  const clearLogs = () => {
    setState((prev) => ({ ...prev, logs: [] }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 font-mono text-neutral-300 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <header>
          <p className="flex items-center gap-2 text-sm text-green-400">
            <Terminal size={16} aria-hidden />
            gs-automation-hub <span className="text-neutral-600">v1.0.0</span>
          </p>
          <h1 className="mt-4 text-2xl font-bold text-neutral-100 sm:text-3xl">
            반복 업무, <span className="text-green-400">규칙</span>으로 자동화하세요<span className="animate-pulse text-green-400">_</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            {"//"} 트리거와 액션을 조합해 규칙을 만들고 시뮬레이션을 실행해보세요.
            <br />
            {"//"} 규칙과 실행 로그는 브라우저에 저장되어 다시 방문해도 유지됩니다.
          </p>
        </header>

        {/* 규칙 빌더 */}
        <section className="mt-10 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400"># 새 규칙 만들기</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="auto-trigger">트리거</label>
            <select
              id="auto-trigger"
              value={draft.trigger}
              onChange={(e) => setDraft((d) => ({ ...d, trigger: e.target.value }))}
              className="flex-1 cursor-pointer rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-200 outline-none transition-colors focus:border-green-400"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>WHEN: {t}</option>
              ))}
            </select>
            <span className="hidden text-green-400 sm:block" aria-hidden>→</span>
            <label className="sr-only" htmlFor="auto-action">액션</label>
            <select
              id="auto-action"
              value={draft.action}
              onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
              className="flex-1 cursor-pointer rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-200 outline-none transition-colors focus:border-green-400"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>THEN: {a}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-400 px-4 py-2.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-green-300"
            >
              <Plus size={15} aria-hidden />
              추가
            </button>
          </div>
        </section>

        {/* 규칙 목록 */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            # 규칙 목록 ({state.rules.length})
          </h2>
          {state.rules.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-600">
              규칙이 없습니다. 위에서 첫 규칙을 만들어보세요.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {state.rules.map((rule) => (
                <li
                  key={rule.id}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                    rule.enabled
                      ? "border-neutral-800 bg-neutral-900/60"
                      : "border-neutral-900 bg-neutral-950 opacity-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    aria-pressed={rule.enabled}
                    aria-label={`규칙 ${rule.enabled ? "끄기" : "켜기"}`}
                    className={`rounded-full p-1.5 transition-colors ${
                      rule.enabled ? "bg-green-400/15 text-green-400" : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    <Power size={14} aria-hidden />
                  </button>
                  <p className="min-w-0 flex-1 truncate">
                    <span className="text-neutral-500">WHEN</span>{" "}
                    <span className="text-neutral-200">{rule.trigger}</span>{" "}
                    <span className="text-green-400">→</span>{" "}
                    <span className="text-neutral-500">THEN</span>{" "}
                    <span className="text-cyan-300">{rule.action}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    aria-label="규칙 삭제"
                    className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={runSimulation}
            disabled={running}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-green-400/50 bg-green-400/10 px-5 py-2.5 text-sm font-bold text-green-400 transition-colors hover:bg-green-400/20 disabled:cursor-wait disabled:opacity-50"
          >
            <Play size={15} aria-hidden />
            {running ? "실행 중..." : "시뮬레이션 실행"}
          </button>
        </section>

        {/* 실행 로그 */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              # 실행 로그
            </h2>
            {state.logs.length > 0 && (
              <button
                type="button"
                onClick={clearLogs}
                className="text-xs text-neutral-600 underline-offset-2 transition-colors hover:text-neutral-300 hover:underline"
              >
                로그 지우기
              </button>
            )}
          </div>
          <div className="mt-3 h-64 overflow-y-auto rounded-lg border border-neutral-800 bg-black p-4 text-xs leading-relaxed">
            {state.logs.length === 0 ? (
              <p className="text-neutral-600">$ 로그가 비어 있습니다. 시뮬레이션을 실행해보세요.</p>
            ) : (
              state.logs.map((line, i) => (
                <p
                  key={`${i}-${line}`}
                  className={
                    line.includes("▶") || line.includes("■")
                      ? "text-green-400"
                      : line.includes("⚠")
                        ? "text-amber-400"
                        : "text-neutral-400"
                  }
                >
                  {line}
                </p>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-neutral-700">
          {"//"} 곰선임 데모 사이트 — 실제 발송 없이 브라우저 안에서만 동작하는 시뮬레이션입니다.
        </p>
      </div>
    </div>
  );
}
