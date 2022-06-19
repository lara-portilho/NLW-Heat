import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSessions from "expo-auth-session";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
	id: string;
	login: string;
	name: string;
	avatar_url: string;
};

type AuthContextData = {
	user: User | null;
	isSigningIn: boolean;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
};

type AuthProviderProps = {
	children: React.ReactNode;
};

type AuthResponse = {
	token: string;
	user: User;
};

type AuthorizationResponse = {
	params: {
		code?: string;
		err?: string;
	};
	type?: string;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
	const [isSigningIn, setIsSigningIn] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		async function loadUser() {
			const userStorage = await AsyncStorage.getItem("@DoWhile.user");
			const tokenStorage = await AsyncStorage.getItem("@DoWhile.token");

			if (userStorage && tokenStorage) {
				api.defaults.headers.common[
					"Authorization"
				] = `Bearer ${tokenStorage}`;
				setUser(JSON.parse(userStorage));
			}
		}

		loadUser();

		setIsSigningIn(false);
	}, []);

	async function signIn() {
		setIsSigningIn(true);
		try {
			const authUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=a2c10d29b82c866219c8`;
			const authSessionResponse = (await AuthSessions.startAsync({
				authUrl,
			})) as AuthorizationResponse;

			if (
				authSessionResponse.type === "success" &&
				authSessionResponse.params.err !== "access_denied"
			) {
				const authResponse = await api.post("/authenticate", {
					code: authSessionResponse.params.code,
				});

				const { user, token } = authResponse.data as AuthResponse;
				api.defaults.headers.common[
					"Authorization"
				] = `Bearer ${token}`;
				await AsyncStorage.setItem(
					"@DoWhile.user",
					JSON.stringify(user)
				);
				await AsyncStorage.setItem("@DoWhile.token", token);
				setUser(user);
			}
		} catch (err) {
			console.log(err);
		} finally {
			setIsSigningIn(false);
		}
	}

	async function signOut() {
		setUser(null);
		await AsyncStorage.removeItem("@DoWhile.user");
		await AsyncStorage.removeItem("@DoWhile.token");
	}

	return (
		<AuthContext.Provider value={{ signIn, signOut, user, isSigningIn }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	return context;
}
