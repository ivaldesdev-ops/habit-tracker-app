import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Habit } from './Habit';
import { HabitComponent } from './HabitComponent.tsx';
import './App.css';

const App = () => {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  const loadHabits = (profile: string): Habit[] => {
    const stored = localStorage.getItem(`habits_${profile}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((h: any) => ({
        ...h,
        completedDates: h.completedDates.map((d: string) => new Date(d))
      }));
    }
    return [];
  };

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showStreaks, setShowStreaks] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setHabits(loadHabits(currentProfile));
    }
  }, [currentProfile]);

  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem(`habits_${currentProfile}`, JSON.stringify(habits));
    }
  }, [habits, currentProfile]);

  const createProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim() && !profiles.includes(newProfileName.trim())) {
      const name = newProfileName.trim();
      const newProfiles = [...profiles, name];
      setProfiles(newProfiles);
      localStorage.setItem('profiles', JSON.stringify(newProfiles));
      setCurrentProfile(name);
      setNewProfileName('');
    }
  };

  const selectProfile = (profile: string) => {
    setCurrentProfile(profile);
  };

  const switchProfile = () => {
    setCurrentProfile(null);
    setHabits([]);
    setShowStreaks(false);
  };

  if (!currentProfile) {
    return (
      <div className="app">
        <h1>Habit Tracker</h1>
        <h2>Welcome! Create or Select a Profile</h2>
        {profiles.length > 0 && (
          <div>
            <h3>Select Existing Profile</h3>
            <ul>
              {profiles.map((profile) => (
                <li key={profile}>
                  <button onClick={() => selectProfile(profile)}>{profile}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <form className="add-form" onSubmit={createProfile}>
          <label htmlFor="profile-name">Create New Profile:</label>
          <input
            type="text"
            id="profile-name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Enter profile name"
          />
          <button type="submit">Create Profile</button>
        </form>
      </div>
    );
  }

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      setHabits([...habits, { id: Date.now(), name: newHabitName.trim(), completed: false, completedDates: [] }]);
      setNewHabitName('');
    }
  };
  const deleteHabit = (id: number) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };
  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hasToday = habit.completedDates.some(d => d.getTime() === today.getTime());
        let newDates = [...habit.completedDates];
        if (hasToday) {
          newDates = newDates.filter(d => d.getTime() !== today.getTime());
        } else {
          newDates.push(today);
        }
        return { ...habit, completed: !hasToday, completedDates: newDates };
      }
      return habit;
    }));
  };

  const getCurrentStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0;
    const sorted = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    for (let date of sorted) {
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === current.getTime()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else if (date.getTime() < current.getTime()) {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="app">
      <h1>Habit Tracker - {currentProfile}</h1>
      <button className="streaks-btn" onClick={switchProfile}>Switch Profile</button>
      <ul className="habit-list">
        {habits.map((habit) => (
          <HabitComponent key={habit.id} habit={habit} onDelete={deleteHabit} onToggle={toggleHabit} />
        ))}
      </ul>

      <form className="add-form" onSubmit={addHabit}>
        <label htmlFor="new-habit">Add a new habit:</label>
        <input 
          type="text" 
          id="new-habit" 
          value={newHabitName} 
          onChange={(e) => setNewHabitName(e.target.value)} 
        />
        <button type="submit">Add Habit</button>
      </form>

      <button className="streaks-btn" onClick={() => setShowStreaks(!showStreaks)}>
        {showStreaks ? 'Hide Streaks' : 'Show Streaks'}
      </button>
      {showStreaks && (
        <div className="streaks">
          <h2>Current Streaks</h2>
          <ul>
            {habits.map((habit) => (
              <li key={habit.id}>{habit.name}: {getCurrentStreak(habit.completedDates)} days</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;