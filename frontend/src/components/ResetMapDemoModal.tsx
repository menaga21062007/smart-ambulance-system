import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ResetMapDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ResetMapDemoModal: React.FC<ResetMapDemoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Map Demonstration Data">
      <div className="space-y-5 text-xs text-slate-300">
        
        <div className="p-3.5 bg-amber-950/80 border border-amber-800/80 rounded-2xl text-amber-200 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">
            This will clear map-tracking history, active signal requests, and demonstration routes. Patient, hospital, bed, resource, and user data will not be deleted. Continue?
          </p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
          <h4 className="font-extrabold text-white uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized Operation Summary:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Active demonstration traffic priority signals will reset to <b className="text-white">NORMAL</b>.</li>
            <li>GPS waypoint tracking history log will be cleared.</li>
            <li>All <b>Patients, Hospital Beds, Admissions, Resources, and User Accounts</b> will remain 100% intact.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-800 text-slate-300 hover:bg-slate-800">
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Map Demo Data</span>
          </Button>
        </div>

      </div>
    </Modal>
  );
};
