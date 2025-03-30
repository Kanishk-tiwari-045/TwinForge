
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const taskData: { [key: string]: string[] } = {
  '2025-03-30': ['Review PRs for feature X', 'Deploy backend service to production'],
  '2025-04-01': ['Update API documentation', 'Test integration with new auth provider'],
  '2025-04-05': ['Debug database migration issue', 'Finalize UI changes for dashboard'],
  '2025-04-10': ['Write unit tests for API endpoints', 'Refactor frontend code'],
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get the current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Get the number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the number of days in the previous month
  const daysInLastMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Generate the days of the month
  const days = [];

  // Add days from previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({
      day: daysInLastMonth - firstDayOfMonth + i + 1,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, daysInLastMonth - firstDayOfMonth + i + 1),
    });
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    days.push({
      day: i,
      isCurrentMonth: true,
      date,
      isToday: date.toDateString() === new Date().toDateString(),
      isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
    });
  }

  // Add days from next month to fill the grid
  const totalDays = days.length;
  const remainingDays = 42 - totalDays; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i),
    });
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Format month and year for display
  const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Format day names for header
  const dayNameFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  });

  const dayNames = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2023, 0, i + 1); // Any Sunday-starting week
    dayNames.push(dayNameFormatter.format(date));
  }

  // Get tasks for the selected date
  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return taskData[dateString] || [];
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium">{monthYearFormatter.format(currentDate)}</span>
          <button
            onClick={nextMonth}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-gray-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
            className={`h-12 rounded-lg flex items-center justify-center transition-colors
              ${day.isCurrentMonth ? 'hover:bg-gray-700/50' : 'text-gray-500'}
              ${day.isToday ? 'border border-blue-500' : ''}
              ${day.isSelected ? 'bg-blue-600 text-white' : ''}
              ${!day.isCurrentMonth ? 'opacity-50 cursor-default' : 'cursor-pointer'}
            `}
          >
            <span className={`${day.isToday && !day.isSelected ? 'text-blue-400' : ''}`}>
              {day.day}
            </span>
          </button>
        ))}
      </div>

      {/* Selected date details with tasks */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
          <h4 className="text-lg font-medium text-white mb-2">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h4>
          <div className="space-y-2">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map((task, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-gray-300"
                >
                  {task}
                </div>
              ))
            ) : (
              <div className="text-gray-400">No events scheduled</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
