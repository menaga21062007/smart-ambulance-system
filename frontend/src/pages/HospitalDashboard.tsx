import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EmergencyRequest, Bed, BedRecommendation } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Building2, BedDouble, AlertTriangle, CheckCircle2, Clock, Sparkles, ShieldAlert, Star } from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const [hospitalId] = useState(1);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedReq, setSelectedReq] = useState<EmergencyRequest | null>(null);
  const [recommendations, setRecommendations] = useState<{ primary: BedRecommendation | null; alternatives: BedRecommendation[]; warning?: string }>({
    primary: null,
    alternatives: []
  });
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  
  // Reservation Modal State
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [targetBedToReserve, setTargetBedToReserve] = useState<BedRecommendation | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const reqs = await api.getEmergencyRequests();
        setRequests(reqs);
        const b = await api.getHospitalBeds(hospitalId);
        setBeds(b);
        if (reqs.length > 0) {
          setSelectedReq(reqs[0]);
          fetchRecs(reqs[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [hospitalId]);

  const fetchRecs = async (reqId: number) => {
    setLoadingRecs(true);
    try {
      const recs = await api.getBedRecommendations(reqId);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleOpenReserveModal = (bedRec: BedRecommendation) => {
    setTargetBedToReserve(bedRec);
    setShowReserveModal(true);
  };

  const handleConfirmReservation = async () => {
    if (!targetBedToReserve || !selectedReq) return;
    setActionMsg('');
    try {
      await api.reserveBed(targetBedToReserve.bed_id, selectedReq.patient_id, selectedReq.id);
      setActionMsg(`Bed #${targetBedToReserve.bed_number} reserved successfully for ${selectedReq.patient_name}! Expiry: 30 mins.`);
      setShowReserveModal(false);

      const b = await api.getHospitalBeds(hospitalId);
      setBeds(b);
      const reqs = await api.getEmergencyRequests();
      setRequests(reqs);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-cyan-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency ER & Decision Support Panel</h2>
            <p className="text-xs text-slate-400">CareLink decision-support engine for bed reservations & patient intake.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-400">Hospital Beds Free:</span>
          <Badge status="Available">
            {beds.filter((b) => b.status === 'Available').length} / {beds.length}
          </Badge>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incoming Ambulances Queue */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Incoming Ambulances ({requests.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {requests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReq(r);
                      fetchRecs(r.id);
                    }}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-white text-sm">{r.patient_name || 'Emergency Patient'}</span>
                      <Badge triage={r.triage_level}>{r.triage_level}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-2 font-medium">
                      <div>Vehicle: <b className="text-white">{r.vehicle_number || 'AMB-101'}</b></div>
                      <div>ETA: <b className="text-rose-400">{r.estimated_arrival_time} Mins</b></div>
                    </div>
                    <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <b>Symptoms:</b> {r.symptoms}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* AI Recommendation Engine */}
        <div className="lg:col-span-7 space-y-5">
          {selectedReq ? (
            <Card className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">AI Decision Support Engine</span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Bed Recommendation for Patient {selectedReq.patient_name}
                  </h3>
                </div>
                <Badge status="Available">Match Calculated</Badge>
              </div>

              {loadingRecs ? (
                <div className="p-8 text-center text-slate-500 text-xs">Computing optimal bed matching score...</div>
              ) : recommendations.warning ? (
                <div className="bg-rose-950/80 border border-rose-800 p-4 rounded-xl text-xs text-rose-300 font-bold">
                  ⚠️ {recommendations.warning}
                </div>
              ) : recommendations.primary ? (
                <div className="space-y-4">
                  
                  {/* Top Match Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-cyan-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> Top Recommended ({recommendations.primary.score}% Match)
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                        {recommendations.primary.bed_number}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">{recommendations.primary.ward_name}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{recommendations.primary.floor} • {recommendations.primary.bed_type}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1.5 mb-4">
                      <div className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Rationale: {recommendations.primary.match_reason}</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-white">Equipment On-Site:</span> {recommendations.primary.equipment}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full shadow-lg font-extrabold bg-cyan-600 hover:bg-cyan-500 text-white"
                      onClick={() => handleOpenReserveModal(recommendations.primary!)}
                    >
                      Reserve Recommended Bed #{recommendations.primary.bed_number}
                    </Button>
                  </div>

                  {/* Ranked Alternative Beds */}
                  {recommendations.alternatives.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternative Available Beds</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {recommendations.alternatives.map((alt) => (
                          <div key={alt.bed_id} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                            <div className="flex items-center justify-between font-bold text-white">
                              <span>Bed {alt.bed_number} ({alt.ward_name})</span>
                              <span className="text-cyan-400 font-bold">{alt.score}%</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{alt.match_reason}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-slate-800 text-slate-200 hover:bg-slate-800"
                              onClick={() => handleOpenReserveModal(alt)}
                            >
                              Reserve Bed {alt.bed_number}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </Card>
          ) : (
            <Card className="text-center text-slate-500 py-12 text-xs">
              Select an incoming ambulance to calculate AI bed recommendations.
            </Card>
          )}
        </div>

      </div>

      {/* Confirmation Reservation Modal */}
      {showReserveModal && targetBedToReserve && selectedReq && (
        <Modal
          isOpen={showReserveModal}
          onClose={() => setShowReserveModal(false)}
          title={`Confirm Reservation: Bed #${targetBedToReserve.bed_number}`}
          subtitle="CareLink ER Automated Reservation Workflow"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{selectedReq.patient_name}</span>
                <Badge triage={selectedReq.triage_level}>{selectedReq.triage_level}</Badge>
              </div>
              <div className="text-slate-300">
                <div><b>Target Bed:</b> #{targetBedToReserve.bed_number} ({targetBedToReserve.ward_name})</div>
                <div><b>Equipment:</b> {targetBedToReserve.equipment}</div>
                <div><b>Reservation Expiry:</b> 30 Minutes</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowReserveModal(false)} className="border-slate-800 text-slate-300">
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmReservation} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                Confirm & Lock Bed Reservation
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
