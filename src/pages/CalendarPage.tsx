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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background py-10 px-2">
      <div className="w-full max-w-3xl flex flex-col items-center mb-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-primary font-semibold mb-4 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
      </div>
      <div className="max-w-3xl w-full bg-card/90 rounded-3xl shadow-xl p-8 border-2 border-primary flex flex-col items-center">
        <div className="flex items-center justify-between mb-6 w-full">
          <div className="flex items-center gap-3 text-3xl font-extrabold text-primary drop-shadow-md">
            <Calendar className="w-8 h-8" /> Calendar
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="rounded-lg px-3 py-1 bg-primary/10 text-primary font-semibold"
            >
              Prev
            </button>
            <div className="font-bold text-lg">
              {monthName} {year}
            </div>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="rounded-lg px-3 py-1 bg-primary/10 text-primary font-semibold"
            >
              Next
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4 text-center font-semibold text-fuchsia-700 w-full">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 w-full">
          {Array(days[0].getDay())
            .fill(0)
            .map((_, i) => (
              <div key={i}></div>
            ))}
          {days.map((day) => {
            const dateStr = day.toISOString().slice(0, 10);
            const dayEvents = events.filter((e) => e.date === dateStr);
            return (
              <div
                key={dateStr}
                className="relative group bg-gradient-to-br from-card to-card/80 rounded-xl border border-fuchsia-100 shadow hover:shadow-lg transition-all p-2 min-h-[70px] flex flex-col items-center"
              >
                <div className="font-bold text-lg text-fuchsia-700">
                  {day.getDate()}
                </div>
                {/* Show birthday events as name + Birthday, not just a button */}
                {dayEvents
                  .filter((e) => e.type === "birthday")
                  .map((e, idx) => (
                    <div
                      key={idx}
                      className="mt-1 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-pink-200 text-pink-800 cursor-pointer hover:bg-pink-300"
                      onClick={() => setSelectedEvent(e)}
                    >
                      <User className="w-3 h-3" />
                      <span>{e.name}'s Birthday</span>
                    </div>
                  ))}
                {/* Show custom events as before */}
                {dayEvents
                  .filter((e) => e.type !== "birthday")
                  .map((e, idx) => (
                    <button
                      key={idx}
                      className="mt-1 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-indigo-100 text-indigo-700"
                      onClick={() => setSelectedEvent(e)}
                    >
                      <Plus className="w-3 h-3" />
                      {e.title}
                    </button>
                  ))}
                <button
                  className="absolute bottom-1 right-1 text-fuchsia-400 hover:text-fuchsia-700"
                  onClick={() => addEvent(dateStr)}
                  title="Add event"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {/* Event Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-primary flex flex-col items-center">
            <div className="text-2xl font-bold mb-2 flex items-center gap-2">
              {selectedEvent.type === "birthday" ? (
                <User className="w-6 h-6 text-pink-500" />
              ) : (
                <Plus className="w-6 h-6 text-indigo-500" />
              )}
              {selectedEvent.type === "birthday"
                ? `${selectedEvent.name}'s Birthday`
                : selectedEvent.title}
            </div>
            <div className="mb-4 text-muted-foreground">
              {selectedEvent.date}
            </div>
            {selectedEvent.type === "birthday" && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-semibold shadow hover:scale-105 transition-all"
                onClick={() => navigate(`/gift?user=${selectedEvent.id}`)}
              >
                <Gift className="w-5 h-5" /> Generate Gift Ideas
              </button>
            )}
            <button
              className="mt-6 text-primary underline"
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
