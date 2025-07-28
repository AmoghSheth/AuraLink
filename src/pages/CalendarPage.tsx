import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, Gift, Plus, User, ArrowLeft } from "lucide-react";

// Mock friends data with birthdays (add more for demo)
const friends = [
  { id: '1', name: 'Sarah Johnson', birthday: '2025-07-05' },
  { id: '2', name: 'Mike Chen', birthday: '2025-07-12' },
  { id: '3', name: 'Emma Wilson', birthday: '2025-07-18' },
  { id: '4', name: 'Vaibhav Patel', birthday: '2025-07-21' },
  { id: '5', name: 'Lila Singh', birthday: '2025-07-25' },
  { id: '6', name: 'Carlos Rivera', birthday: '2025-07-29' },
];

function getMonthDays(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [customEvents, setCustomEvents] = useState<any[]>(
    JSON.parse(localStorage.getItem("custom_events") || "[]")
  );
  const navigate = useNavigate();

  const year = current.getFullYear();
  const month = current.getMonth();
  const days = getMonthDays(year, month);
  const monthName = current.toLocaleString("default", { month: "long" });

  // Gather all events for the month
  const events = [
    ...friends.map((f) => ({
      type: "birthday",
      date: f.birthday,
      name: f.name,
      id: f.id,
    })),
    ...customEvents.filter((e) =>
      e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
    ),
  ];

  function addEvent(date: string) {
    const title = prompt("Event title?");
    if (title) {
      const newEvent = { type: "custom", date, title };
      const updated = [...customEvents, newEvent];
      setCustomEvents(updated);
      localStorage.setItem("custom_events", JSON.stringify(updated));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>
      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 flex flex-col items-center">
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-500 text-sm">Manage your events and birthdays</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monthName} {year}
              </div>
            </div>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3 mb-6 w-full">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
            <div key={day} className="text-center py-4">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {day.slice(0, 3)}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3 w-full">
          {Array(days[0].getDay())
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-24"></div>
            ))}
          {days.map((day) => {
            const dateStr = day.toISOString().slice(0, 10);
            const dayEvents = events.filter((e) => e.date === dateStr);
            const isToday = new Date().toDateString() === day.toDateString();
            
            return (
              <div
                key={dateStr}
                className={`relative group bg-white rounded-2xl border-2 transition-all duration-200 p-3 min-h-[100px] flex flex-col hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                  isToday 
                    ? 'border-blue-300 bg-blue-50/50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-bold text-lg mb-2 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                {/* Show birthday events */}
                <div className="flex-1 space-y-1">
                  {dayEvents
                    .filter((e) => e.type === "birthday")
                    .map((e, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-pink-100 to-rose-100 text-rose-700 cursor-pointer hover:from-pink-200 hover:to-rose-200 transition-all duration-200 flex items-center gap-1 shadow-sm"
                        onClick={() => setSelectedEvent(e)}
                      >
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        <span className="truncate">{e.name}</span>
                      </div>
                    ))}
                  {/* Show custom events */}
                  {dayEvents
                    .filter((e) => e.type !== "birthday")
                    .map((e, idx) => (
                      <button
                        key={idx}
                        className="w-full px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 flex items-center gap-1 shadow-sm"
                        onClick={() => setSelectedEvent(e)}
                      >
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span className="truncate">{e.title}</span>
                      </button>
                    ))}
                </div>
                <button
                  className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100"
                  onClick={() => addEvent(dateStr)}
                  title="Add event"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {/* Event Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-200 flex flex-col items-center transform transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              {selectedEvent.type === "birthday" ? (
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedEvent.type === "birthday"
                    ? `${selectedEvent.name}'s Birthday`
                    : selectedEvent.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {selectedEvent.type === "birthday" && (
              <button
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 mb-4"
                onClick={() => navigate(`/gift?user=${selectedEvent.id}`)}
              >
                <Gift className="w-5 h-5" /> Generate Gift Ideas
              </button>
            )}
            
            <button
              className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
