import React, { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { styles } from "./styles";
import { Message, MessageProps } from "../Message";
import { api } from "../../services/api";
import io from "socket.io-client";

const socket = io(String(api.defaults.baseURL));

let messagesQueue: MessageProps[] = [];

socket.on("new_message", (newMessage) => {
	messagesQueue.push(newMessage);
});

export function MessageList() {
	const [currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);

	useEffect(() => {
		async function fetchMessages() {
			const messagesResponse = await api.get<MessageProps[]>(
				"/messages/last"
			);
			setCurrentMessages(messagesResponse.data);
		}

		fetchMessages();
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			if (messagesQueue.length > 0) {
				setCurrentMessages((prevState) =>
					[messagesQueue[0], prevState[0], prevState[1]].filter(
						Boolean
					)
				);
				messagesQueue.shift();
			}
		}, 3000);

		return () => clearInterval(timer);
	}, []);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="never"
		>
			{currentMessages.map((message) => {
				return <Message key={message.id} data={message} />;
			})}
		</ScrollView>
	);
}
