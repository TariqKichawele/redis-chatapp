import { User } from '@/db/dummy';
import React from 'react'

interface ChatLayoutProps {
    defaultLayout: number[] | undefined;
    users: User[];
}

const ChatLayout = ({ defaultLayout = [ 320, 480 ], users }: ChatLayoutProps) => {
  return (
    <div>ChatLayout</div>
  )
}

export default ChatLayout