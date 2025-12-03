/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  // 클라이언트에서만 시간 초기화 (SSR 시점과의 차이로 인한 Hydration 오류 방지)
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    // 초기 마운트 및 1초 간격 시간 갱신을 위해 effect 내부에서만 state를 업데이트
    const now = dayjs();
    setCurrentTime(now);

    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hufflepuff-header">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-['Cinzel_Decorative'] font-bold text-yellow-500 dark:text-yellow-400 mb-2">💫 Todo List 💫</h1>
          <p className="text-sm text-hufflepuff-gray dark:text-badger-cream italic">
            &quot;Hard work and dedication&quot; - Helga Hufflepuff
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="font-mono text-2xl font-bold text-hufflepuff-black dark:text-hufflepuff-yellow">
            {currentTime ? currentTime.format("HH:mm:ss") : null}
          </div>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
