"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  CheckCircle2,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  contact: string;
  need: string;
  message: string;
  status: "new" | "done";
  createdAt: Date | null;
}

type LoadState = "idle" | "loading" | "ready" | "denied" | "error";

async function firebase() {
  const [{ getFirebaseApp, INQUIRIES_COLLECTION }, auth, firestore] = await Promise.all([
    import("@/lib/firebase"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);
  const app = getFirebaseApp();
  return {
    auth: auth.getAuth(app),
    authApi: auth,
    db: firestore.getFirestore(app),
    firestore,
    INQUIRIES_COLLECTION,
  };
}

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function AdminInquiries() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // 로그인 상태 구독
  useEffect(() => {
    let unsubscribe = () => {};
    firebase().then(({ auth, authApi }) => {
      unsubscribe = authApi.onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
      });
    });
    return () => unsubscribe();
  }, []);

  const loadInquiries = useCallback(async () => {
    setLoadState("loading");
    try {
      const { db, firestore, INQUIRIES_COLLECTION } = await firebase();
      const snap = await firestore.getDocs(
        firestore.query(
          firestore.collection(db, INQUIRIES_COLLECTION),
          firestore.orderBy("createdAt", "desc"),
          firestore.limit(100)
        )
      );
      setInquiries(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name ?? ""),
            contact: String(data.contact ?? ""),
            need: String(data.need ?? ""),
            message: String(data.message ?? ""),
            status: data.status === "done" ? "done" : "new",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
      );
      setLoadState("ready");
    } catch (err) {
      // 보안 규칙 거부(비인가 계정)와 기타 오류 구분
      const code = (err as { code?: string }).code;
      setLoadState(code === "permission-denied" ? "denied" : "error");
    }
  }, []);

  useEffect(() => {
    if (user) void loadInquiries();
  }, [user, loadInquiries]);

  async function signIn() {
    setAuthError(null);
    try {
      const { auth, authApi } = await firebase();
      await authApi.signInWithPopup(auth, new authApi.GoogleAuthProvider());
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // 사용자가 팝업을 직접 닫은 경우는 오류로 취급하지 않음
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
        return;
      }
      setAuthError(e.code ?? e.message ?? "알 수 없는 오류");
    }
  }

  async function signOut() {
    const { auth, authApi } = await firebase();
    await authApi.signOut(auth);
    setInquiries([]);
    setLoadState("idle");
  }

  async function toggleStatus(inquiry: Inquiry) {
    const next = inquiry.status === "new" ? "done" : "new";
    setInquiries((list) =>
      list.map((i) => (i.id === inquiry.id ? { ...i, status: next } : i))
    );
    try {
      const { db, firestore, INQUIRIES_COLLECTION } = await firebase();
      await firestore.updateDoc(firestore.doc(db, INQUIRIES_COLLECTION, inquiry.id), {
        status: next,
      });
    } catch {
      // 실패 시 원복
      setInquiries((list) =>
        list.map((i) => (i.id === inquiry.id ? { ...i, status: inquiry.status } : i))
      );
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">문의 관리</h1>
            <p className="mt-1 text-sm text-foreground-secondary">
              접수된 상담 문의를 확인하고 처리 상태를 관리합니다.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadInquiries()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground-secondary transition-colors hover:text-foreground"
              >
                <RefreshCcw size={14} aria-hidden />
                새로고침
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground-secondary transition-colors hover:text-foreground"
              >
                <LogOut size={14} aria-hidden />
                로그아웃
              </button>
            </div>
          )}
        </header>

        <main className="mt-8">
          {!authReady ? (
            <p className="flex items-center gap-2 text-sm text-foreground-tertiary">
              <Loader2 size={15} className="animate-spin" aria-hidden />
              불러오는 중…
            </p>
          ) : !user ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-12 text-center">
              <p className="text-sm text-foreground-secondary">
                관리자 전용 페이지입니다. Google 계정으로 로그인해 주세요.
              </p>
              <button
                type="button"
                onClick={() => void signIn()}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                <LogIn size={16} aria-hidden />
                Google로 로그인
              </button>
              {authError && (
                <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive" role="alert">
                  로그인 오류: {authError}
                </p>
              )}
            </div>
          ) : loadState === "loading" ? (
            <p className="flex items-center gap-2 text-sm text-foreground-tertiary">
              <Loader2 size={15} className="animate-spin" aria-hidden />
              문의를 불러오는 중…
            </p>
          ) : loadState === "denied" ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-12 text-center">
              <ShieldAlert size={28} className="text-warning" aria-hidden />
              <p className="text-sm text-foreground-secondary">
                이 계정({user.email})은 열람 권한이 없습니다.
              </p>
            </div>
          ) : loadState === "error" ? (
            <p className="text-sm text-destructive">
              문의를 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.
            </p>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-12 text-center">
              <Inbox size={28} className="text-foreground-tertiary" aria-hidden />
              <p className="text-sm text-foreground-secondary">아직 접수된 문의가 없습니다.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {inquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="rounded-3xl border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {inquiry.name || "(이름 없음)"}
                        <span className="ml-2 text-sm font-normal text-foreground-secondary">
                          {inquiry.contact}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-tertiary">
                        {formatDateTime(inquiry.createdAt)}
                        {inquiry.need && ` · ${inquiry.need}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(inquiry)}
                      className={
                        inquiry.status === "new"
                          ? "inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
                          : "inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3.5 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/25"
                      }
                    >
                      <CheckCircle2 size={13} aria-hidden />
                      {inquiry.status === "new" ? "신규" : "처리 완료"}
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground-secondary">
                    {inquiry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
