import React, { useEffect, useState } from 'react';
import Login from './Login.jsx';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
		});
		return () => unsub();
	}, []);

	if (loading) return <div className="app-shell"><div className="card"><div>Loading...</div></div></div>;

	if (!user) return <Login />;

	return (
		<>
			<div className="topbar">
				<div className="brand" />
				<div className="brand-name">Prasadam Connect</div>
			</div>
			<div className="hello">
				<h1>Hello World</h1>
				<p>Signed in as: {user.phoneNumber || 'Unknown'}</p>
				<div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
					<button className="btn btn-secondary" onClick={() => signOut(auth)}>Sign out</button>
				</div>
			</div>
		</>
	);
}


