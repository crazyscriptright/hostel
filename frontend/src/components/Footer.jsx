import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import SocialShare from './SocialShare';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-700 w-full mt-auto">
      {/* Grid with 4 columns now */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Column 1: Logo + About */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/images/hostel-room.png"
              alt="GovtHostelCare Logo"
              className="w-10 h-10 rounded-lg border border-indigo-500 shadow"
            />
            <h3 className="text-indigo-400 text-xl font-bold">GovtHostelCare</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            A comprehensive digital platform for government hostel management, streamlining student accommodation, complaint handling, and administrative tasks across educational institutions.
          </p>
          {/* Social Sharing Component */}
          <div className="mt-4">
            <SocialShare className="social-share-footer" />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-indigo-400 transition">About Platform</Link></li>
            <li><Link to="/register" className="hover:text-indigo-400 transition">Student Portal</Link></li>
            <li><Link to="/raise-complaint" className="hover:text-indigo-400 transition">Raise Complaint</Link></li>
            <li><Link to="/dashboard" className="hover:text-indigo-400 transition">Student Dashboard</Link></li>
            <li><Link to="/reset-password" className="hover:text-indigo-400 transition">Reset Password</Link></li>
          </ul>
          
          <h5 className="text-white font-semibold mt-4 mb-2">Services</h5>
          <ul className="space-y-1 text-xs">
            <li><a href="/#accommodation" className="hover:text-indigo-400 transition">Accommodation Management</a></li>
            <li><a href="/#complaints" className="hover:text-indigo-400 transition">Complaint Resolution</a></li>
            <li><a href="/#features" className="hover:text-indigo-400 transition">Platform Features</a></li>
          </ul>
        </div>


         {/* Column 3: Contact Info */}
         <div>
          <h4 className="text-white font-semibold mb-3">Contact Support</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-indigo-400" /> +91 74114 01697
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-indigo-400" /> support@govthostelcare.me
            </li>
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-indigo-400 mt-1" />
              Government Hostel Management<br />
              Digital India Initiative<br />
              Ministry of Education
            </li>
          </ul>
          
          <h5 className="text-white font-semibold mt-4 mb-2">Support Hours</h5>
          <p className="text-xs text-slate-400">
            Mon-Fri: 9:00 AM - 6:00 PM<br />
            24/7 Emergency Support Available
          </p>
        </div>

        {/* Column 4: Social & Community */}
        <div>
          <h4 className="text-white font-semibold mb-3">Connect With Us</h4>
          <div className="flex space-x-4 text-lg mb-4">
            <a href="https://github.com/govthostelcare" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://instagram.com/govthostelcare" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com/govthostelcare" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com/company/govthostelcare" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://facebook.com/govthostelcare" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition" aria-label="Facebook">
              <FaFacebook />
            </a>
          </div>
          
          <h5 className="text-white font-semibold mb-2">Community</h5>
          <ul className="space-y-1 text-xs">
            <li><a href="/#testimonials" className="hover:text-indigo-400 transition">Success Stories</a></li>
            <li><a href="/#help" className="hover:text-indigo-400 transition">Help Center</a></li>
            <li><a href="/#updates" className="hover:text-indigo-400 transition">Platform Updates</a></li>
          </ul>
        </div>

       

      </div> {/* Close 4-column grid */}

      {/* Full Width Row for Map */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <h4 className="text-white font-semibold mb-4">Reach Our Development Center</h4>
        <div className="w-full h-72 rounded-lg overflow-hidden shadow border border-slate-700">
          <iframe
            title="GovtHostelCare Development Center Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.791844051842!2d75.07699757506134!3d15.352450285262864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d6b8fd942131%3A0x67b6dbf77ee7c3cb!2sKLE%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1719058314765!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} <span className="text-indigo-400 font-semibold">GovtHostelCare</span>. All rights reserved. | 
        <a href="/privacy" className="hover:text-indigo-400 ml-1">Privacy Policy</a> | 
        <a href="/terms" className="hover:text-indigo-400 ml-1">Terms of Service</a> | 
        <span className="ml-1">Part of Digital India Initiative</span>
      </div>
    </footer>
  );
};

export default Footer;
