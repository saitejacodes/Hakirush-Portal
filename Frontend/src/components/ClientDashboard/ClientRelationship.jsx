import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

import {
  Handshake,
  Target,
  CalendarDays,
  LineChart,
  Rocket,
  ClipboardList,
  Star,
  MessageCircleMore,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const ClientRelationship = () => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

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
        alert("Failed to load client relationship plan");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        Loading relationship plan…
      </div>
    );

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        Client not found for this login
      </div>
    );

  const plan = client.planType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ================= HERO HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl p-8 shadow-2xl text-white
          bg-gradient-to-r from-red-700 via-red-600 to-orange-500">

          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />

          <Handshake size={56} className="relative mb-4" />

          <h1 className="relative text-3xl sm:text-4xl font-extrabold tracking-tight">
            Client Relationship Program
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

        {/* ================= PLAN CONTENT ================= */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-red-100 p-6 sm:p-8">
          {plan === "annual" ? <AnnualPlan /> : <QuarterlyPlan />}
        </div>

      </div>
    </div>
  );
};

export default ClientRelationship;

/* ============================================================
                        ANNUAL PLAN
============================================================ */

const AnnualPlan = () => (
  <div className="space-y-8">

    {/* SNAPSHOT */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InfoCard
        icon={<CalendarDays />}
        title="Engagement Period"
        text="Full Annual Partnership"
      />
      <InfoCard
        icon={<LineChart />}
        title="Engagement Level"
        text="Strategic Partner"
      />
      <InfoCard
        icon={<Star />}
        title="Success Focus"
        text="Long-term Growth"
      />
    </div>

    <SectionTitle text="Annual Partnership Objectives" />

    <ListCard
      items={[
        "Strengthen strategic collaboration",
        "Improve service delivery and support",
        "Drive long-term innovation initiatives",
        "Annual wellness & sports engagement programs",
        "Increase employee participation & happiness",
      ]}
    />

    <CTA />
  </div>
);

/* ============================================================
                      QUARTERLY PLAN
============================================================ */

const QuarterlyPlan = () => (
  <div className="space-y-6">

    <SectionTitle text="Quarter-wise Relationship Strategy" />

    <Roadmap
      quarter="Q1 – Onboarding & Kickoff"
      points={[
        "Requirement workshops",
        "Governance setup",
        "Process mapping",
      ]}
    />

    <Roadmap
      quarter="Q2 – Engagement & Adoption"
      points={[
        "Employee engagement activities",
        "Quarterly sports activities",
        "Performance review",
      ]}
    />

    <Roadmap
      quarter="Q3 – Optimization"
      points={[
        "ROI tracking",
        "Wellness outcome measurement",
        "Engagement scaling",
      ]}
    />

    <Roadmap
      quarter="Q4 – Renewal & Growth"
      points={[
        "Renewal strategy",
        "Future roadmap",
        "Leadership review meeting",
      ]}
    />

    <CTA />
  </div>
);

/* ============================================================
                    REUSABLE COMPONENTS
============================================================ */

const SectionTitle = ({ text }) => (
  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6">
    {text}
  </h2>
);

const InfoCard = ({ icon, title, text }) => (
  <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl
    shadow-xl border border-red-100 p-6 text-center space-y-2">

    <div className="flex justify-center text-red-600">{icon}</div>

    <h3 className="font-bold text-lg text-gray-800">{title}</h3>

    <p className="text-gray-600 text-sm">{text}</p>
  </div>
);

const ListCard = ({ items }) => (
  <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl
    shadow-xl border border-red-100 p-6 space-y-3">

    {items.map((it, i) => (
      <p key={i} className="flex gap-2 items-center text-gray-700 text-sm">
        <CheckCircle2 className="text-red-600" size={16} />
        {it}
      </p>
    ))}
  </div>
);

const Roadmap = ({ quarter, points }) => (
  <div className="bg-gradient-to-br from-white to-red-50
    rounded-2xl shadow-xl border border-red-100 p-5">

    <p className="font-bold text-red-700">{quarter}</p>

    <ul className="mt-2 space-y-1 text-sm text-gray-700">
      {points.map((p, i) => (
        <li key={i} className="flex gap-2">
          <ClipboardList size={14} className="text-red-500 mt-0.5" />
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const CTA = () => (
  <div className="text-center bg-gradient-to-br from-white to-red-50
    border border-red-100 rounded-3xl shadow-xl p-8 space-y-3 mt-6">

    <Rocket className="mx-auto text-red-600" size={32} />

    <h2 className="text-2xl font-bold text-red-700">
      Ready to Elevate Our Partnership?
    </h2>

    <p className="text-gray-600">
      Schedule your strategy meeting with our relationship manager.
    </p>

    <button className="mt-2 px-6 py-3 rounded-2xl bg-red-600 text-white
      font-semibold hover:bg-red-700 transition flex gap-2 mx-auto">
      Book Strategy Call <ArrowRight />
    </button>
  </div>
);
