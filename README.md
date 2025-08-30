# Chat App Backend

A real-time chat application backend built with Express.js, Socket.io, and Supabase.

## Features

- User authentication (signup/signin)
- Real-time messaging with Socket.io
- File upload support for images
- User profile management
- Online/offline status tracking
- Message read receipts
- Search functionality

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase project and get your credentials
4. Copy `.env.example` to `.env` and fill in your configuration
5. Run migrations in your Supabase project
6. Start the server: `npm run dev`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Chats

- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat

### Messages

- `POST /api/messages/send` - Send message
- `GET /api/messages/chat/:chatId` - Get chat messages
- `GET /api/messages/user/:userId` - Get messages with specific user

### Upload

- `POST /api/upload/single` - Upload single file

## Socket Events

### Client to Server

- `joinChat` - Join a chat room
- `leaveChat` - Leave a chat room
- `typing` - Send typing indicator
- `stopTyping` - Stop typing indicator
- `messageRead` - Mark message as read

### Server to Client

- `newMessage` - Receive new message
- `userOnline` - User online/offline status update
- `userTyping` - Typing indicator
- `messageReadUpdate` - Message read receipt

## Environment Variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANO
```
