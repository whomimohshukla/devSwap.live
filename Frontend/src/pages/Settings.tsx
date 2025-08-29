import React, { useState } from "react";
import { useAuthStore } from "../lib/auth";
import { usersAPI } from "../lib/api";
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
		<div className='min-h-screen bg-black pt-24 pb-8'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<h1 className='text-3xl font-bold text-white mb-8'>Settings</h1>

				{/* Match & Profile Preferences */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-emerald-400'>
							<SlidersHorizontal className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>
							Match & Profile Preferences
						</h2>
					</div>
					<form onSubmit={savePreferences} className='space-y-4'>
						{prefsMsg && (
							<div
								className={`text-sm ${
									prefsMsg.includes("saved")
										? "text-emerald-400"
										: "text-red-400"
								}`}
							>
								{prefsMsg}
							</div>
						)}
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-white text-sm'>
									Show me in matching
								</p>
								<p className='text-gray-400 text-xs'>
									If off, you won't appear in match queue.
								</p>
							</div>
							<label className='relative inline-flex items-center cursor-pointer'>
								<input
									type='checkbox'
									className='sr-only peer'
									checked={showInMatching}
									onChange={(e) => setShowInMatching(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
							</label>
						</div>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-white text-sm'>Public profile</p>
								<p className='text-gray-400 text-xs'>
									Allow others to view your profile.
								</p>
							</div>
							<label className='relative inline-flex items-center cursor-pointer'>
								<input
									type='checkbox'
									className='sr-only peer'
									checked={publicProfile}
									onChange={(e) => setPublicProfile(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
							</label>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm text-gray-300 mb-1'>
									Preferred times
								</label>
								<input
									type='text'
									value={preferredTimes}
									onChange={(e) => setPreferredTimes(e.target.value)}
									className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
									placeholder='e.g., Weeknights 7-10pm'
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-300 mb-1'>
									Timezone
								</label>
								<div className='flex items-center gap-2'>
									<Clock className='w-4 h-4 text-gray-400' />
									<input
										type='text'
										value={timezone}
										onChange={(e) => setTimezone(e.target.value)}
										className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
										placeholder='Timezone, e.g., Asia/Kolkata'
									/>
								</div>
							</div>
						</div>
						<button
							type='submit'
							disabled={prefsSaving}
							className='px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm disabled:opacity-60'
						>
							{prefsSaving ? "Saving…" : "Save Preferences"}
						</button>
					</form>
				</div>

				{/* Online Status */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-emerald-400'>
							<Wifi className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>
							Availability
						</h2>
					</div>
					<p className='text-gray-400 text-sm mb-4'>
						Control whether other users see you as online and available
						for matches.
					</p>
					<div className='flex items-center gap-3'>
						<label className='relative inline-flex items-center cursor-pointer'>
							<input
								type='checkbox'
								className='sr-only peer'
								checked={isOnline}
								onChange={(e) => handleOnlineToggle(e.target.checked)}
								disabled={savingOnline}
							/>
							<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
						</label>
						<span className='text-sm text-gray-300'>
							{isOnline ? "Online" : "Offline"}
						</span>
					</div>
				</div>

				{/* Change Password */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-blue-400'>
							<KeyRound className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>
							Change Password
						</h2>
					</div>
					<form onSubmit={handlePasswordChange} className='space-y-4'>
						{pwSuccess && (
							<div className='flex items-center gap-2 text-emerald-400 text-sm'>
								<CheckCircle2 className='w-4 h-4' />
								<span>{pwSuccess}</span>
							</div>
						)}
						{pwError && (
							<div className='flex items-center gap-2 text-red-400 text-sm'>
								<AlertCircle className='w-4 h-4' />
								<span>{pwError}</span>
							</div>
						)}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<input
								type='password'
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Current password'
							/>
							<input
								type='password'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='New password'
							/>
						</div>
						<button
							type='submit'
							disabled={pwLoading}
							className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-60'
						>
							{pwLoading ? "Updating…" : "Update Password"}
						</button>
					</form>
				</div>

				{/* Localization */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-indigo-400'>
							<Globe className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>Language</h2>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm text-gray-300 mb-1'>
								App Language
							</label>
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
							>
								<option value='en'>English</option>
								<option value='hi'>हिन्दी (Hindi)</option>
								<option value='es'>Español (Spanish)</option>
							</select>
						</div>
					</div>
				</div>

				{/* Notifications */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-yellow-400'>
							<Bell className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>
							Notifications
						</h2>
					</div>
					<div className='space-y-4'>
						<label className='flex items-center justify-between'>
							<span className='text-sm text-gray-300'>
								Email notifications
							</span>
							<input
								type='checkbox'
								className='scale-110'
								checked={notifEmail}
								onChange={(e) => setNotifEmail(e.target.checked)}
							/>
						</label>
						<label className='flex items-center justify-between'>
							<span className='text-sm text-gray-300'>
								Product updates
							</span>
							<input
								type='checkbox'
								className='scale-110'
								checked={notifProduct}
								onChange={(e) => setNotifProduct(e.target.checked)}
							/>
						</label>
					</div>
				</div>

				{/* Privacy */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-purple-400'>
							<Shield className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>Privacy</h2>
					</div>
					<p className='text-gray-300 text-sm mb-3'>
						Manage how we store data in your browser. You can review our
						policy on the
						<a
							className='text-indigo-400 hover:text-indigo-300 underline ml-1'
							href='/privacy'
						>
							Privacy page
						</a>
						.
					</p>
					<div className='flex items-center gap-3'>
						<button
							onClick={reopenCookieDecision}
							className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700'
						>
							Change cookie decision
						</button>
						<span className='text-xs text-gray-400'>
							This will reload the page and show the cookie banner again.
						</span>
					</div>
				</div>

				{/* Danger Zone */}
				<div className='bg-gray-900 rounded-xl p-6 border border-gray-800'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='p-2 rounded-lg bg-gray-800 text-red-400'>
							<Trash2 className='w-4 h-4' />
						</div>
						<h2 className='text-lg font-semibold text-white'>
							Danger Zone
						</h2>
					</div>
					<form onSubmit={handleDelete} className='space-y-3'>
						{delError && (
							<div className='flex items-center gap-2 text-red-400 text-sm'>
								<AlertCircle className='w-4 h-4' />
								<span>{delError}</span>
							</div>
						)}
						<p className='text-gray-400 text-sm'>
							Type DELETE to confirm account deletion.
						</p>
						<input
							type='text'
							value={delConfirm}
							onChange={(e) => setDelConfirm(e.target.value)}
							className='w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
							placeholder='DELETE'
						/>
						<button
							type='submit'
							disabled={delLoading}
							className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-60'
						>
							{delLoading ? "Deleting…" : "Delete Account"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Settings;
