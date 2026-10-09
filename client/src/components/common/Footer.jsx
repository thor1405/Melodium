import React from 'react';
import { Link } from 'react-router-dom';
import { MelodiumLogo } from './MelodiumLogo';
import { Music2, Radio, MapPin, Mail, Instagram, Youtube, Linkedin, ExternalLink, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-dark-900 border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <MelodiumLogo className="w-10 h-10 group-hover:scale-105 transition-transform" showGlow={true} />
              <span className="font-display font-black text-xl tracking-wider text-white">
                MELODIUM <span className="text-amber-400 text-sm font-semibold">SJEC</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier music community of St. Joseph Engineering College, Mangaluru. Empowering vocalists, multi-instrumentalists, sound engineers, and creative storytellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About the Club
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-400 hover:text-white transition-colors">
                  Performance Gallery
                </Link>
              </li>
              <li>
                <Link to="/sound-engineer" className="text-slate-400 hover:text-white transition-colors">
                  Sound Engineer (Lionel)
                </Link>
              </li>
            </ul>
          </div>

          {/* Jam Room Portal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Studio & Booking
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jam-room" className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" /> Book 1-Hour Slot
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-slate-400 hover:text-white transition-colors">
                  My Active Passes
                </Link>
              </li>
              <li>
                <Link to="/about#jam-room-rules" className="text-slate-400 hover:text-white transition-colors">
                  Jam Room Guidelines
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">
                  Musician ID Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* College & Contact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Campus Location
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Academic Block 3, Ground Floor, St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka 575028
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-mono">melodium@sjec.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Melodium SJEC. St. Joseph Engineering College. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Where Music Finds Its Voice</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">SJEC Cultural Council</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
