import { Sparkles, Github, Linkedin, Twitter } from 'lucide-react';

const footerLinks = {
    Product: ['Features', 'How It Works', 'Testimonials'],
    Company: ['About Us', 'Careers', 'Blog'],
    Support: ['Help Center', 'Contact', 'Privacy Policy'],
};

const socialLinks = [
    // { icon: Twitter, href: '#', label: 'Twitter' },
    // { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/ratuser', label: 'GitHub' },
];

export default function Footer() {
    return (
        <footer className="relative border-t border-emerald-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    
                    <div className="md:col-span-2">
                        <a href="#" className="flex items-center gap-2 mb-4 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Inter<span className="gradient-text">Prep</span>
                            </span>
                        </a>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
                            AI-powered interview preparation platform that helps you land your dream job with confidence.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-9 h-9 rounded-lg glass glass-hover flex items-center justify-center text-gray-500 hover:text-emerald-400 transition-all duration-300"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {/* {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-300">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))} */}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} InterPrep. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-600">
                        Built with{' '}
                        <span className="text-emerald-500">♥</span>
                        {' '}for job seekers everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
