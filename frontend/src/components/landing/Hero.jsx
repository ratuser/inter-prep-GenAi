import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 hero-glow" />

            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />


            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-emerald-400"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI-Powered Interview Preparation
                </motion.div>


                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6"
                >
                    Ace Your Next{' '}
                    <span className="gradient-text">Interview</span>
                    <br />
                    With Confidence
                </motion.h1>


                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Upload your resume, practice with AI-generated questions tailored to your target role, and get personalized feedback to land your dream job.
                </motion.p>


                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/auth"
                        className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105"
                    >
                        Start Practicing
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#how-it-works"
                        className="group flex items-center gap-2 px-8 py-3.5 rounded-xl glass glass-hover text-gray-300 hover:text-white font-semibold text-base transition-all duration-300"
                    >
                        <Play className="w-4 h-4" />
                        See How It Works
                    </a>
                </motion.div>


                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                >
                    {[
                        { value: '10K+', label: 'Users' },
                        { value: '95%', label: 'Success Rate' },
                        { value: '500+', label: 'Companies' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>


            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a120e] to-transparent" />
        </section>
    );
}
