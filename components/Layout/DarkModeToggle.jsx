import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // LocalStorage에서 테마 불러오기
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    // 초기 테마는 DOM을 기준으로만 설정하고, React state는 DOM 클래스에 맞춰 동기화
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hufflepuff-gold dark:bg-hufflepuff-yellow text-hufflepuff-black hover:opacity-80 transition-opacity"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <>
          <Sun size={20} />
          <span className="font-semibold">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={20} />
          <span className="font-semibold">Dark Mode</span>
        </>
      )}
    </button>
  );
}
