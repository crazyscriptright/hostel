import React from "react";
import {
  FaUserCheck,
  FaIdBadge,
  FaTachometerAlt,
  FaUpload,
  FaComments,
} from "react-icons/fa";
import { motion } from "framer-motion";

const ComplaintGuide = () => {
  const steps = [
    {
      icon: <FaUserCheck className="text-indigo-400 text-3xl" />,
      title: "Step 1: Hostel Eligibility",
      description:
        "Ensure you belong to one of the hostels listed on this platform before proceeding.",
    },
    {
      icon: <FaIdBadge className="text-yellow-400 text-3xl" />,
      title: "Step 2: Register & Login",
      description:
        "Sign up using your SHID (Student Hostel ID) and securely login to your account.",
    },
    {
      icon: <FaTachometerAlt className="text-green-400 text-3xl" />,
      title: "Step 3: Access Student Dashboard",
      description:
        "After login, you’ll be redirected to your personal dashboard to manage complaints.",
    },
    {
      icon: <FaUpload className="text-pink-400 text-3xl" />,
      title: "Step 4: Upload Proof & Raise Complaint",
      description:
        "Upload valid proof such as photos or documents and submit your complaint with necessary details.",
    },
    {
      icon: <FaComments className="text-blue-400 text-3xl" />,
      title: "Step 5: Track & Provide Feedback",
      description:
        "Track the status of your complaint and share your feedback once it’s resolved.",
    },
  ];

  const cardVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction === "left" ? -80 : 80,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen px-6 py-16 flex flex-col items-center">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-indigo-400">
          How to Raise a Complaint
        </h2>
        <p className="mt-4 text-slate-300 text-lg">
          Follow these simple steps to submit your hostel complaint and get it
          resolved efficiently.
        </p>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 w-1 bg-slate-700 h-full transform -translate-x-1/2"></div>

        {steps.map((step, index) => {
          const isLeft = index % 2 === 0; // Alternate left/right

          return (
            <motion.div
              key={index}
              className="relative mb-16"
              custom={isLeft ? "left" : "right"}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 top-10 transform -translate-x-1/2 z-10">
                <div className="w-5 h-5 rounded-full bg-indigo-500 shadow-lg border-4 border-slate-900"></div>
              </div>

              {/* Card - Message Bubble Style */}
              <div
                className={`relative flex ${
                  isLeft ? "justify-end pr-[55%]" : "justify-start pl-[55%]"
                }`}
              >
                <div className="relative bg-slate-800/90 backdrop-blur-md border border-indigo-500/40 shadow-xl rounded-xl p-6 w-[80%] hover:shadow-2xl hover:scale-[1.02] transition duration-300">
                  {/* Arrow Pointer */}
                  <div
                    className={`absolute top-8 w-4 h-4 rotate-45 bg-slate-800 border border-indigo-500/40 ${
                      isLeft
                        ? "-right-2 border-l-0 border-b-0"
                        : "-left-2 border-r-0 border-t-0"
                    }`}
                  ></div>

                  {/* Content */}
                  <div className="flex items-center gap-4">
                    {step.icon}
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-slate-300 text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Final Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-16 text-center max-w-2xl"
      >
        <p className="text-lg text-slate-300">
          ✅ Following these steps ensures your complaint is properly recorded,
          tracked, and resolved without delays.
        </p>
        <button className="mt-6 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition">
          Go to Complaint Portal
        </button>
      </motion.div>
    </section>
  );
};

export default ComplaintGuide;
