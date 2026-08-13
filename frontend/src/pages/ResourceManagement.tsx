import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Resource } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Package, AlertTriangle, CheckCircle2, Plus, Minus } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const [hospitalId] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  const loadResources = async () => {
    try {
      const res = await api.getHospitalResources(hospitalId);
      setResources(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadResources();
  }, [hospitalId]);

  const handleAdjustQuantity = async (resourceId: number, currentAvail: number, delta: number) => {
    setActionMsg('');
    const newQty = Math.max(0, currentAvail + delta);
    try {
      await api.updateResource(resourceId, newQty);
      setActionMsg(`Resource stock updated to ${newQty}`);
      await loadResources();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-teal-500">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-950 text-teal-400 border border-teal-800 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency Resource Inventory</h2>
            <p className="text-xs text-slate-400">Track ICU beds, ventilators, medical oxygen cylinders, blood units, and wheelchairs.</p>
          </div>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => {
          const isLow = res.available_quantity <= res.minimum_threshold;
          const pct = Math.round((res.available_quantity / res.total_quantity) * 100);

          return (
            <Card
              key={res.id}
              className={`space-y-4 ${isLow ? 'border-rose-800 bg-rose-950/20' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-base">{res.name}</span>
                <Badge status={isLow ? 'Occupied' : 'Available'}>{res.resource_type}</Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>Stock Available</span>
                  <span className={isLow ? 'text-rose-400 font-extrabold' : 'text-cyan-400 font-bold'}>
                    {res.available_quantity} / {res.total_quantity} ({pct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all ${isLow ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Min Threshold: <b className="text-white">{res.minimum_threshold}</b></span>
                
                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustQuantity(res.id, res.available_quantity, -1)}
                    className="border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustQuantity(res.id, res.available_quantity, 1)}
                    className="border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};
