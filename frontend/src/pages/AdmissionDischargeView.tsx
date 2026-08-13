import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EmergencyRequest, Bed } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckCircle2, UserCheck, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdmissionDischargeView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<EmergencyRequest | null>(null);
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Gregory House');
  const [notes, setNotes] = useState('Patient confirmed & admitted to assigned ER bed.');
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

  const steps = [
    { num: 1, label: 'Patient Info' },
    { num: 2, label: 'Triage Check' },
    { num: 3, label: 'Bed Reservation' },
    { num: 4, label: 'Doctor Assign' },
    { num: 5, label: 'Final Admission' }
  ];

  const handleFinalAdmission = async () => {
    if (!selectedReq) return;
    setActionMsg('');
    try {
      const beds = await api.getHospitalBeds(1);
      const bedToAdmit = beds.find((b) => b.status === 'Reserved' || b.status === 'Available') || beds[0];

      await api.confirmAdmission(selectedReq.patient_id, bedToAdmit.id, attendingDoctor, notes);
      setActionMsg(`Patient ${selectedReq.patient_name} admitted successfully to Bed #${bedToAdmit.bed_number}! Bed status moved to Occupied.`);
      setCurrentStep(5);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-cyan-500">
        <h2 className="text-xl font-extrabold text-white">Patient Admission Stepper</h2>
        <p className="text-xs text-slate-400">Step-by-step verified emergency admission workflow.</p>
      </Card>

      {/* Progress Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((st) => (
            <div key={st.num} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= st.num
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {st.num}
              </div>
              <span className={`hidden sm:inline text-xs font-bold ${
                currentStep >= st.num ? 'text-white' : 'text-slate-500'
              }`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Step Form */}
      <Card className="space-y-4 max-w-2xl mx-auto">
        <h3 className="text-sm font-extrabold text-white">
          Step {currentStep}: {steps[currentStep - 1].label}
        </h3>

        {selectedReq && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="font-extrabold text-white">{selectedReq.patient_name}</div>
              <div className="text-slate-300">Triage Level: <b className="text-cyan-400">{selectedReq.triage_level}</b></div>
              <div className="text-slate-400">Symptoms: {selectedReq.symptoms}</div>
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Attending Doctor</label>
              <input
                type="text"
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1">Admission Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="border-slate-800 text-slate-300"
          >
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleFinalAdmission}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Confirm Final Admission
            </Button>
          )}
        </div>
      </Card>

    </div>
  );
};
