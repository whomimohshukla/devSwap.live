import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuthStore } from "../../lib/auth";
import AssistantBar from "../assistant/AssistantBar";
import DemoRecorder from "../dev/DemoRecorder";

interface AppLayoutProps {
	children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const { checkAuth, isAuthenticated } = useAuthStore();
	const [showCookieBanner, setShowCookieBanner] = useState(false);
	const location = useLocation();
	const isHome = location.pathname === "/";
	const isDashboard = location.pathname.startsWith("/dashboard");
	const isMatches = location.pathname.startsWith("/matches");
	const showDemoRecorder = ((import.meta as any).env?.VITE_DEMO_RECORD || "false") === "true";

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		// Show cookie banner only if not previously accepted and user not authenticated
		const consent = localStorage.getItem("cookieConsent");
		if (!consent && !isAuthenticated) {
			setShowCookieBanner(true);
		} else {
			setShowCookieBanner(false);
		}
	}, [isAuthenticated]);

	const acceptCookies = () => {
		try {
			localStorage.setItem("cookieConsent", "accepted");
		} catch (_) {
			// ignore storage errors
		}
		setShowCookieBanner(false);
	};

	const declineCookies = () => {
		try {
			localStorage.setItem("cookieConsent", "declined");
			// remove any previously stored token
			localStorage.removeItem("authToken");
			// clear persisted auth store if present
			localStorage.removeItem("auth-storage");
		} catch (_) {
			// ignore storage errors
		}
		setShowCookieBanner(false);
	};

	return (
		<div className='min-h-screen bg-[#0b0c0d] flex flex-col'>
			<Navbar />
			{/* Global AI Assistant Bar (hidden on home page and any dashboard path) */}
			{!isHome && !isDashboard && !isMatches && <AssistantBar />}

			{/* Add top padding to offset fixed navbar (h-16 = 64px), bottom padding above footer, and responsive horizontal padding */}
			<main className='flex-1 pt-16 pb-12 px-4 sm:px-6 lg:px-8'>
				{children || <Outlet />}
			</main>
			{/* Cookie Consent Banner */}
			{showCookieBanner && (
				<div className='fixed inset-x-0 bottom-0 z-50'>
					<div className='mx-auto max-w-5xl m-4'>
						<div className='rounded-lg bg-gray-900/95 border border-gray-700 px-4 py-3 sm:px-6 sm:py-4 shadow-xl'>
							<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-200'>
								<p className='text-sm leading-6'>
									We use cookies and local storage to remember your
									login and improve your experience. By clicking
									Accept, you agree to our use of cookies as described
									in our privacy policy.
								</p>
								<div className='flex items-center gap-3'>
									<a
										className='text-sm text-gray-400 hover:text-gray-200 underline'
										href='/privacy'
									>
										Learn more
									</a>
									<button
										onClick={declineCookies}
										className='inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400'
									>
										Decline
									</button>
									<button
										onClick={acceptCookies}
										className='inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400'
									>
										Accept
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Dev-only Demo Recorder overlay */}
			{showDemoRecorder && <DemoRecorder />}
			<Footer />
		</div>
	);
};

export default AppLayout;
