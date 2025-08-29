import React from "react";
import { Link } from "react-router-dom";
import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		product: [
			{ name: "Features", href: "/features" },
			{ name: "Skills", href: "/skills" },
			{ name: "How it Works", href: "/how-it-works" },
			{ name: "Pricing", href: "/pricing" },
		],
		company: [
			{ name: "About", href: "/about" },
			{ name: "Blog", href: "/blog" },
			{ name: "Careers", href: "/careers" },
			{ name: "Contact", href: "/contact" },
		],
		support: [
			{ name: "Help Center", href: "/help" },
			{ name: "Community", href: "/community" },
			{ name: "Documentation", href: "/docs" },
			{ name: "Status", href: "/status" },
		],
		legal: [
			{ name: "Privacy Policy", href: "/privacy" },
			{ name: "Terms of Service", href: "/terms" },
			{ name: "Cookie Policy", href: "/cookies" },
			{ name: "GDPR", href: "/gdpr" },
		],
	};

	const socialLinks = [
		{
			name: "GitHub",
			icon: Github,
			href: "https://github.com/whomimohshukla",
		},
		{
			name: "Twitter",
			icon: Twitter,
			href: "https://twitter.com/whomimohshukla",
		},
		{
			name: "LinkedIn",
			icon: Linkedin,
			href: "https://linkedin.com/Mimohshukla0",
		},
		{ name: "Email", icon: Mail, href: "mailto:hello@devswap.live" },
	];

	return (
		<footer className='bg-black border-t border-gray-800'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{/* Main Footer Content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
					{/* Brand Section */}
					<div className='lg:col-span-2'>
						<Link
							to='/'
							className='flex items-center space-x-2 group mb-4'
						>
							<div className='relative'>
								<Code2 className='h-8 w-8 text-emerald-500 group-hover:text-emerald-400 transition-colors' />
								<div className='absolute -inset-1 bg-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity' />
							</div>
							<span className='text-xl font-bold text-white group-hover:text-emerald-400 transition-colors'>
								DevSwap.live
							</span>
						</Link>
						<p className='text-gray-400 text-sm leading-relaxed mb-6'>
							The premier platform for developers and engineers to
							exchange skills, learn from each other, and grow together
							through real-time collaboration.
						</p>
						<div className='flex space-x-4'>
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									target='_blank'
									rel='noopener noreferrer'
									className='p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-800 rounded-lg transition-colors'
									aria-label={social.name}
								>
									<social.icon className='h-5 w-5' />
								</a>
							))}
						</div>
					</div>

					{/* Product Links */}
					<div>
						<h3 className='text-white font-semibold mb-4'>Product</h3>
						<ul className='space-y-3'>
							{footerLinks.product.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-gray-400 hover:text-white text-sm transition-colors'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className='text-white font-semibold mb-4'>Company</h3>
						<ul className='space-y-3'>
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-gray-400 hover:text-white text-sm transition-colors'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support Links */}
					<div>
						<h3 className='text-white font-semibold mb-4'>Support</h3>
						<ul className='space-y-3'>
							{footerLinks.support.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-gray-400 hover:text-white text-sm transition-colors'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Links */}
					<div>
						<h3 className='text-white font-semibold mb-4'>Legal</h3>
						<ul className='space-y-3'>
							{footerLinks.legal.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-gray-400 hover:text-white text-sm transition-colors'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className='mt-12 pt-8 border-t border-gray-800'>
					<div className='flex flex-col md:flex-row justify-between items-center'>
						<p className='text-gray-400 text-sm'>
							© {currentYear} DevSwap.live. All rights reserved.
						</p>
						<div className='flex items-center space-x-6 mt-4 md:mt-0'>
							<span className='text-gray-400 text-sm'>
								Made with ❤️ for developers
							</span>
							<div className='flex items-center space-x-2'>
								<div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
								<span className='text-gray-400 text-sm'>
									All systems operational
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
