import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { today } from "../../lib/dates";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ confirmed: 0, redeemed: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const todayStr = today();
      const [confirmed, redeemed, users] = await Promise.all([
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("booking_date", todayStr)
          .eq("status", "confirmed"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("booking_date", todayStr)
          .eq("status", "redeemed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;
      setStats({
        confirmed: confirmed.count ?? 0,
        redeemed: redeemed.count ?? 0,
        users: users.count ?? 0,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { key: "todayConfirmed", value: stats.confirmed },
    { key: "todayRedeemed", value: stats.redeemed },
    { key: "totalUsers", value: stats.users },
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
              {t(`admin.stats.${c.key}`)}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? "…" : c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/menu"
          className="transition-colors card hover:bg-kau-50"
        >
          <div className="font-semibold text-kau-700">{t("admin.menu")}</div>
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
