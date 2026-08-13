import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Download, Printer, FileText } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.getAnalyticsSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportToCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Count\n"
      + `Total Hospitals,${data.totals.hospitals}\n`
      + `Total Ambulances,${data.totals.ambulances}\n`
      + `Total Patients,${data.totals.patients}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CareLink_Emergency_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Operational Reports...</div>;
  }

  const COLORS = ['#10B981', '#06B6D4', '#F43F5E', '#F59E0B', '#A855F7'];

  return (
    <div className="space-y-6">
      
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Operational Reports & Analytics</h2>
            <p className="text-xs text-slate-400">Emergency admissions breakdown, bed occupancy rates, and priority stats.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportToCSV} className="border-slate-800 text-slate-300 hover:bg-slate-800">
            Export CSV
          </Button>

          <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
            Print Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-sm font-extrabold text-white">Bed Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.bedStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.status}: ${e.count}`}>
                  {data.bedStats.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-extrabold text-white">Admissions by Triage Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.triageStats}>
                <XAxis dataKey="triage_level" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
};
