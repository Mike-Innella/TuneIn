import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Music, Music2, Music3, Music4, Volume2, Radio } from "lucide-react";

export default function Hero() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const handleStart = () => {
    if (session) nav("/app");
    else nav("/auth");
  };

  const floatingIcons = [
    { Icon: Music, delay: 0, duration: 8, x: "10%", y: "20%", moveX: 30, moveY: 20 },
    { Icon: Music2, delay: 1, duration: 10, x: "85%", y: "15%", moveX: -25, moveY: 35 },
    { Icon: Music3, delay: 2, duration: 9, x: "15%", y: "70%", moveX: 40, moveY: -30 },
    { Icon: Music4, delay: 3, duration: 11, x: "80%", y: "75%", moveX: -35, moveY: -25 },
    { Icon: Volume2, delay: 4, duration: 7, x: "20%", y: "40%", moveX: 25, moveY: 40 },
    { Icon: Radio, delay: 5, duration: 12, x: "75%", y: "45%", moveX: -30, moveY: 30 },
    { Icon: Music, delay: 6, duration: 9, x: "5%", y: "60%", moveX: 35, moveY: -20 },
    { Icon: Music2, delay: 7, duration: 11, x: "90%", y: "30%", moveX: -40, moveY: 25 },
    { Icon: Music3, delay: 8, duration: 8, x: "25%", y: "10%", moveX: 20, moveY: 45 },
    { Icon: Music4, delay: 9, duration: 10, x: "70%", y: "85%", moveX: -25, moveY: -35 },
    { Icon: Volume2, delay: 10, duration: 7, x: "8%", y: "35%", moveX: 45, moveY: 15 },
    { Icon: Radio, delay: 11, duration: 12, x: "88%", y: "60%", moveX: -20, moveY: -40 },
  ];

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white overflow-hidden">
      {/* Floating Music Icons */}
      {floatingIcons.map(({ Icon, delay, duration, x, y, moveX, moveY }, index) => (
        <div
          key={index}
          className="absolute pointer-events-none opacity-15"
          style={{
            left: x,
            top: y,
            animation: `float-${index} ${duration}s ease-in-out ${delay}s infinite alternate`,
          }}
        >
          <Icon className="w-6 h-6 text-[#7dd3fc]/50" />
          <style key={`style-${index}`}>{`
            @keyframes float-${index} {
              0% {
                transform: translate(0px, 0px) rotate(0deg);
                opacity: 0.15;
              }
              50% {
                opacity: 0.25;
              }
              100% {
                transform: translate(${moveX}px, ${moveY}px) rotate(${moveX > 0 ? 5 : -5}deg);
                opacity: 0.15;
              }
            }
          `}</style>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to <span className="text-[#7dd3fc] font-cursive">TuneIn</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-6">
          Music that keeps you in flow—pick a mood, set a timer, and focus.
        </p>

        <ul className="text-gray-300/90 space-y-2 mb-10">
          <li>• <span className="font-semibold">Choose a Mood</span>: Calm, Deep Work, Lo-Fi, or Custom.</li>
          <li>• <span className="font-semibold">Set a Timer</span>: Session length or Pomodoro blocks.</li>
          <li>• <span className="font-semibold">Press Play</span>: We'll handle breaks and progress.</li>
        </ul>

        <button
          onClick={handleStart}
          className="px-8 py-4 bg-[#7dd3fc] text-black font-semibold rounded-xl shadow-lg hover:bg-[#38bdf8] transition-all"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}