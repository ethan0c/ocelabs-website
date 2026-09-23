import StudioNav from '@/components/StudioNav';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** The estimator and proposal preview are studio pages that kept their URL. */
export default async function PricingLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/pricing');
  return (
    <div className="studio">
      <StudioNav email={session.email} />
      {children}
    </div>
  );
}
