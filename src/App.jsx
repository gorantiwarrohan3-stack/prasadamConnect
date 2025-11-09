import React, { useEffect, useState } from 'react';
import Login from './Login.jsx';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfile, updateUserProfile } from './api.js';

export default function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [userProfile, setUserProfile] = useState(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState(null);
	const [showProfile, setShowProfile] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({ name: '', email: '', address: '' });
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
		});
		return () => unsub();
	}, []);

	// Fetch user profile when user is authenticated
	useEffect(() => {
		if (user?.uid) {
			setProfileLoading(true);
			setProfileError(null);
			getUserProfile(user.uid)
				.then((response) => {
					if (response.success && response.user) {
						setUserProfile(response.user);
						setEditForm({
							name: response.user.name || '',
							email: response.user.email || '',
							address: response.user.address || '',
						});
					} else {
						setProfileError('Failed to load profile');
					}
				})
				.catch((err) => {
					console.error('Error fetching user profile:', err);
					setProfileError(err.message || 'Failed to load profile');
				})
				.finally(() => {
					setProfileLoading(false);
				});
		} else {
			setUserProfile(null);
		}
	}, [user]);

	const handleProfileClick = () => {
		if (isEditing) {
			setIsEditing(false);
			setShowProfile(true);
			return;
		}
		setShowProfile(prev => !prev);
	};

	const handleEdit = () => {
		// Ensure form is prefilled with current user profile data
		if (userProfile) {
			setEditForm({
				name: userProfile.name || '',
				email: userProfile.email || '',
				address: userProfile.address || '',
			});
		}
		setShowProfile(true);
		setIsEditing(true);
		setSaveError(null);
		setSaveSuccess(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setSaveError(null);
		setSaveSuccess(false);
		// Reset form to original values
		if (userProfile) {
			setEditForm({
				name: userProfile.name || '',
				email: userProfile.email || '',
				address: userProfile.address || '',
			});
		}
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setSaveError(null);
		setSaveSuccess(false);

		try {
			const response = await updateUserProfile(user.uid, {
				name: editForm.name.trim(),
				email: editForm.email.trim(),
				address: editForm.address.trim(),
			});

			if (response.success && response.user) {
				setUserProfile(response.user);
				setIsEditing(false);
				setSaveSuccess(true);
				setTimeout(() => setSaveSuccess(false), 3000);
			} else {
				setSaveError(response.error || 'Failed to update profile');
			}
		} catch (err) {
			console.error('Error updating profile:', err);
			setSaveError(err.message || 'Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (field, value) => {
		setEditForm(prev => ({ ...prev, [field]: value }));
	};

	if (loading) return <div className="app-shell"><div className="card"><div>Loading...</div></div></div>;

	if (!user) return <Login />;

	return (
		<>
			<div className="topbar">
				<div className="brand" />
				<div className="brand-name">Prasadam Connect</div>
				<div className="nav-menu">
					<button 
						className={`nav-menu-item ${(showProfile || isEditing) ? 'active' : ''}`}
						onClick={handleProfileClick}
					>
						Profile
					</button>
					<button 
						className="nav-menu-item"
						onClick={() => signOut(auth)}
					>
						Sign Out
					</button>
				</div>
			</div>
			<div className="hello">
				<h1>Hello {userProfile?.name || 'User'}</h1>
				<p>Welcome to Prasadam Connect</p>
				
				{/* Profile Section */}
				{(showProfile || isEditing) && (
					<div className="profile-section">
						<h2 className="profile-title">Account</h2>
						{profileLoading ? (
							<div className="profile-loading">Loading profile...</div>
						) : profileError ? (
							<div className="profile-error">{profileError}</div>
						) : userProfile ? (
							<div className="profile-details">
								{!isEditing ? (
									<>
										<div className="profile-item">
											<div className="profile-label">Name</div>
											<div className="profile-value">{userProfile.name || 'Not provided'}</div>
										</div>
										<div className="profile-item">
											<div className="profile-label">Email</div>
											<div className="profile-value">{userProfile.email || 'Not provided'}</div>
										</div>
										<div className="profile-item">
											<div className="profile-label">Phone Number</div>
											<div className="profile-value">{userProfile.phoneNumber || 'Not provided'}</div>
											<div className="profile-note">Phone number cannot be changed</div>
										</div>
										<div className="profile-item">
											<div className="profile-label">Address</div>
											<div className="profile-value">{userProfile.address || 'Not provided'}</div>
										</div>
										<div className="profile-actions">
											<button className="btn" onClick={handleEdit}>Edit Profile</button>
										</div>
									</>
								) : (
									<form onSubmit={handleSave} className="profile-edit-form">
										<div className="profile-item">
											<label className="profile-label" htmlFor="edit-name">Name</label>
											<input
												id="edit-name"
												type="text"
												className="input"
												value={editForm.name}
												onChange={(e) => handleInputChange('name', e.target.value)}
												required
											/>
										</div>
										<div className="profile-item">
											<label className="profile-label" htmlFor="edit-email">Email</label>
											<input
												id="edit-email"
												type="email"
												className="input"
												value={editForm.email}
												onChange={(e) => handleInputChange('email', e.target.value)}
												required
											/>
										</div>
										<div className="profile-item">
											<label className="profile-label">Phone Number</label>
											<div className="profile-value">{userProfile.phoneNumber || 'Not provided'}</div>
											<div className="profile-note">Phone number cannot be changed</div>
										</div>
										<div className="profile-item">
											<label className="profile-label" htmlFor="edit-address">Address</label>
											<input
												id="edit-address"
												type="text"
												className="input"
												value={editForm.address}
												onChange={(e) => handleInputChange('address', e.target.value)}
												required
											/>
										</div>
										{saveError && (
											<div className="profile-error" style={{ marginBottom: '12px' }}>{saveError}</div>
										)}
										{saveSuccess && (
											<div className="profile-success" style={{ marginBottom: '12px' }}>Profile updated successfully!</div>
										)}
										<div className="profile-actions">
											<button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
												Cancel
											</button>
											<button type="submit" className="btn" disabled={saving}>
												{saving ? 'Saving...' : 'Save Changes'}
											</button>
										</div>
									</form>
								)}
							</div>
						) : null}
					</div>
				)}
			</div>
		</>
	);
}


