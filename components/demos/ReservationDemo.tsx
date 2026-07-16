"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMounted } from "@/hooks/useMounted";

const STORAGE_KEY = "gs-demo:reservation:v1";

const TIME_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface Reservation {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  name: string;
  memo: string;
}

interface ReservationState {
  reservations: Reservation[];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function ReservationDemo() {
  const mounted = useMounted();
  const [state, setState] = useLocalStorage<ReservationState>(STORAGE_KEY, {
    reservations: [],
  });

  // 달력 기준 정보는 mount 후에만 계산한다 (프리렌더 시각 동결 방지)
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", memo: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const d = new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setToday(dateKey(d.getFullYear(), d.getMonth(), d.getDate()));
  }, [mounted]);

  const moveMonth = (delta: number) => {
    setView((prev) => {
      if (!prev) return prev;
      const next = new Date(prev.y, prev.m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isBooked = (date: string, time: string) =>
    state.reservations.some((r) => r.date === date && r.time === time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    const name = form.name.trim();
    if (name.length < 2) {
      setError("예약자 이름을 2자 이상 입력해주세요.");
      return;
    }
    if (isBooked(selectedDate, selectedTime)) {
      setError("이미 예약된 시간입니다. 다른 시간을 선택해주세요.");
      return;
    }
    setState((prev) => ({
      reservations: [
        ...prev.reservations,
        {
          id: `r-${Date.now()}`,
          date: selectedDate,
          time: selectedTime,
          name,
          memo: form.memo.trim(),
        },
      ],
    }));
    setForm({ name: "", memo: "" });
    setSelectedTime(null);
    setError(null);
  };

  const cancelReservation = (id: string) => {
    setState((prev) => ({
      reservations: prev.reservations.filter((r) => r.id !== id),
    }));
  };

  const sorted = [...state.reservations].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );

  // 달력 그리드 계산
  const grid: Array<{ day: number; key: string; past: boolean } | null> = [];
  if (view && today) {
    const firstDay = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(view.y, view.m, d);
      grid.push({ day: d, key, past: key < today });
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        {/* 헤더 */}
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-800">
            <CalendarDays size={15} aria-hidden />
            이음 상담실 · 온라인 예약
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            원하는 날짜와 시간을
            <br className="sm:hidden" /> 바로 예약하세요
          </h1>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            전화 없이 30초 만에 예약 완료. 예약 내역은 이 브라우저에 저장되어 언제든 다시 확인할 수 있어요.
          </p>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* 달력 + 시간 선택 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {view ? `${view.y}년 ${view.m + 1}월` : "달력 불러오는 중…"}
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  aria-label="이전 달"
                  className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                  disabled={!view}
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  aria-label="다음 달"
                  className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                  disabled={!view}
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {view && today
                ? grid.map((cell, i) =>
                    cell ? (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={cell.past}
                        onClick={() => {
                          setSelectedDate(cell.key);
                          setSelectedTime(null);
                          setError(null);
                        }}
                        aria-pressed={selectedDate === cell.key}
                        className={`aspect-square rounded-xl text-sm font-medium transition-colors ${
                          selectedDate === cell.key
                            ? "bg-emerald-600 text-white"
                            : cell.past
                              ? "text-neutral-300"
                              : cell.key === today
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {cell.day}
                      </button>
                    ) : (
                      <div key={`empty-${i}`} aria-hidden />
                    ),
                  )
                : Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-xl bg-neutral-100" />
                  ))}
            </div>

            {/* 시간 슬롯 */}
            {selectedDate && (
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <h3 className="text-sm font-bold text-neutral-700">
                  {selectedDate.replaceAll("-", ".")} 예약 가능 시간
                </h3>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const booked = isBooked(selectedDate, time);
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={booked}
                        onClick={() => {
                          setSelectedTime(time);
                          setError(null);
                        }}
                        aria-pressed={selectedTime === time}
                        className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                          selectedTime === time
                            ? "bg-emerald-600 text-white"
                            : booked
                              ? "bg-neutral-100 text-neutral-300 line-through"
                              : "border border-neutral-200 text-neutral-700 hover:border-emerald-500 hover:text-emerald-700"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 예약 폼 + 내 예약 */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold">예약 정보</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {selectedDate && selectedTime
                  ? `${selectedDate.replaceAll("-", ".")} ${selectedTime} 예약을 진행합니다.`
                  : "왼쪽에서 날짜와 시간을 먼저 선택해주세요."}
              </p>
              <label className="mt-5 block text-sm font-semibold" htmlFor="rsv-name">
                예약자 이름
              </label>
              <input
                id="rsv-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-emerald-500"
              />
              <label className="mt-4 block text-sm font-semibold" htmlFor="rsv-memo">
                요청사항 <span className="font-normal text-neutral-400">(선택)</span>
              </label>
              <textarea
                id="rsv-memo"
                value={form.memo}
                onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                placeholder="상담 주제나 참고사항을 남겨주세요"
                rows={2}
                className="mt-2 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-emerald-500"
              />
              {error && (
                <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                예약 확정하기
              </button>
            </form>

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <CalendarCheck className="text-emerald-600" size={20} aria-hidden />
                내 예약 <span className="text-emerald-600">{sorted.length}</span>
              </h2>
              {sorted.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-400">
                  아직 예약이 없습니다. 첫 예약을 만들어보세요!
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {sorted.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                    >
                      <div>
                        <p className="font-bold text-neutral-800">
                          {r.date.replaceAll("-", ".")} <span className="text-emerald-700">{r.time}</span>
                        </p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {r.name}
                          {r.memo && ` · ${r.memo}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cancelReservation(r.id)}
                        aria-label={`${r.date} ${r.time} 예약 취소`}
                        className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
