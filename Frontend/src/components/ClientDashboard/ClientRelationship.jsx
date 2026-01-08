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

  // fetch client for logged in user
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

        // find client linked to this user
        const found = res.data.clients.find(
          (c) => c.userId?._id === user._id
        );

        setClient(found || null);
      } catch (err) {
        console.error(err);
        alert("Failed to load client relationship plan");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [user]);

  // -------------------- UI STATES --------------------

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading relationship plan…
      </div>
    );

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Client not found for this login
      </div>
    );

  const plan = client.planType; // annual | quarterly

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <Handshake size={60} className="mx-auto text-red-600" />
          <h1 className="text-4xl font-extrabold text-red-700">
            Client Relationship Program
          </h1>

          <p className="text-gray-600">
            Plan Type:
            <span className="font-bold uppercase text-red-700"> {plan}</span>
          </p>

          <p className="text-gray-600">
            Client: {client?.userId?.name} • Budget ₹{client?.budget}
          </p>
        </div>

        {/* CONDITIONAL RENDER */}
        {plan === "annual" ? <AnnualPlan /> : <QuarterlyPlan />}

      </div>
    </div>
  );
};

export default ClientRelationship;

/* ============================================================
                        ANNUAL PLAN VIEW
============================================================ */

const AnnualPlan = () => (
  <>
    {/* SNAPSHOT */}
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InfoCard
        icon={<CalendarDays className="text-red-600" />}
        title="Engagement Period"
        text="Full Annual Partnership"
      />

      <InfoCard
        icon={<LineChart className="text-red-600" />}
        title="Engagement Level"
        text="Strategic Partner"
      />

      <InfoCard
        icon={<Star className="text-red-600" />}
        title="Success Focus"
        text="Long-term Growth"
      />
    </section>

    {/* OBJECTIVES */}
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

    {/* CTA */}
    <CTA />
  </>
);

/* ============================================================
                      QUARTERLY PLAN VIEW
============================================================ */

const QuarterlyPlan = () => (
  <>
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
  </>
);

/* ============================================================
                    REUSABLE COMPONENTS
============================================================ */

const SectionTitle = ({ text }) => (
  <h2 className="text-2xl font-bold text-gray-800 mt-6">{text}</h2>
);

const InfoCard = ({ icon, title, text }) => (
  <div className="bg-white/80 rounded-2xl shadow-xl border p-6 text-center space-y-2">
    <div className="flex justify-center">{icon}</div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-gray-600 text-sm">{text}</p>
  </div>
);

const ListCard = ({ items }) => (
  <div className="bg-white/80 rounded-2xl shadow-xl border p-6 space-y-2">
    {items.map((it, i) => (
      <p key={i} className="flex gap-2 items-center text-gray-700 text-sm">
        <CheckCircle2 className="text-red-600" size={16} /> {it}
      </p>
    ))}
  </div>
);

const Roadmap = ({ quarter, points }) => (
  <div className="bg-white/80 rounded-2xl shadow-xl border p-5 mt-3">
    <p className="font-bold text-red-600">{quarter}</p>

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
  <div className="text-center bg-white/80 border rounded-3xl shadow-xl p-8 space-y-3 mt-6">
    <Rocket className="mx-auto text-red-600" />

    <h2 className="text-2xl font-bold text-red-700">
      Ready to Elevate Our Partnership?
    </h2>

    <p className="text-gray-600">
      Schedule your strategy meeting with our relationship manager.
    </p>

    <button className="mt-2 px-6 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition flex gap-2 mx-auto">
      Book Strategy Call <ArrowRight />
    </button>
  </div>
);
