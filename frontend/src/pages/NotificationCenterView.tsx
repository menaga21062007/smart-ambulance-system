import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bell, Radio, CheckCircle2, Trash2 } from 'lucide-react';

export const NotificationCenterView: React.FC = () => {
  const { alerts, removeAlert } = useSocket();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-cyan-500 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency Notification Center</h2>
            <p className="text-xs text-slate-400">Real-time alerts broadcasted via CareLink WebSocket messaging engine.</p>
          </div>
        </div>

        <Badge status="Available">{alerts.length} Active Alerts</Badge>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" /> System Alerts Feed
          </h3>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No active emergency alerts recorded.</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-white">{a.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{a.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300">{a.message}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAlert(a.id)}
                  icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};
