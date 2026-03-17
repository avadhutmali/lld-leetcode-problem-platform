import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProblems } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Problem = {
	id: string;
	title: string;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	description: string;
};

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			navigate('/auth', { replace: true });
		}
	}, [authLoading, isAuthenticated, navigate]);

	useEffect(() => {
		const loadProblems = async () => {
			if (!isAuthenticated) return;

			setLoading(true);
			setError(null);
			try {
				const data = await getProblems();
				setProblems(data);
			} catch {
				setError('Unable to load problems');
			} finally {
				setLoading(false);
			}
		};

		loadProblems();
	}, [isAuthenticated]);

	if (authLoading) {
		return <div className="h-screen bg-[#101012] text-gray-300 flex items-center justify-center">Loading session...</div>;
	}

	return (
		<div className="min-h-screen bg-[#101012] text-white">
			<header className="border-b border-gray-800 bg-[#16161a] px-6 py-4 flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">LLD Practice Dashboard</h1>
					<p className="text-sm text-gray-400">Welcome, {user?.email}</p>
				</div>
				<button
					onClick={logout}
					className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-sm"
				>
					Logout
				</button>
			</header>

			<main className="px-6 py-6">
				{error ? <p className="text-rose-400 mb-4">{error}</p> : null}
				{loading ? <p className="text-gray-400">Loading problems...</p> : null}

				<div className="grid md:grid-cols-2 gap-4">
					{problems.map((problem) => (
						<Link
							key={problem.id}
							to={`/solve/${problem.id}`}
							className="block p-4 border border-gray-800 rounded-lg bg-[#19191f] hover:border-teal-600 transition-colors"
						>
							<div className="flex items-center justify-between mb-2">
								<h2 className="font-semibold text-gray-100">{problem.title}</h2>
								<span className="text-xs text-teal-400">{problem.difficulty}</span>
							</div>
							<p className="text-sm text-gray-400 line-clamp-3">{problem.description}</p>
						</Link>
					))}
				</div>
			</main>
		</div>
	);
};

export default HomePage;
