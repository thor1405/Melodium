import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dateUtils';
import { Users, Search, Shield, ShieldAlert, UserCheck, UserX, Mail, Music } from 'lucide-react';

export const AdminUsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({
        page,
        limit: 20,
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      const res = await adminService.updateUser(user._id, { role: newRole });
      if (res.success) {
        toast.success(`Updated ${user.name}'s role to ${newRole}.`);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const res = await adminService.updateUser(user._id, { isActive: !user.isActive });
      if (res.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-display text-white">Registered Students & Musicians</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          View registered SJEC accounts, USNs, departments, booking counts, and manage roles.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="p-4 glass-panel rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, USN, email, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-4">Student</th>
              <th className="py-4 px-4">USN & Department</th>
              <th className="py-4 px-4">Instrument</th>
              <th className="py-4 px-4">Jam Sessions</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-mono text-brand-gold">{u.usn || '—'}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">
                    {u.department} (Yr {u.year})
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                    <span>{u.instrument || 'Musician'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono font-bold text-white">
                  {u.bookingCount || 0}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Toggle Admin Role"
                    >
                      {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleStatusToggle(u)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.isActive
                          ? 'bg-emerald-950/40 text-emerald-400 hover:bg-rose-950/40 hover:text-rose-400'
                          : 'bg-rose-950/40 text-rose-400 hover:bg-emerald-950/40 hover:text-emerald-400'
                      }`}
                      title={u.isActive ? 'Deactivate User' : 'Activate User'}
                    >
                      {u.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
