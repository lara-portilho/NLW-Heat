import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
	id: string;
	login: string;
	name: string;
	avatar_url: string;
};

type AuthContextData = {
	user: User | null;
	signInUrl: string;
	loading: boolean;
	signOut: () => void;
};

type AuthProvider = {
	children: ReactNode;
};

type AuthResponse = {
	token: string;
	user: {
		id: string;
		login: string;
		name: string;
		avatar_url: string;
	};
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=551d0821955d36ad9c58`;

	async function signIn(code: string) {
		setLoading(true);

		const response = await api.post<AuthResponse>("/authenticate", {
			code,
		});

		const { token, user } = response.data;
		localStorage.setItem("@DoWhile.token", token);
		api.defaults.headers.common.authorization = `Bearer ${token}`;
		setUser(user);
		setLoading(false);
	}

	function signOut() {
		setUser(null);
		localStorage.removeItem("@DoWhile.token");
	}

	useEffect(() => {
		setLoading(true);
		const token = localStorage.getItem("@DoWhile.token");

		if (token) {
			api.defaults.headers.common.authorization = `Bearer ${token}`;
			api.get<User>("/profile").then((res) => {
				setUser(res.data);
			});
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		const url = window.location.href;
		const hasGithubCode = url.includes("?code=");

		if (hasGithubCode) {
			const [urlWithoutCode, githubCode] = url.split("?code=");
			window.history.pushState({}, "", urlWithoutCode);
			signIn(githubCode);
		}
	}, []);

	return (
		<AuthContext.Provider value={{ user, signInUrl, signOut, loading }}>
			{props.children}
		</AuthContext.Provider>
	);
}
