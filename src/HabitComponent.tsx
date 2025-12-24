import React from 'react';
import type { Habit } from './Habit';

interface HabitComponentProps {
  habit: Habit;
  onDelete?: (id: number) => void;
  onToggle?: (id: number) => void;
}

const HabitComponent: React.FC<HabitComponentProps> = ({ habit, onDelete, onToggle }) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={habit.completed}
        onChange={() => onToggle?.(habit.id)}
      />
      {habit.name}
      <button onClick={() => onDelete?.(habit.id)}>Delete</button>
    </li>
  );
};

export { HabitComponent };