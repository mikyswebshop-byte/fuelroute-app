'use client';

import { PlannerDispatchBoard } from '@/components/PlannerDispatchBoard';
import { PlannerTripTools } from '@/components/PlannerTripTools';
import { queueCmrAssignment } from '@/lib/dispatch-store';
import type { CmrShipment } from '@/lib/cmr-store';

export default function PlannerPage() {
  const onCmrApplied = (cmr: CmrShipment) => {
    queueCmrAssignment(cmr);
  };

  return (
    <main className="min-h-screen px-3 py-4 sm:px-5 sm:py-6 lg:px-8" style={{ background: '#0b0f19' }}>
      <div className="max-w-[1600px] mx-auto">
        <PlannerDispatchBoard tools={<PlannerTripTools />} onCmrApplied={onCmrApplied} />
      </div>
    </main>
  );
}
