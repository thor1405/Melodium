import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AnalyticsView } from '../../components/admin/AnalyticsView';
import { useToast } from '../../context/ToastContext';
import { BarChart3, RefreshCw } from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      toast.error('Failed to calculate analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">
            Jam Room Analytics & Utilization
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real metrics calculated from live database reservations, peak hours, and monthly volume.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Calculating metrics...
        </div>
      ) : (
        <AnalyticsView analytics={analytics} />
      )}
    </div>
  );
};
