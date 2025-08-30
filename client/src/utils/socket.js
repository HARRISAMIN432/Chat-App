import io from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket || !socket.connected) {
    const token = localStorage.getItem("token");
    if (token) {
      socket = io("http://localhost:3000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
  }
  return socket;
};

export const connectSocket = (token) => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:3000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
