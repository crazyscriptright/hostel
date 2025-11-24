import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Shield, 
  ChevronRight, 
  Star,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const AnimatedHeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    floating: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const statsData = [
    { number: "500+", label: "Hostels Managed", icon: Building2 },
    { number: "10K+", label: "Students Served", icon: Users },
    { number: "50K+", label: "Complaints Resolved", icon: MessageSquare },
    { number: "99.9%", label: "System Uptime", icon: Shield }
  ];

  const features = [
    "Real-time Complaint Tracking",
    "Automated Room Allocation", 
    "Digital Payment Integration",
    "24/7 Student Support"
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20"
          animate={floatingVariants.floating}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-100 rounded-full opacity-20"
          animate={floatingVariants.floating}
          transition={{ delay: 1, duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-100 rounded-full opacity-20"
          animate={floatingVariants.floating}
          transition={{ delay: 2, duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div 
        className="relative z-10 container mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Star className="w-4 h-4 mr-2 fill-current" />
                Trusted by 500+ Government Institutions
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Modern{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Hostel
                </motion.span>
                <br />
                Management
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your government hostel operations with our comprehensive digital platform. 
                Streamline student management, automate processes, and enhance the hostel experience.
              </p>
            </motion.div>

            {/* Feature List */}
            <motion.div variants={itemVariants} className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Right Content - Animated Dashboard Preview */}
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 transform"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Dashboard Overview</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {statsData.slice(0, 2).map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{stat.number}</p>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                        <stat.icon className="w-8 h-8 text-blue-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  {['Occupancy Rate', 'Complaint Resolution', 'Student Satisfaction'].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{item}</span>
                        <span className="text-gray-800 font-medium">{85 + index * 5}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${85 + index * 5}%` }}
                          transition={{ delay: 1.5 + index * 0.2, duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart representation */}
                <motion.div 
                  className="bg-gray-50 rounded-xl p-4 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Monthly Trends</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-end space-x-2 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-t"
                        style={{ width: '12px' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 2.2 + index * 0.1, duration: 0.5 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg"
              animate={floatingVariants.floating}
              transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Real-time Updates</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-4 rounded-xl shadow-lg"
              animate={floatingVariants.floating}
              transition={{ delay: 1.5, duration: 2.5, repeat: Infinity }}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Secure Platform</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
          variants={itemVariants}
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.5 + index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-blue-600" />
              </div>
              <motion.h3 
                className="text-3xl font-bold text-gray-900 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3 + index * 0.1, type: "spring", stiffness: 300 }}
              >
                {stat.number}
              </motion.h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedHeroSection;