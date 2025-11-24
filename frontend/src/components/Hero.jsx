import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section
      className="relative h-screen w-full bg-gradient-to-b from-sky-100 to-white text-slate-800 flex items-center justify-center px-6 md:px-20 overflow-hidden"
    >
      {/* Background Image Overlay */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <img
          src="/images/image8.png" // Replace with actual image path
          alt="Hostel"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-white bg-opacity-40 backdrop-blur-sm"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 leading-tight">
          Govt Hostel Complaint Management System
        </h1>

        {/* Kannada Subtitle */}
        <p className="text-lg md:text-xl mt-4 text-blue-700 font-medium">
          ಹಾಸ್ಟೆಲ್ ದೂರು ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ – ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸುಲಭ, ಸುರಕ್ಷಿತ ಸೇವೆ
        </p>

        {/* Action Buttons - Square Style */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            to="/raise-complaint"
            className="bg-blue-700 text-white px-6 py-3 border border-blue-800 shadow hover:bg-blue-800 transition-all"
          >
            Raise Complaint
          </Link>
          <Link
            to="/track-complaint"
            className="bg-white text-blue-700 px-6 py-3 border border-blue-700 shadow hover:bg-blue-100 transition-all"
          >
            Track Status
          </Link>
          <Link
            to="/register"
            className="bg-slate-100 text-slate-800 px-6 py-3 border border-slate-400 shadow hover:bg-slate-200 transition-all"
          >
            Create Account
          </Link>
        </div>

        {/* Navigation Links (optional tabs) */}
        <div className="flex justify-center gap-6 mt-12 text-sm text-blue-800 font-semibold">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/categories" className="hover:underline">Categories</Link>
          <Link to="/sectors" className="hover:underline">Sectors</Link>
          <Link to="/contribute" className="hover:underline">Contribute</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
