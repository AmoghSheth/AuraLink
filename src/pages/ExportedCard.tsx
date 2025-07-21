import { useParams, Link } from "react-router-dom";

const gradient = "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500";

export default function ExportedCard() {
  const { id } = useParams();
  const cards = JSON.parse(localStorage.getItem("generated_cards") || "[]");
  const card = cards.find((c: any) => c.id === id);

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-2xl font-bold mb-4">Card Not Found</div>
        <Link to="/dashboard" className="text-primary underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${gradient} px-4 py-12`}
    >
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center md:items-stretch bg-white/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
        {/* Left: Card Info */}
        <div className="flex-1 flex flex-col justify-center p-10 md:p-16 gap-4">
          <div className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-2">
            {card.fullName}
          </div>
          <div className="text-lg text-indigo-700 font-semibold mb-2">
            {card.location}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {card.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-gradient-to-r from-pink-200 via-fuchsia-200 to-indigo-200 text-fuchsia-700 font-semibold px-4 py-2 rounded-full text-base shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="italic text-xl text-gray-700 mb-4 drop-shadow-sm">
            {card.bio}
          </div>
          <div className="grid grid-cols-2 gap-2 text-base text-gray-700 mb-2">
            {card.birthday && (
              <div>
                <b>Birthday:</b> {card.birthday}
              </div>
            )}
            {card.allergies && (
              <div>
                <b>Allergies:</b> {card.allergies}
              </div>
            )}
            {card.facts && (
              <div>
                <b>Facts:</b> {card.facts}
              </div>
            )}
            {card.hobbies && (
              <div>
                <b>Hobbies:</b> {card.hobbies}
              </div>
            )}
            {card.food && (
              <div>
                <b>Food:</b> {card.food}
              </div>
            )}
            {card.favorites && (
              <div>
                <b>Favorites:</b> {card.favorites}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-4 text-base text-gray-800">
            <span>
              <b>Email:</b> {card.email}
            </span>
            {card.phone && (
              <span>
                <b>Phone:</b> {card.phone}
              </span>
            )}
            {card.social && (
              <span>
                <b>Social:</b> {card.social}
              </span>
            )}
          </div>
        </div>
        {/* Right: Visual Accent */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-white/0 to-indigo-100 px-12 py-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-400 to-indigo-400 shadow-2xl flex items-center justify-center">
            <span className="text-6xl font-extrabold text-white drop-shadow-xl">
              ✨
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
