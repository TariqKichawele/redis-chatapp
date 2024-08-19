'use server';

import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

type SendMessageProps = {
    content: string;
    receiverId: string;
    messageType: 'text' | 'image';
}

export async function sendMessageAction({ content, messageType, receiverId }: SendMessageProps) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if(!user) throw new Error('User not authenticated');

    const senderId = user.id;

    const conversationId = `conversation:${[senderId, receiverId].sort().join(':')}`;

    const conversationExists = await redis.exists(conversationId);

    if(!conversationExists) {
        await redis.hmset(conversationId, {
            participant1: senderId,
            participant2: receiverId,
        });

        await redis.sadd(`user:${senderId}:conversations`, conversationId);
        await redis.sadd(`user:${receiverId}:conversations`, conversationId);
    }

    const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    await redis.hmset(messageId, {
        senderId,
        content,
        messageType,
        timestamp,
    });

    await redis.zadd(`${conversationId}:messages`, { 
        score: timestamp, 
        member: JSON.stringify(messageId) 
    });

    return { success: true, conversationId, messageId };
}