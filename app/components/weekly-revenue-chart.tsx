import { Panel } from "@/app/components/ui";
import { formatRupiah } from "@/app/lib/demo-data";

type DailyRevenue = {
  date: string;
  revenue: number;
};

function getWeeklyRevenue(month: string, daily: DailyRevenue[]) {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];

  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const weeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => {
    const firstDay = index * 7 + 1;
    const lastDay = Math.min(firstDay + 6, daysInMonth);
    return {
      firstDay,
      lastDay,
      revenue: 0,
    };
  });

  for (const row of daily) {
    if (!row.date.startsWith(`${month}-`)) continue;
    const day = Number(row.date.slice(8, 10));
    const week = weeks[Math.floor((day - 1) / 7)];
    if (week && Number.isFinite(row.revenue)) week.revenue += row.revenue;
  }

  return weeks;
}

const compactRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function WeeklyRevenueChart({
  daily,
  month,
  title = "Penjualan per pekan",
}: {
  daily: DailyRevenue[];
  month: string;
  title?: string;
}) {
  const weeks = getWeeklyRevenue(month, daily);
  const maxRevenue = Math.max(0, ...weeks.map((week) => week.revenue));
  const totalRevenue = weeks.reduce((sum, week) => sum + week.revenue, 0);
  const monthLabel = /^\d{4}-\d{2}$/.test(month)
    ? new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${month}-01T00:00:00.000Z`))
    : "periode terpilih";

  return (
    <Panel className="chart-panel" title={title}>
      {maxRevenue > 0 ? (
        <>
          <figure
            aria-label={`Pendapatan terkonfirmasi per pekan, ${monthLabel}`}
            className="weekly-revenue-chart"
          >
            <div className="weekly-revenue-chart__plot" role="list">
              {weeks.map((week) => {
                const weekLabel = `${week.firstDay}–${week.lastDay}`;
                const barHeight =
                  maxRevenue > 0 ? (week.revenue / maxRevenue) * 100 : 0;
                return (
                  <div
                    aria-label={`Tanggal ${weekLabel}: ${formatRupiah(week.revenue)}`}
                    className="weekly-revenue-chart__column"
                    key={week.firstDay}
                    role="listitem"
                    title={`${weekLabel}: ${formatRupiah(week.revenue)}`}
                  >
                    <span className="weekly-revenue-chart__value">
                      {compactRupiah.format(week.revenue)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`weekly-revenue-chart__bar${week.revenue === maxRevenue ? " is-peak" : ""}`}
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="weekly-revenue-chart__label">
                      {weekLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            <figcaption className="weekly-revenue-chart__caption">
              Tanggal dalam {monthLabel}; nilai di atas batang adalah
              pendapatan pekanan.
            </figcaption>
          </figure>
          <p className="weekly-revenue-chart__total">
            Total periode <strong>{formatRupiah(totalRevenue)}</strong>
          </p>
        </>
      ) : (
        <p className="empty-state">
          Belum ada pendapatan terkonfirmasi pada {monthLabel}.
        </p>
      )}
    </Panel>
  );
}
