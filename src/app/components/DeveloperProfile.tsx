import { X, Code, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface DeveloperProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeveloperProfile({ isOpen, onClose }: DeveloperProfileProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Code className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Muzamil</h2>
            <p className="text-green-100 text-sm font-semibold">Full Stack Developer</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* About */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              About Me
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Passionate developer with expertise in building modern web applications. 
              Specialized in React, TypeScript, and creating seamless user experiences. 
              Love turning ideas into reality through clean, efficient code.
            </p>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Age</div>
                <div className="font-semibold">18 years</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="bg-green-600/20 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Contact</div>
                <a href="tel:9103594759" className="font-semibold hover:text-green-400 transition-colors">
                  +91 9103594759
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="bg-purple-600/20 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <a href="mailto:muzamil@developer.com" className="font-semibold hover:text-purple-400 transition-colors text-sm">
                  muzamil@developer.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="bg-orange-600/20 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-semibold">India</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-green-400 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB'].map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
