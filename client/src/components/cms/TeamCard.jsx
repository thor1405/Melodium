import React from 'react';
import { Music, Instagram, Linkedin, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeamCard = ({ member }) => {
  if (!member) return null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
    >
      {/* Photo */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-dark-900">
        <img
          src={member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

        {/* Instrument / Specialization Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-brand-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Music className="w-3 h-3 text-brand-gold" />
            {member.instrument || 'Musician'}
          </span>
        </div>

        {/* Name & Role overlay */}
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <h3 className="font-display font-extrabold text-xl text-white group-hover:text-amber-400 transition-colors">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            {member.role}
          </p>
        </div>
      </div>

      {/* Body / Bio */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {member.bio && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{member.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {member.department && <span>{member.department}</span>}
            {member.year && <span>• Year {member.year}</span>}
            {member.usn && <span className="font-mono text-slate-400">• {member.usn}</span>}
          </div>
        </div>

        {/* Social Links */}
        {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            {member.socialLinks.instagram && (
              <a
                href={member.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {member.socialLinks.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
