import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTA() {
    return (
        <section id="cta" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-3xl glass p-12 sm:p-16 text-center"
                >
                    
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />

                    
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 text-sm text-emerald-400">
                            <Zap className="w-4 h-4" />
                            Start for Free
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Ready to{' '}
                            <span className="gradient-text">Ace Your Interview?</span>
                        </h2>

                        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                            Join thousands of job seekers who landed their dream roles with InterPrep. Your next career move starts here.
                        </p>

                        <a
                            href="#"
                            className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 animate-pulse-glow"
                        >
                            Get Started Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
