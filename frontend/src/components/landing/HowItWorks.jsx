import { motion } from 'framer-motion';
import { Upload, MessageSquare, Trophy } from 'lucide-react';

const steps = [
    {
        icon: Upload,
        step: '01',
        title: 'Upload Your Resume',
        description: 'Simply upload your resume and tell us the role you\'re targeting. Our AI does the rest.',
    },
    {
        icon: MessageSquare,
        step: '02',
        title: 'Practice with AI',
        description: 'Answer AI-generated interview questions tailored to your skills and target position.',
    },
    {
        icon: Trophy,
        step: '03',
        title: 'Get Your Results',
        description: 'Receive role-fit analysis, performance feedback, and personalized course recommendations.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: 'easeOut' },
    },
};

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 sm:py-32">
            {/* Subtle Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">How It Works</span>
                    <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold">
                        Three Simple{' '}
                        <span className="gradient-text">Steps</span>
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
                        From resume to results in minutes. Our streamlined process makes interview prep effortless.
                    </p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
                >
                    {/* Connecting Line (desktop only) */}
                    <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                    {steps.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.step}
                                variants={stepVariants}
                                className="relative text-center group"
                            >
                                {/* Step Number */}
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 rounded-2xl glass group-hover:border-emerald-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                                        <Icon className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                        {item.step}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
