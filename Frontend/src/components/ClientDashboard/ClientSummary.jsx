import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import {
  Trophy,
  CalendarDays,
  Star,
  Flag,
  Users,
  Medal,
} from "lucide-react";

const ClientSportsPlan = () => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  /* ================= FETCH CLIENT ================= */
  useEffect(() => {
    if (!user?._id) return;

    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/client`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const found = res.data.clients.find(
          (c) => c.userId?._id === user._id
        );

        setClient(found || null);
      } catch {
        alert("Failed to load client sports plan");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [user]);

  /* ================= FETCH ANNOUNCEMENTS ================= */
  useEffect(() => {
    if (!user) return;

    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/announcements`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAnnouncements(res.data.announcements || []);
      } catch {
        console.error("Failed to load announcements");
      }
    };

    fetchAnnouncements();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        Loading sports plan…
      </div>
    );

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        Client not found for this login
      </div>
    );

  const plan = client.planType;
  const filteredAnnouncements = announcements;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-100 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HERO HEADER ================= */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 shadow-2xl text-white
          bg-gradient-to-r from-red-700 via-red-600 to-orange-500"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />

          <h1 className="relative text-3xl sm:text-4xl font-extrabold tracking-tight">
            Corporate Sports Engagement Program
          </h1>

          <div className="relative mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur">
              Plan: <span className="uppercase">{plan}</span>
            </span>
            <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur">
              Client: {client?.userId?.name}
            </span>
          </div>
        </div>

        {/* ================= ANNOUNCEMENTS ================= */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-red-100 p-6">
          <h2 className="text-xl font-bold text-red-700 mb-5 flex items-center gap-2">
            📢 Announcements
          </h2>

          {filteredAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No announcements available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAnnouncements.map((a) => (
                <div
                  key={a._id}
                  className="rounded-2xl border border-red-100 bg-gradient-to-br
                    from-white to-red-50 p-5 shadow-sm hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-800">
                    {a.title}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {a.date} • {a.venue}
                  </p>

                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold
                      ${a.status === "Upcoming" && "bg-red-100 text-red-700"}
                      ${a.status === "Ongoing" && "bg-green-100 text-green-700"}
                      ${a.status === "Completed" && "bg-gray-200 text-gray-700"}
                    `}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= PLAN ================= */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-red-100 p-6">
          {plan === "Annual" ? <AnnualPlan /> : <QuarterlyPlan />}
        </div>
      </div>
    </div>
  );
};

export default ClientSportsPlan;

/* ===================== ANNUAL PLAN ===================== */

const AnnualPlan = () => {
  const events = [
    "Corporate Cricket Premier League",
    "Annual Badminton Championship",
    "Corporate Volleyball Cup",
    "Corporate Marathon",
    "Athletics Meet",
  ];

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Trophy />} text="Annual Sports Tournament Lineup" />

      <KPIGrid />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white to-red-50
              rounded-2xl border border-red-100 shadow p-4"
          >
            {e}
          </div>
        ))}
      </div>

      <Highlight
        icon={<Flag />}
        text="Headline Event: Corporate Cricket Premier League • July 2026"
      />
    </div>
  );
};

/* ===================== QUARTERLY PLAN ===================== */

const QuarterlyPlan = () => {
  const quarters = [
    { q: "Q1", game: "Table Tennis Tournament", status: "Completed" },
    { q: "Q2", game: "Badminton Doubles League", status: "Scheduled" },
    { q: "Q3", game: "Football 5v5", status: "Planned" },
    { q: "Q4", game: "Indoor Corporate Sports Festival", status: "Upcoming" },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<CalendarDays />}
        text="Quarter-wise Sports Activity Plan"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarters.map((q) => (
          <div
            key={q.q}
            className="bg-gradient-to-br from-white to-red-50
              shadow rounded-2xl p-4 border border-red-100"
          >
            <p className="font-bold text-red-700">{q.q}</p>
            <p className="mt-1">{q.game}</p>

            <span
              className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${q.status === "Completed" && "bg-green-100 text-green-700"}
                ${q.status === "Scheduled" && "bg-blue-100 text-blue-700"}
                ${q.status === "Planned" && "bg-yellow-100 text-yellow-700"}
                ${q.status === "Upcoming" && "bg-purple-100 text-purple-700"}
              `}
            >
              {q.status}
            </span>
          </div>
        ))}
      </div>

      <Highlight
        icon={<Medal />}
        text="Quarterly tournaments ensure continuous engagement & wellness"
      />
    </div>
  );
};

/* ===================== UI SUB COMPONENTS ===================== */

const SectionTitle = ({ icon, text }) => (
  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-4">
    <span className="text-red-600">{icon}</span>
    {text}
  </h2>
);

const Highlight = ({ icon, text }) => (
  <div className="bg-green-50 rounded-2xl border border-green-200 p-5 flex items-center gap-3">
    <span className="text-green-600">{icon}</span>
    <p className="text-green-800 font-semibold">{text}</p>
  </div>
);

const KPIGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <KPI icon={<Users />} label="Expected Participants" value="500+" />
    <KPI icon={<Trophy />} label="Major Championships" value="5" />
    <KPI icon={<Star />} label="Awards & Medals" value="25+" />
  </div>
);

const KPI = ({ icon, label, value }) => (
  <div className="rounded-2xl shadow-xl bg-gradient-to-br from-white to-red-50 border border-red-100 p-6">
    <p className="text-gray-600 text-sm">{label}</p>
    <div className="flex justify-between items-center mt-2">
      <span className="text-3xl font-black text-red-600">{value}</span>
      <span className="text-red-500">{icon}</span>
    </div>
  </div>
);
