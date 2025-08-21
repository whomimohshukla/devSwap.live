import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../lib/auth";

const AuthCallback: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { checkAuth } = useAuthStore();
	const [message, setMessage] = useState<string>("Finishing sign-in...");

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get("token");
		const error = params.get("error");

		if (error) {
			setMessage(decodeURIComponent(error));
			return;
		}

		if (token) {
			try {
				localStorage.setItem("authToken", token);
				// Verify token and fetch profile, then go to dashboard
				checkAuth()
					.then(() => navigate("/dashboard"))
					.catch(() => navigate("/login"));
			} catch {
				navigate("/login");
			}
		} else {
			// Some providers may send hash fragments, try parsing that as well
			const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
			const hashToken = hash.get("token");
			if (hashToken) {
				localStorage.setItem("authToken", hashToken);
				checkAuth()
					.then(() => navigate("/dashboard"))
					.catch(() => navigate("/login"));
			} else {
				navigate("/login");
			}
		}
	}, [location.search, location.hash, checkAuth, navigate]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-[#0b0c0d] px-6'>
			<div className='text-center'>
				<div className='w-8 h-8 mx-auto mb-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
				<p className='text-white/80'>{message}</p>
			</div>
		</div>
	);
};

export default AuthCallback;
