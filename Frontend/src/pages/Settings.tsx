import React, { useState } from "react";
import { useAuthStore } from "../lib/auth";
import { usersAPI } from "../lib/api";
import { Link } from "react-router-dom";
import {
	CheckCircle2,
	AlertCircle,
	Trash2,
	Shield,
	Wifi,
	KeyRound,
	Globe,
	Bell,
	SlidersHorizontal,
	Clock,
} from "lucide-react";

const Settings: React.FC = () => {
	const { user, logout, updateUser } = useAuthStore();
	const [isOnline, setIsOnline] = useState<boolean>(!!user?.isOnline);
	const [savingOnline, setSavingOnline] = useState(false);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [pwSuccess, setPwSuccess] = useState<string | null>(null);
	const [pwError, setPwError] = useState<string | null>(null);
	const [pwLoading, setPwLoading] = useState(false);

	const [delConfirm, setDelConfirm] = useState("");
	const [delError, setDelError] = useState<string | null>(null);
	const [delLoading, setDelLoading] = useState(false);

	// Additional preferences
	const [showInMatching, setShowInMatching] = useState<boolean>(true);
	const [publicProfile, setPublicProfile] = useState<boolean>(true);
	const [language, setLanguage] = useState<string>("en");
	const [timezone, setTimezone] = useState<string>(
		Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
	);
	const [preferredTimes, setPreferredTimes] = useState<string>(
		"Evenings and weekends"
	);
	const [notifEmail, setNotifEmail] = useState<boolean>(true);
	const [notifProduct, setNotifProduct] = useState<boolean>(false);
	const [prefsSaving, setPrefsSaving] = useState<boolean>(false);
	const [prefsMsg, setPrefsMsg] = useState<string | null>(null);

	const handleOnlineToggle = async (value: boolean) => {
		setSavingOnline(true);
		try {
			setIsOnline(value);
			await usersAPI.updateOnlineStatus(value);
		} catch (e: any) {
			// rollback on failure
			setIsOnline((prev) => !prev);
		} finally {
			setSavingOnline(false);
		}
	};

	const savePreferences = async (e: React.FormEvent) => {
		e.preventDefault();
		setPrefsMsg(null);
		setPrefsSaving(true);
		try {
			const preferences = {
				showInMatching,
				publicProfile,
				language,
				timezone,
				preferredTimes,
				notifications: {
					email: notifEmail,
					productUpdates: notifProduct,
				},
			};
			const res = await usersAPI.updateProfile({ preferences });
			const updated = res.data?.data ?? res.data?.user ?? { preferences };
			// Update local auth store (tolerate extra fields)
			updateUser({ ...(user as any), ...updated });
			setPrefsMsg("Preferences saved.");
		} catch (e: any) {
			setPrefsMsg(
				e?.response?.data?.message ||
					e?.message ||
					"Failed to save preferences"
			);
		} finally {
			setPrefsSaving(false);
		}
	};

	const reopenCookieDecision = () => {
		try {
			localStorage.removeItem("cookieConsent");
			localStorage.removeItem("auth-storage");
			// Do not remove authToken here automatically; user can re-accept. A reload will show banner.
		} catch {}
		window.location.reload();
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		setPwSuccess(null);
		setPwError(null);
		if (!currentPassword || !newPassword) {
			setPwError("Please fill out both fields.");
			return;
		}
		setPwLoading(true);
		try {
			await usersAPI.updatePassword({ currentPassword, newPassword });
			setPwSuccess("Password updated successfully.");
			setCurrentPassword("");
			setNewPassword("");
		} catch (e: any) {
			setPwError(
				e?.response?.data?.message ||
					e?.message ||
					"Failed to update password"
			);
		} finally {
			setPwLoading(false);
		}
	};

	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		setDelError(null);
		if (delConfirm !== "DELETE") {
			setDelError("Type DELETE to confirm.");
			return;
		}
		setDelLoading(true);
		try {
			await usersAPI.deleteAccount();
			// Log out locally after deletion
			logout();
			window.location.href = "/";
		} catch (e: any) {
			setDelError(
				e?.response?.data?.message ||
					e?.message ||
					"Failed to delete account"
			);
		} finally {
			setDelLoading(false);
		}
	};

	return (
		<div className='relative min-h-screen bg-[#0b0c0d] pt-24 pb-16'>
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
			</div>
			<div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8'>System Settings</h1>

				{/* Match & Profile Preferences */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68]'>
							<SlidersHorizontal className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>
							Protocol Preferences
						</h2>
					</div>
					<form onSubmit={savePreferences} className='space-y-6'>
						{prefsMsg && (
							<div
								className={`text-sm font-medium ${
									prefsMsg.includes("saved")
										? "text-[#00ef68]"
										: "text-red-400"
								}`}
							>
								{prefsMsg}
							</div>
						)}
						<div className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5'>
							<div>
								<p className='text-white font-medium text-sm'>
									Matching Queue Discovery
								</p>
								<p className='text-white/40 text-xs mt-1'>
									Toggle visibility within the peer-to-peer matching engine.
								</p>
							</div>
							<label className='relative inline-flex items-center cursor-pointer'>
								<input
									type='checkbox'
									className='sr-only peer'
									checked={showInMatching}
									onChange={(e) => setShowInMatching(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ef68]"></div>
							</label>
						</div>
						<div className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5'>
							<div>
								<p className='text-white font-medium text-sm'>Public Indexing</p>
								<p className='text-white/40 text-xs mt-1'>
									Allow your technical profile to be indexed by other developers.
								</p>
							</div>
							<label className='relative inline-flex items-center cursor-pointer'>
								<input
									type='checkbox'
									className='sr-only peer'
									checked={publicProfile}
									onChange={(e) => setPublicProfile(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ef68]"></div>
							</label>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<label className='block text-xs font-bold text-white/40 uppercase tracking-widest mb-2'>
									Execution Window
								</label>
								<input
									type='text'
									value={preferredTimes}
									onChange={(e) => setPreferredTimes(e.target.value)}
									className='w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm'
									placeholder='e.g., Weeknights 19:00 - 22:00'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-white/40 uppercase tracking-widest mb-2'>
									System Timezone
								</label>
								<div className='flex items-center gap-2'>
									<input
										type='text'
										value={timezone}
										onChange={(e) => setTimezone(e.target.value)}
										className='w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm'
										placeholder='Timezone identifier'
									/>
								</div>
							</div>
						</div>
						<button
							type='submit'
							disabled={prefsSaving}
							className='px-6 py-2.5 bg-[#00ef68] text-[#0b0c0d] rounded-2xl text-sm font-bold hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)] transition-all disabled:opacity-50'
						>
							{prefsSaving ? "Committing..." : "Save Preferences"}
						</button>
					</form>
				</div>

				{/* Online Status */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68]'>
							<Wifi className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>
							Network Availability
						</h2>
					</div>
					<p className='text-white/50 text-sm mb-6'>
						Manage your presence state within the real-time collaboration engine.
					</p>
					<div className='flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 w-fit'>
						<label className='relative inline-flex items-center cursor-pointer'>
							<input
								type='checkbox'
								className='sr-only peer'
								checked={isOnline}
								onChange={(e) => handleOnlineToggle(e.target.checked)}
								disabled={savingOnline}
							/>
							<div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ef68]"></div>
						</label>
						<span className={`text-sm font-bold uppercase tracking-widest ${isOnline ? "text-[#00ef68]" : "text-white/30"}`}>
							{isOnline ? "Online" : "Offline"}
						</span>
					</div>
				</div>

				{/* Change Password */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/60'>
							<KeyRound className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>
							Credential Management
						</h2>
					</div>
					<form onSubmit={handlePasswordChange} className='space-y-6'>
						{pwSuccess && (
							<div className='flex items-center gap-2 text-[#00ef68] text-sm font-medium'>
								<CheckCircle2 className='w-4 h-4' />
								<span>{pwSuccess}</span>
							</div>
						)}
						{pwError && (
							<div className='flex items-center gap-2 text-red-400 text-sm font-medium'>
								<AlertCircle className='w-4 h-4' />
								<span>{pwError}</span>
							</div>
						)}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<input
								type='password'
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className='w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm'
								placeholder='Existing credential'
							/>
							<input
								type='password'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className='w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#00ef68]/30 focus:ring-1 focus:ring-[#00ef68]/30 transition-all text-sm'
								placeholder='New credential'
							/>
						</div>
						<button
							type='submit'
							disabled={pwLoading}
							className='px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl text-sm font-bold transition-all disabled:opacity-50'
						>
							{pwLoading ? "Updating entropy..." : "Rotate Password"}
						</button>
					</form>
				</div>

				{/* Localization */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/60'>
							<Globe className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>Localization</h2>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<label className='block text-xs font-bold text-white/40 uppercase tracking-widest mb-2'>
								Interface Language
							</label>
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className='w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00ef68]/30 transition-all text-sm'
							>
								<option value='en'>English (Standard)</option>
								<option value='hi'>हिन्दी (Hindi)</option>
								<option value='es'>Español (Spanish)</option>
							</select>
						</div>
					</div>
				</div>

				{/* Notifications */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/60'>
							<Bell className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>
							Notification Protocol
						</h2>
					</div>
					<div className='space-y-4'>
						<label className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-all'>
							<span className='text-sm text-white/70'>
								Email Telemetry Alerts
							</span>
							<input
								type='checkbox'
								className='scale-110 accent-[#00ef68]'
								checked={notifEmail}
								onChange={(e) => setNotifEmail(e.target.checked)}
							/>
						</label>
						<label className='flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-all'>
							<span className='text-sm text-white/70'>
								Product Lifecycle Updates
							</span>
							<input
								type='checkbox'
								className='scale-110 accent-[#00ef68]'
								checked={notifProduct}
								onChange={(e) => setNotifProduct(e.target.checked)}
							/>
						</label>
					</div>
				</div>

				{/* Privacy */}
				<div className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/60'>
							<Shield className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>Security & Data</h2>
					</div>
					<p className='text-white/50 text-sm mb-6 leading-relaxed'>
						Manage local storage artifacts and session data. Review the complete protocol documentation.
					</p>
					<div className='flex flex-wrap items-center gap-4'>
						<button
							onClick={reopenCookieDecision}
							className='px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 text-sm font-semibold hover:border-[#00ef68]/30 hover:text-white transition-all'
						>
							Reset Preference Cache
						</button>
						<Link
							to='/privacy'
							className='text-[#00ef68] hover:text-white text-sm font-semibold transition-all'
						>
							Privacy Policy
						</Link>
					</div>
				</div>

				{/* Danger Zone */}
				<div className='rounded-3xl border border-red-500/20 bg-red-500/5 p-6'>
					<div className='flex items-center gap-3 mb-6'>
						<div className='p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400'>
							<Trash2 className='w-4 h-4' />
						</div>
						<h2 className='text-xl font-semibold text-white tracking-tight'>
							Termination Phase
						</h2>
					</div>
					<form onSubmit={handleDelete} className='space-y-4'>
						{delError && (
							<div className='flex items-center gap-2 text-red-400 text-sm font-medium'>
								<AlertCircle className='w-4 h-4' />
								<span>{delError}</span>
							</div>
						)}
						<p className='text-white/50 text-sm mb-2'>
							Enter <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm permanent record erasure.
						</p>
						<div className="flex gap-3">
							<input
								type='text'
								value={delConfirm}
								onChange={(e) => setDelConfirm(e.target.value)}
								className='flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 transition-all text-sm'
								placeholder='Confirmation string'
							/>
							<button
								type='submit'
								disabled={delLoading}
								className='px-6 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl text-sm font-bold transition-all disabled:opacity-50'
							>
								{delLoading ? "Processing..." : "Purge Account"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Settings;
