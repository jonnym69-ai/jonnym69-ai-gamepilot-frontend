import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'

export default function Donate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Support GamePilot 🚀
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                GamePilot is free and always will be. But if you find it valuable, 
                your support helps keep the servers running and the recommendations coming.
              </p>
            </motion.div>

            {/* Donation Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/5 border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    ☕ One-Time Support
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Keep GamePilot running with a one-time donation.
                  </p>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-white mb-2">
                      £5
                    </div>
                    <p className="text-gray-400 text-sm">
                      Coffee fuel for late-night coding sessions
                    </p>
                  </div>
                  <motion.a
                    href="https://github.com/sponsors/jonnym69"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Buy Me a Coffee ☕
                  </motion.a>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/5 border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    🚀 Monthly Support
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Help GamePilot grow with monthly support.
                  </p>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-white mb-2">
                      £15
                    </div>
                    <p className="text-gray-400 text-sm">
                      Keep recommendations flowing all month
                    </p>
                  </div>
                  <motion.a
                    href="https://github.com/sponsors/jonnym69"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Support Monthly 🌱
                  </motion.a>
                </Card>
              </motion.div>
            </div>

            {/* Support Platforms */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-white/5 border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  💝 Support GamePilot
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.a
                      href="https://patreon.com/GamePilot?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
                    >
                      <div className="text-2xl">🎗</div>
                      <div>
                        <p className="text-white font-semibold">Patreon</p>
                        <p className="text-gray-400 text-sm">Support ongoing development</p>
                      </div>
                    </motion.a>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.a
                      href="https://www.crowdfunder.co.uk/p/qr/VlDoA4dy?utm_campaign=sharemodal&utm_medium=referral&utm_source=shortlink"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      <div className="text-2xl">🎯</div>
                      <div>
                        <p className="text-white font-semibold">Crowdfunder</p>
                        <p className="text-gray-400 text-sm">Help fund new features</p>
                      </div>
                    </motion.a>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <p className="text-white font-semibold">Star on GitHub</p>
                      <p className="text-gray-400 text-sm">Help others discover GamePilot</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">🐛</div>
                    <div>
                      <p className="text-white font-semibold">Report Issues</p>
                      <p className="text-gray-400 text-sm">Help improve GamePilot</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💬</div>
                    <div>
                      <p className="text-white font-semibold">Spread the Word</p>
                      <p className="text-gray-400 text-sm">Tell friends about GamePilot</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>



            {/* Back to Home */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-center"
            >
              <Link
                to="/"
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <motion.span
                  whileHover={{ x: 5 }}
                  className="mr-2"
                >
                  ← Back to GamePilot
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
