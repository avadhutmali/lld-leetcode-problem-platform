import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/cn';
import { Input } from '../components/ui/Input';

type Problem = {
	id: string;
	title: string;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	description: string;
};

const HomePage: React.FC = () => {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [difficulty, setDifficulty] = useState<'All' | Problem['difficulty']>('All');

	useEffect(() => {
		const loadProblems = async () => {
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
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return problems.filter((p) => {
			const matchesQuery = !q || p.title.toLowerCase().includes(q);
			const matchesDifficulty = difficulty === 'All' || p.difficulty === difficulty;
			return matchesQuery && matchesDifficulty;
		});
	}, [problems, query, difficulty]);

	const difficultyVariant = (d: Problem['difficulty']) => {
		if (d === 'Easy') return 'easy' as const;
		if (d === 'Medium') return 'medium' as const;
		return 'hard' as const;
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">Problems</h1>
					<p className="text-sm text-[#8b949e]">Practice LLD problems in a LeetCode-style workspace.</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search title…"
						className="sm:w-72"
					/>
					<div className="flex items-center gap-1">
						{(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
							<button
								key={d}
								onClick={() => setDifficulty(d)}
								className={cn(
									'h-9 px-3 rounded-md text-sm border transition-colors',
									difficulty === d
										? 'border-[#30363d] bg-[#161b22] text-[#c9d1d9]'
										: 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
								)}
							>
								{d}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="border border-[#30363d] rounded-xl bg-[#0d1117] overflow-hidden">
				{error ? <div className="px-4 py-3 text-sm text-rose-300 bg-rose-950/40 border-b border-rose-900/40">{error}</div> : null}
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-[#161b22] text-[#8b949e]">
							<tr className="border-b border-[#30363d]">
								<th className="px-4 py-3 text-left font-medium w-12">#</th>
								<th className="px-4 py-3 text-left font-medium">Title</th>
								<th className="px-4 py-3 text-left font-medium w-32">Difficulty</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td className="px-4 py-6 text-[#8b949e]" colSpan={3}>
										Loading problems…
									</td>
								</tr>
							) : filtered.length === 0 ? (
								<tr>
									<td className="px-4 py-10 text-[#8b949e]" colSpan={3}>
										No problems found.
									</td>
								</tr>
							) : (
								filtered.map((p, idx) => (
									<tr key={p.id} className="border-b border-[#161b22] hover:bg-[#161b22]/60">
										<td className="px-4 py-3 text-[#8b949e]">{idx + 1}</td>
										<td className="px-4 py-3">
											<Link
												to={`/solve/${p.id}`}
												className="font-medium text-[#c9d1d9] hover:text-[#ffa116]"
											>
												{p.title}
											</Link>
											<div className="text-xs text-[#8b949e] line-clamp-1">{p.description}</div>
										</td>
										<td className="px-4 py-3">
											<Badge variant={difficultyVariant(p.difficulty)}>{p.difficulty}</Badge>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
