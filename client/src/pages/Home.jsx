import React, { useState, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";

const Home = () => {
  const { user, token } = useSelector((state) => state.user);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (token) {
      const socket = getSocket();
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("requestOnlineUsers");
      });
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
      socket.on("userOnline", (data) => {
        console.log("User presence update:", data);
      });
      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("userOnline");
        socket.disconnect();
      };
    }
  }, [token]);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <ChatContainer
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <RightSidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </div>
    </div>
  );
};

export default Home;
