// 회사소개서 PDF(곰파트너 구글 드라이브, 링크가 있는 사용자 뷰어). 파일을 고칠 땐 드라이브에서 "새 버전 업로드"로 올려 링크를 유지한다.
export const COMPANY_PROFILE_URL = "https://drive.google.com/file/d/1L9Ws4UKKHW4rknP55qsM9mHGeizwh8su/view";
// 소개서를 누르면 /profile 을 거쳐 열람 시각을 시트에 남기고 드라이브로 넘긴다.
export const profileLink = (id: string, from: "done" | "mail") => `/profile?id=${encodeURIComponent(id)}&from=${from}`;
