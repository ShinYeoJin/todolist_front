import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import axios from "../../utils/api";

export default function TodoList({ todos, selectedDate, onReorder, onToggle, onDelete, onAddTodo, onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTodo = (newTodo) => {
    onAddTodo(newTodo);
  };

  const handleReorder = async (newTodos) => {
    try {
      onReorder(newTodos);
      await axios.patch("/todos/reorder/positions", { positions: newTodos.map((todo, index) => ({ id: todo.id, position: index })) });
    } catch (error) {
      console.error("Failed to update positions:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);
    const newTodos = arrayMove(todos, oldIndex, newIndex);
    handleReorder(newTodos);
  };

  return (
    <div>
      <TodoForm onAddTodo={handleAddTodo} selectedDate={selectedDate} />
      <div>
        {todos.length === 0 ? (
          <div className="hufflepuff-card p-12 text-center">
            <p className="text-2xl font-potter text-hufflepuff-gray dark:text-badger-cream">🦡 No tasks yet! Time to get productive!</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={(id) => onToggle(id)}
                  onDelete={(id) => onDelete(id)}
                  onAddSubtask={(id, title) => onAddSubtask(id, title)}
                  onToggleSubtask={(todoId, subtaskId) => onToggleSubtask(todoId, subtaskId)}
                  onDeleteSubtask={(todoId, subtaskId) => onDeleteSubtask(todoId, subtaskId)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
