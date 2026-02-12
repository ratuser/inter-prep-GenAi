import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Software Engineer at Google',
        avatar: 'PS',
        rating: 5,
        quote: 'InterPrep\'s AI questions were incredibly close to what I was actually asked. The role-matching feature helped me focus on the right positions.',
    },
    {
        name: 'Rahul Mehta',
        role: 'Data Analyst at Amazon',
        avatar: 'RM',
        rating: 5,
        quote: 'I was unsure about which role suited me best. InterPrep analyzed my resume and suggested Data Analytics — and I got the job within a month!',
    },
    {
        name: 'Ananya Reddy',
        role: 'Product Manager at Microsoft',
        avatar: 'AR',
        rating: 5,
        quote: 'The course recommendations filled the gaps in my knowledge. The practice interviews gave me the confidence I needed to ace my PM interviews.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export default function Testimonials() {
    return (
        <section id="testimonials" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">Testimonials</span>
                    <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold">
                        Loved by{' '}
                        <span className="gradient-text">Thousands</span>
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
                        See what our users have to say about their interview prep journey with InterPrep.
                    </p>
                </motion.div>

                {/* Testimonial Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {testimonials.map((testimonial) => (
                        <motion.div
                            key={testimonial.name}
                            variants={cardVariants}
                            className="glass glass-hover rounded-2xl p-6 transition-all duration-300"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-sm font-bold text-white">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
