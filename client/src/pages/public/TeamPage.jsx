import React, { useState, useEffect } from 'react';
import { TeamCard } from '../../components/cms/TeamCard';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Users, Sparkles, Award } from 'lucide-react';
import { CardSkeleton } from '../../components/common/Skeleton';

export const TeamPage = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await cmsService.getTeam();
        if (res.success) setMembers(res.data);
      } catch (err) {
        toast.error('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const faculty = members.filter((m) => m.category === 'FACULTY');
  const core = members.filter((m) => m.category === 'CORE_COMMITTEE');
  const bandLeads = members.filter((m) => m.category === 'BAND_LEADS');
  const others = members.filter((m) => m.category === 'MEMBERS');

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          The People Behind The Sound
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Faculty, Core Committee & Band Leads
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          The passionate faculty mentors, club executives, multi-instrumentalists, and sound crew powering Melodium SJEC.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-16">
          {/* Faculty Mentor */}
          {faculty.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-display font-bold text-white">
                  Faculty Advisory & Patron
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((member) => (
                  <TeamCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Core Committee */}
          {core.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-display font-bold text-white">
                  Core Executive Committee
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {core.map((member) => (
                  <TeamCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Band Leads & Section Captains */}
          {bandLeads.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-yellow-400" />
                <h2 className="text-2xl font-display font-bold text-white">
                  Band Leads & Section Captains
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bandLeads.map((member) => (
                  <TeamCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* General Members */}
          {others.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white">Club Musicians</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {others.map((member) => (
                  <TeamCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
