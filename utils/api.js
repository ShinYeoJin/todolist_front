import axios from "axios";

const instance = axios.create({
  // 개발 환경에서는 백엔드를 5001 포트에서 띄우도록 맞춤
  // (prod 또는 .env 설정 시 NEXT_PUBLIC_API_URL 을 사용)
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

export default instance;
