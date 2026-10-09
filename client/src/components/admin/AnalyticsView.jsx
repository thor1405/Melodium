import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Activity,
  Award,
} from 'lucide-react';

const COLORS = ['#10B981', '#ece75f', '#ded946', '#94A3B8', '#F43F5E'];

export const AnalyticsView = ({ analytics }) => {
  if (!analytics || !analytics.overview) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center text-slate-400 text-sm">
        No analytics data available yet.
      </div>
    );
  }

  const { overview, popularHours, dailyTrends, statusDistribution, topStudents } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-brand-gold flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-black text-white">
            {overview.totalBookings || 0}
          </div>
          <div className="text-[11px] text-slate-500">All-time reserved sessions</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Jam Room Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-brand-purple flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-black text-white">
            {overview.utilizationRate || 0}%
          </div>
          <div className="text-[11px] text-purple-300">Studio Capacity Used</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Bookings This Month</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-black text-white">
            {overview.bookingsThisMonth || 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {overview.bookingsThisWeek || 0} in past 7 days
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Musicians</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-brand-cyan flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-black text-white">
            {overview.totalStudents || 0}
          </div>
          <div className="text-[11px] text-slate-500">Registered SJEC Students</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Bar Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold" />
              <span>Most Popular Jamming Hours</span>
            </h3>
            <span className="text-xs text-slate-400">Time of Day</span>
          </div>

          <div className="h-64 w-full">
            {popularHours && popularHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularHours}>
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0C0F17',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#ece75f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Data accumulates as sessions are booked.
              </div>
            )}
          </div>
        </div>

        {/* 30-Day Trend Area Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-purple" />
              <span>30-Day Booking Velocity</span>
            </h3>
            <span className="text-xs text-slate-400">Daily Volume</span>
          </div>

          <div className="h-64 w-full">
            {dailyTrends && dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ece75f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ece75f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0C0F17',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#ece75f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#yellowGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Trendline will render with session history.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Breakdown & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Donut */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">Booking Status Distribution</h3>
          <div className="h-48 w-full flex items-center justify-center">
            {statusDistribution && statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0C0F17',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No status metrics yet.</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
            {statusDistribution?.map((item, idx) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-300 capitalize">{item.status.toLowerCase()}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Students */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-gold" />
              <span>Top Active Jam Room Musicians</span>
            </h3>
            <span className="text-xs text-slate-400">Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {topStudents && topStudents.length > 0 ? (
              topStudents.map((st, idx) => (
                <div
                  key={st._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500/20 text-brand-gold border border-amber-500/40'
                          : idx === 1
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {st.usn || st.email} • {st.instrument || 'Musician'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-gold font-mono">
                      {st.totalBookings}
                    </span>
                    <span className="text-[10px] text-slate-400 block">sessions</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Top student rankings will appear after initial jam sessions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
