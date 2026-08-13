import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Bed, BedStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { BedDouble, CheckCircle2, Filter, LayoutGrid, List, Sparkles } from 'lucide-react';

export const WardDashboard: React.FC = () => {
  const [hospitalId] = useState(1);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [actionMsg, setActionMsg] = useState('');

  const loadBeds = async () => {
    try {
      const b = await api.getHospitalBeds(hospitalId);
      setBeds(b);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBeds();
  }, [hospitalId]);

  const handleUpdateStatus = async (bedId: number, status: BedStatus) => {
    setActionMsg('');
    try {
      await api.updateBedStatus(bedId, status);
      setActionMsg(`Bed #${bedId} status updated to ${status}`);
      await loadBeds();
      setSelectedBed(null);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  const filteredBeds = beds.filter((b) => (filterStatus === 'ALL' ? true : b.status === filterStatus));

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Bed Capacity Management Matrix</h2>
          <p className="text-xs text-slate-400">Flow: Available → Reserved → Occupied → Under Cleaning → Available</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            {['ALL', 'Available', 'Reserved', 'Occupied', 'Under Cleaning'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterStatus === st
                    ? 'bg-cyan-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBeds.map((bed) => (
            <Card
              key={bed.id}
              hoverEffect
              onClick={() => setSelectedBed(bed)}
              className="space-y-3 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-base">#{bed.bed_number}</span>
                <Badge status={bed.status} size="sm">{bed.status}</Badge>
              </div>

              <div>
                <div className="text-xs font-bold text-white">{bed.ward_name}</div>
                <div className="text-[10px] text-slate-400">{bed.bed_type}</div>
              </div>

              {bed.current_patient_id && (
                <div className="text-[10px] font-bold bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                  Patient #{bed.current_patient_id}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="pb-2">Bed Number</th>
                <th className="pb-2">Ward</th>
                <th className="pb-2">Bed Type</th>
                <th className="pb-2">Current Status</th>
                <th className="pb-2">Equipment</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {filteredBeds.map((bed) => (
                <tr key={bed.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 font-bold text-white">#{bed.bed_number}</td>
                  <td className="py-2.5">{bed.ward_name}</td>
                  <td className="py-2.5 text-slate-400">{bed.bed_type}</td>
                  <td className="py-2.5"><Badge status={bed.status}>{bed.status}</Badge></td>
                  <td className="py-2.5 text-slate-400">{bed.required_equipment || 'Standard'}</td>
                  <td className="py-2.5">
                    <Button variant="outline" size="sm" onClick={() => setSelectedBed(bed)} className="border-slate-800 text-slate-300">
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Bed Status Change Modal */}
      {selectedBed && (
        <Modal
          isOpen={Boolean(selectedBed)}
          onClose={() => setSelectedBed(null)}
          title={`Update Bed #${selectedBed.bed_number}`}
          subtitle={`${selectedBed.ward_name} • Current Status: ${selectedBed.status}`}
        >
          <div className="space-y-4 text-xs">
            <label className="font-bold text-slate-200 block">Select New Bed Status:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Available', 'Reserved', 'Occupied', 'Under Cleaning', 'Out of Service', 'Maintenance'] as BedStatus[]).map((st) => (
                <Button
                  key={st}
                  variant={selectedBed.status === st ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedBed.id, st)}
                  className={`w-full justify-start ${selectedBed.status === st ? 'bg-cyan-600 text-white' : 'border-slate-800 text-slate-300'}`}
                >
                  Set to {st}
                </Button>
              ))}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
