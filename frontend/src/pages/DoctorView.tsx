import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EmergencyRequest } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stethoscope, CheckCircle2, HeartPulse } from 'lucide-react';

export const DoctorView: React.FC = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<EmergencyRequest | null>(null);
  const [diagnosis, setDiagnosis] = useState('Acute Anterior Myocardial Infarction. ST-Elevation on ECG.');
  const [treatmentNotes, setTreatmentNotes] = useState('Administered Dual Antiplatelet Therapy (DAPT) + Heparin. Scheduled for PCI / ICU.');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const reqs = await api.getEmergencyRequests();
        setRequests(reqs);
        if (reqs.length > 0) setSelectedReq(reqs[0]);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleDischargePatient = async (patientId: number) => {
    setActionMsg('');
    try {
      const beds = await api.getHospitalBeds(1);
      const occupiedBed = beds.find((b) => b.status === 'Occupied' || b.status === 'Reserved');
      const bedId = occupiedBed ? occupiedBed.id : 1;

      await api.processDischarge(patientId, bedId, 'NORMAL', 'Patient stabilized & discharged post-treatment.');
      setActionMsg(`Patient #${patientId} discharged. Bed queued for sanitization (Status: Under Cleaning).`);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Box */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-cyan-500">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-2xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Attending Doctor Clinical Portal</h2>
            <p className="text-xs text-slate-400">Diagnosis, clinical treatment updates, and discharge approval.</p>
          </div>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Unselected & Selected Emergency Patients Queue */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="space-y-3">
            <h3 className="text-sm font-extrabold text-white">Emergency Patients ({requests.length})</h3>

            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {requests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReq(r)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>{r.patient_name}</span>
                      <Badge triage={r.triage_level}>{r.triage_level}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-400">Symptoms: {r.symptoms}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Clinical Record & Input Textareas */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="space-y-4">
            {selectedReq ? (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-white">Clinical Record: {selectedReq.patient_name}</h3>
                  <span className="text-cyan-400 font-semibold">Triage: {selectedReq.triage_level}</span>
                </div>

                <div>
                  <label className="font-bold text-slate-200 block mb-1">Diagnosis & Observations</label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
                  ></textarea>
                </div>

                <div>
                  <label className="font-bold text-slate-200 block mb-1">Treatment & Prescriptions</label>
                  <textarea
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
                  ></textarea>
                </div>

                <Button
                  variant="danger"
                  size="md"
                  className="w-full shadow-lg font-extrabold bg-rose-600 hover:bg-rose-500 text-white"
                  onClick={() => handleDischargePatient(selectedReq.patient_id)}
                >
                  Approve Discharge & Release Bed for Sanitization
                </Button>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 text-xs">Select a patient file to view treatment details.</div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
};
