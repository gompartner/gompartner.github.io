import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

// 클라이언트 공개 식별자 — 비밀 아님. 실제 접근 제어는 Firestore 보안 규칙이 담당한다.
const firebaseConfig = {
  apiKey: "AIzaSyBLdH69WuW2uM2MLqb8Obx0ISGSdm8M3BY",
  authDomain: "gompartner-97ba0.firebaseapp.com",
  projectId: "gompartner-97ba0",
  storageBucket: "gompartner-97ba0.firebasestorage.app",
  messagingSenderId: "32445098330",
  appId: "1:32445098330:web:6ebc07fbb794e0116dab63",
  measurementId: "G-3HTKE4V4JM",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** 문의 저장 컬렉션 이름 */
export const INQUIRIES_COLLECTION = "inquiries";
