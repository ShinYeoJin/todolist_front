import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import dayjs from "dayjs";
import axios from "../../utils/api";

export default function TodoForm({ onAddTodo, selectedDate }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(selectedDate || dayjs().format("YYYY-MM-DD"));

  // 상위에서 날짜를 선택/변경했을 때 입력 필드도 함께 따라가도록 동기화
  useEffect(() => {
    if (!selectedDate) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(selectedDate);
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task!");
      return;
    }

    try {
      const response = await axios.post("/todos", { title: title.trim(), date });
      onAddTodo(response.data.data);
      setTitle("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hufflepuff-card p-4 mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done, fellow Hufflepuff?"
          className="flex-1 px-4 py-3 rounded-lg border-2 border-hufflepuff-gold dark:border-hufflepuff-yellow bg-white dark:bg-hufflepuff-gray text-hufflepuff-black dark:text-hufflepuff-light focus:outline-none focus:ring-2 focus:ring-hufflepuff-yellow"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-3 rounded-lg border-2 border-hufflepuff-gold dark:border-hufflepuff-yellow bg-white dark:bg-hufflepuff-gray text-hufflepuff-black dark:text-hufflepuff-light focus:outline-none focus:ring-2 focus:ring-hufflepuff-yellow"
        />

        <button type="submit" className="hufflepuff-btn flex items-center gap-2">
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>
    </form>
  );
}
