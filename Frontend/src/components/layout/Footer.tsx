import React from "react";
import { Link } from "react-router-dom";
import { Terminal, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		product: [
			{ name: "Features", href: "/features" },
			{ name: "Skills", href: "/skills" },
			{ name: "Roadmaps", href: "/roadmaps" },
			{ name: "Learn", href: "/learn" },
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
			{ name: "Status", href: "/status" },
		],
		legal: [
			{ name: "Privacy Policy", href: "/privacy" },
			{ name: "Terms of Service", href: "/terms" },
			{ name: "Cookie Policy", href: "/cookies" },
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
		<footer className='bg-[#0b0c0d] border-t border-white/5'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				{/* Main Footer Content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12'>
					{/* Brand Section */}
					<div className='lg:col-span-2'>
						<Link
							to='/'
							className='flex items-center space-x-2 group mb-6'
						>
							<div className='relative'>
								<Terminal className='h-7 w-7 text-[#00ef68] transition-transform duration-300 group-hover:scale-110' />
							</div>
							<span className='text-xl font-bold text-white tracking-tight'>
								DevSwap<span className='text-[#00ef68]'>.</span>live
							</span>
						</Link>
						<p className='text-white/50 text-sm leading-relaxed mb-8 max-w-xs'>
							The modern platform for developers to exchange skills,
							collaborate in real-time, and accelerate their learning journey.
						</p>
						<div className='flex space-x-3'>
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									target='_blank'
									rel='noopener noreferrer'
									className='p-2.5 text-white/40 hover:text-[#00ef68] hover:bg-white/5 rounded-xl transition-all duration-300'
									aria-label={social.name}
								>
									<social.icon className='h-5 w-5' />
								</a>
							))}
						</div>
					</div>

					{/* Product Links */}
					<div>
						<h3 className='text-white text-sm font-semibold mb-6 uppercase tracking-wider'>Product</h3>
						<ul className='space-y-4'>
							{footerLinks.product.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-white/50 hover:text-[#00ef68] text-sm transition-colors duration-200'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className='text-white text-sm font-semibold mb-6 uppercase tracking-wider'>Company</h3>
						<ul className='space-y-4'>
							{footerLinks.company.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-white/50 hover:text-[#00ef68] text-sm transition-colors duration-200'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support Links */}
					<div>
						<h3 className='text-white text-sm font-semibold mb-6 uppercase tracking-wider'>Support</h3>
						<ul className='space-y-4'>
							{footerLinks.support.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-white/50 hover:text-[#00ef68] text-sm transition-colors duration-200'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Links */}
					<div>
						<h3 className='text-white text-sm font-semibold mb-6 uppercase tracking-wider'>Legal</h3>
						<ul className='space-y-4'>
							{footerLinks.legal.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className='text-white/50 hover:text-[#00ef68] text-sm transition-colors duration-200'
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className='mt-20 pt-8 border-t border-white/5'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-6'>
						<p className='text-white/40 text-xs tracking-wide'>
							© {currentYear} DEVSWAP. ALL RIGHTS RESERVED.
						</p>
						<div className='flex items-center space-x-8'>
							<span className='text-white/40 text-xs tracking-wide'>
								BUILT FOR DEVELOPERS
							</span>
							<div className='flex items-center space-x-2.5'>
								<div className='w-1.5 h-1.5 bg-[#00ef68] rounded-full animate-pulse shadow-[0_0_8px_#00ef68]'></div>
								<span className='text-white/60 text-xs font-medium tracking-wide uppercase'>
									System Status: Operational
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
