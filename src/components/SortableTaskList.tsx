import { useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { updateTasksOrder, isTaskCompletedToday } from '@/lib/taskStorage';

interface SortableTaskListProps {
  tasks: Task[];
  date: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onReorder: (tasks: Task[]) => void;
}

export const SortableTaskList = ({
  tasks,
  date,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
}: SortableTaskListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter(t => !isTaskCompletedToday(t, date));
  const completedTasks = tasks.filter(t => isTaskCompletedToday(t, date));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = incompleteTasks.findIndex(t => t.id === active.id);
      const newIndex = incompleteTasks.findIndex(t => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIncompleteTasks = arrayMove(incompleteTasks, oldIndex, newIndex);
        
        // Update sort orders
        const taskOrders = newIncompleteTasks.map((task, index) => ({
          id: task.id,
          sortOrder: index,
        }));

        // Update local state
        const updatedTasks = [
          ...newIncompleteTasks.map((t, i) => ({ ...t, sortOrder: i })),
          ...completedTasks,
        ];
        onReorder(updatedTasks);

        // Persist to database
        await updateTasksOrder(taskOrders);
      }
    }
  }, [incompleteTasks, completedTasks, onReorder]);

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(event.active.id as string);
  }, []);

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={incompleteTasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {incompleteTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              date={date}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isDragging={activeId === task.id}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Completed tasks - fixed at bottom, not draggable */}
      {completedTasks.length > 0 && (
        <div className="border-t border-border/50 pt-3 mt-3">
          <p className="text-xs text-muted-foreground mb-2">Completed</p>
          {completedTasks.map(task => (
            <div key={task.id} className="mb-3">
              <TaskCard
                task={task}
                date={date}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
