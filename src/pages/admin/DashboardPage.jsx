import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ active: 0, redeemedToday: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      const [active, redeemedToday, users] = await Promise.all([
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "redeemed")
          .gte("created_at", todayISO),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;
      setStats({
        active: active.count ?? 0,
        redeemedToday: redeemedToday.count ?? 0,
        users: users.count ?? 0,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { key: "todayConfirmed", value: stats.active, label: "Active tickets" },
    { key: "todayRedeemed", value: stats.redeemedToday, label: "Redeemed today" },
    { key: "totalUsers", value: stats.users, label: null },
  ];

  return (
    <section className="max-w-6xl px-4 py-10 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.dashboard")}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.key} className="card">
            <div className="text-sm text-gray-500">
              {c.label ?? t(`admin.stats.${c.key}`)}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? "…" : c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Link
          to="/admin/menu"
          className="transition-colors card hover:bg-kau-50"
        >
          <div className="font-semibold text-kau-700">{t("admin.menu")}</div>
        </Link>
        <Link
          to="/admin/ticket-types"
          className="transition-colors card hover:bg-kau-50"
        >
          <div className="font-semibold text-kau-700">{t("admin.ticketTypes")}</div>
        </Link>
        <Link
          to="/admin/bookings"
          className="transition-colors card hover:bg-kau-50"
        >
          <div className="font-semibold text-kau-700">
            {t("admin.bookings")}
          </div>
        </Link>
        <Link
          to="/admin/scan"
          className="transition-colors card hover:bg-kau-50"
        >
          <div className="font-semibold text-kau-700">{t("admin.scanBtn")}</div>
        </Link>
      </div>
    </section>
  );
}
