import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Bed } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const CleaningView: React.FC = () => {
  const [cleaningBeds, setCleaningBeds] = useState<Bed[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const [completedAnimationId, setCompletedAnimationId] = useState<number | null>(null);

  const loadCleaningQueue = async () => {
    try {
      const beds = await api.getBedsNeedingCleaning();
      setCleaningBeds(beds);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCleaningQueue();
  }, []);

  const handleCompleteCleaning = async (bedId: number) => {
    setActionMsg('');
    setCompletedAnimationId(bedId);
    try {
      await api.completeCleaning(bedId, 'Sanitization completed and verified ready');
      setActionMsg(`Bed #${bedId} sanitization complete! Status changed to Available.`);
      setTimeout(() => {
        setCompletedAnimationId(null);
        loadCleaningQueue();
      }, 600);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
      setCompletedAnimationId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-amber-500">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-950 text-amber-400 border border-amber-800 rounded-2xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Bed Sanitization & Cleaning Tasks</h2>
            <p className="text-xs text-slate-400">Post-discharge bed sanitization workflow to transition beds back to Available status.</p>
          </div>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-green-success" />
          <span>{actionMsg}</span>
        </div>
      )}

      <Card className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Beds Queueing for Cleaning ({cleaningBeds.length})
        </h3>

        {cleaningBeds.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-base font-extrabold text-white">All Hospital Beds Sanitized & Ready!</p>
            <p className="text-xs text-slate-400">No beds currently queueing for sanitization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cleaningBeds.map((bed) => {
              const isAnimating = completedAnimationId === bed.id;

              return (
                <Card
                  key={bed.id}
                  className={`space-y-3 transition-all ${
                    isAnimating ? 'bg-emerald-950/60 border-emerald-500 animate-green-success' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-base">Bed #{bed.bed_number}</span>
                    <Badge status={isAnimating ? 'Available' : 'Under Cleaning'}>
                      {isAnimating ? 'Available' : 'Under Cleaning'}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-300">
                    <div>Ward: <b className="text-white">{bed.ward_name}</b> ({bed.floor})</div>
                    <div>Type: {bed.bed_type}</div>
                  </div>

                  <Button
                    variant="success"
                    size="sm"
                    className="w-full shadow-md font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleCompleteCleaning(bed.id)}
                  >
                    Mark Sanitized & Set Available
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
};
