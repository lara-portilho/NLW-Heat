import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

interface IAccessTokenRespone {
	access_token: string;
}

interface IUserResponse {
	id: number;
	login: string;
	name: string;
	avatar_url: string;
}

class AuthenticateUserService {
	async execute(code: string) {
		const url = "https://github.com/login/oauth/access_token";

		const { data: accessTokeResponse } =
			await axios.post<IAccessTokenRespone>(url, null, {
				params: {
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
				},
				headers: {
					Accept: "application/json",
				},
			});

		const response = await axios.get<IUserResponse>(
			"https://api.github.com/user",
			{
				headers: {
					authorization: `Bearer ${accessTokeResponse.access_token}`,
				},
			}
		);

		const { id, login, name, avatar_url } = response.data;

		let user = await prismaClient.user.findFirst({
			where: {
				github_id: id,
			},
		});

		if (!user) {
			user = await prismaClient.user.create({
				data: {
					github_id: id,
					login,
					name,
					avatar_url,
				},
			});
		}

		const token = sign(
			{
				user: {
					id: user.id,
					name: user.name,
					avatar_url: user.avatar_url,
				},
			},
			process.env.JWT_SECRET,
			{
				subject: user.id,
				expiresIn: "1d",
			}
		);

		return { token, user };
	}
}

export { AuthenticateUserService };
