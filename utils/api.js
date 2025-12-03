import axios from "axios";

const instance = axios.create({
  // 기본값은 Render 배포 백엔드 URL로 설정
  // 로컬 개발 시에는 NEXT_PUBLIC_API_URL 환경 변수로 오버라이드 가능 (예: http://localhost:5001/api)
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://todolist-back-fohi.onrender.com",
  withCredentials: true,
});

export default instance;

