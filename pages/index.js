import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import Header from "@/components/Layout/Header";
import WeeklyCalendar from "@/components/Calendar/WeeklyCalendar";
import TodoList from "@/components/Todo/TodoList";
import axios from "@/utils/api";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'completed', 'active'

  // 초기 로드: 서버에서 Todo 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("/todos");
        if (response.status === 200 && response.data && response.data.data) {
          setTodos(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    };

    fetchTodos();
  }, []);

  // Todo 추가 (서버에서 생성된 todo 객체를 그대로 사용)
  const handleAddTodo = useCallback((newTodo) => {
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  // Todo 토글 (백엔드와 동기화)
  const handleToggleTodo = useCallback(
    async (id) => {
      // 낙관적 업데이트: 먼저 UI를 토글해 주고, 실패 시 롤백
      const prevTodos = todos;
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));

      try {
        const response = await axios.patch(`/todos/${id}/toggle`);
        const updated = response.data?.data;

        if (updated) {
          setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
        }
      } catch (error) {
        console.error("Failed to toggle todo:", error);
        // 실패 시 이전 상태로 복구
        setTodos(prevTodos);
      }
    },
    [todos]
  );

  // Todo 삭제 (백엔드와 동기화)
  const handleDeleteTodo = useCallback(
    async (id) => {
      if (!confirm("🦡 Are you sure you want to delete this task?")) return;

      const prevTodos = todos;
      // 낙관적 삭제
      setTodos((prev) => prev.filter((todo) => todo.id !== id));

      try {
        await axios.delete(`/todos/${id}`);
      } catch (error) {
        console.error("Failed to delete todo:", error);
        // 실패 시 복구
        setTodos(prevTodos);
      }
    },
    [todos]
  );

  // Todo 순서 변경
  const handleReorderTodos = useCallback((newTodos) => {
    setTodos(newTodos);
  }, []);

  // Subtask 추가 (백엔드와 동기화)
  const handleAddSubtask = useCallback(
    async (todoId, subtaskTitle) => {
      const prevTodos = todos;

      // 낙관적 추가: 임시 ID를 사용
      const tempId = Date.now();
      const optimisticSubtask = { id: tempId, title: subtaskTitle, completed: false };

      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === todoId) {
            return {
              ...todo,
              subtasks: [...(todo.subtasks || []), optimisticSubtask],
            };
          }
          return todo;
        })
      );

      try {
        const response = await axios.post("/subtasks", { todoId, title: subtaskTitle });
        const newSubtask = response.data?.data;

        if (!newSubtask) return;

        // 서버에서 온 실제 subtask로 교체
        setTodos((prev) =>
          prev.map((todo) => {
            if (todo.id === todoId) {
              return {
                ...todo,
                subtasks: todo.subtasks.map((subtask) => (subtask.id === tempId ? newSubtask : subtask)),
              };
            }
            return todo;
          })
        );
      } catch (error) {
        console.error("Failed to add subtask:", error);
        // 실패 시 복구
        setTodos(prevTodos);
      }
    },
    [todos]
  );

  // Subtask 토글 (백엔드와 동기화)
  const handleToggleSubtask = useCallback(
    async (todoId, subtaskId) => {
      const prevTodos = todos;

      // 낙관적 토글
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === todoId) {
            return {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
              ),
            };
          }
          return todo;
        })
      );

      try {
        const response = await axios.patch(`/subtasks/${subtaskId}/toggle`);
        const updatedSubtask = response.data?.data;

        if (!updatedSubtask) return;

        setTodos((prev) =>
          prev.map((todo) => {
            if (todo.id === todoId) {
              return {
                ...todo,
                subtasks: todo.subtasks.map((subtask) => (subtask.id === subtaskId ? updatedSubtask : subtask)),
              };
            }
            return todo;
          })
        );
      } catch (error) {
        console.error("Failed to toggle subtask:", error);
        // 실패 시 복구
        setTodos(prevTodos);
      }
    },
    [todos]
  );

  // Subtask 삭제 (백엔드와 동기화)
  const handleDeleteSubtask = useCallback(
    async (todoId, subtaskId) => {
      const prevTodos = todos;

      // 낙관적 삭제
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === todoId) {
            return {
              ...todo,
              subtasks: todo.subtasks.filter((subtask) => subtask.id !== subtaskId),
            };
          }
          return todo;
        })
      );

      try {
        await axios.delete(`/subtasks/${subtaskId}`);
      } catch (error) {
        console.error("Failed to delete subtask:", error);
        // 실패 시 복구
        setTodos(prevTodos);
      }
    },
    [todos]
  );

  // 날짜 선택
  const handleDateSelect = useCallback(
    (date) => {
      setSelectedDate((prev) => (prev === date ? null : date));
    },
    []
  );

  // 필터링된 Todos
  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // 날짜 필터: 날짜가 선택되어 있다면 항상 해당 날짜의 할 일만 보기
    if (selectedDate) {
      filtered = filtered.filter((todo) => dayjs(todo.date).isSame(selectedDate, "day"));
    }

    // 완료 상태 필터
    if (filter === "completed") {
      filtered = filtered.filter((todo) => todo.completed);
    } else if (filter === "active") {
      filtered = filtered.filter((todo) => !todo.completed);
    }

    return filtered;
  }, [todos, selectedDate, filter]);

  // 필터 버튼에 표시할 카운트 (선택된 날짜가 있으면 해당 날짜 기준, 없으면 전체 기준)
  const { allCount, activeCount, completedCount } = useMemo(() => {
    const todosForCount = selectedDate ? todos.filter((todo) => dayjs(todo.date).isSame(selectedDate, "day")) : todos;
    const all = todosForCount.length;
    const active = todosForCount.filter((t) => !t.completed).length;
    const completed = todosForCount.filter((t) => t.completed).length;

    return { allCount: all, activeCount: active, completedCount: completed };
  }, [todos, selectedDate]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <Header />

        <WeeklyCalendar todos={todos} onDateSelect={handleDateSelect} selectedDate={selectedDate} />

        {/* 필터 버튼 */}
        <div className="hufflepuff-card p-4 mb-6 flex gap-3 justify-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === "all" ? "bg-hufflepuff-gold text-hufflepuff-black" : "bg-white dark:bg-hufflepuff-gray text-hufflepuff-gray dark:text-badger-cream hover:bg-hufflepuff-light"
            }`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === "active" ? "bg-hufflepuff-gold text-hufflepuff-black" : "bg-white dark:bg-hufflepuff-gray text-hufflepuff-gray dark:text-badger-cream hover:bg-hufflepuff-light"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === "completed" ? "bg-hufflepuff-gold text-hufflepuff-black" : "bg-white dark:bg-hufflepuff-gray text-hufflepuff-gray dark:text-badger-cream hover:bg-hufflepuff-light"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {selectedDate && (
          <div className="mb-4 flex items-center justify-between hufflepuff-card p-3">
            <span className="font-semibold text-hufflepuff-gold dark:text-hufflepuff-yellow">📅 Showing tasks for {dayjs(selectedDate).format("MMMM DD, YYYY")}</span>
            <button onClick={() => setSelectedDate(null)} className="text-sm text-hufflepuff-gray dark:text-badger-cream hover:text-hufflepuff-black dark:hover:text-hufflepuff-light">
              Clear filter
            </button>
          </div>
        )}

        <TodoList
          todos={filteredTodos}
          selectedDate={selectedDate}
          onReorder={handleReorderTodos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onAddTodo={handleAddTodo}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
        />
      </div>
    </div>
  );
}
