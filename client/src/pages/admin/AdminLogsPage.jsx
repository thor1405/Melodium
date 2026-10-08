import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { Activity, RefreshCw } from 'lucide-react';

export const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getActivityLogs(50);
      if (res.success) setLogs(res.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">System & Audit Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit trail of all student bookings, cancellations, admin actions, and slot blocks.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-4">Action</th>
              <th className="py-4 px-4">User</th>
              <th className="py-4 px-4">Details</th>
              <th className="py-4 px-4">Entity</th>
              <th className="py-4 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-brand-gold">{log.action}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{log.userName || 'System'}</div>
                  <div className="text-[10px] text-slate-400">{log.userRole || 'SYSTEM'}</div>
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-md">{log.details}</td>
                <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                  {log.entityType}
                </td>
                <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                  {getRelativeTime(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
