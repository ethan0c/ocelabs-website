import type { Metadata } from 'next';
import { Bars, Columns } from '@/components/Charts';
import { nowMs } from '@/lib/now';
import { usd } from '@/lib/pricing';
import { dashboardStats } from '@/lib/studio';

export const metadata: Metadata = {
  title: 'Dashboard — OCE Labs Studio',
  robots: { index: false, follow: false },
};

/** The studio at a glance: three charts, then the numbers behind them. Test leads are left out. */
export default async function DashboardPage() {
  const d = await dashboardStats(new Date(nowMs()));
  const rate = d.winRate === null ? 'nothing closed yet' : `${Math.round(d.winRate * 100)}% win rate`;

  const stats: Array<[string, string, string]> = [
    ['Open leads', String(d.open), d.dueNow ? `${d.dueNow} due now` : 'Nothing due'],
    ['Won', String(d.won), `${d.lost} lost, ${rate}`],
    ['Paid, all time', usd.format(d.paidTotal), d.outstanding ? `${usd.format(d.outstanding)} invoiced, not yet paid` : 'Nothing outstanding'],
    ['Retainers', String(d.retainers.count), d.retainers.monthly ? `${usd.format(d.retainers.monthly)} a month` : 'None running'],
  ];

  return (
    <>
      <header className="shell page-head studio-head">
        <div>
          <p className="eyebrow rise rise-1">Studio</p>
          <h1 className="h1 rise rise-2">Dashboard.</h1>
          <p className="lede rise rise-3">Every lead except the ones marked as test. The charts cover the last twelve months.</p>
        </div>
      </header>

      <section className="shell studio-body">
        <div className="dash-charts">
          <Columns title="New leads" points={d.leadsByMonth} />
          <Bars title="Open, by stage" rows={d.pipeline} />
          <Columns title="Paid" points={d.paidByMonth} money />
        </div>

        <div className="stat-row">
          {stats.map(([label, value, sub]) => (
            <div key={label} className="stat">
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
              <p className="stat-sub">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
