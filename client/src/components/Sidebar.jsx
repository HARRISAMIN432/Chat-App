import React, { useState, useEffect } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../utils/socket";
import { getAllUsers, searchUsers, logout } from "../utils/api";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("userOnline", (data) => {
      console.log("Received userOnline:", data);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === data.userId
            ? { ...u, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : u
        )
      );
    });

    socket.on("onlineUsers", (data) => {
      console.log("Received onlineUsers:", data);
      setUsers((prev) =>
        prev.map((u) =>
          data.onlineUserIds.includes(u._id)
            ? { ...u, isOnline: true }
            : { ...u, isOnline: false }
        )
      );
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error in Sidebar:", err);
    });

    return () => {
      socket.off("userOnline");
      socket.off("onlineUsers");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.users);
        const socket = getSocket();
        if (socket && socket.connected) {
          console.log("Emitting requestOnlineUsers");
          socket.emit("requestOnlineUsers");
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      let response;
      if (e.target.value.trim() === "") {
        response = await getAllUsers();
      } else {
        response = await searchUsers(e.target.value);
      }
      setUsers(response.users);
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("Emitting requestOnlineUsers after search");
        socket.emit("requestOnlineUsers");
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={handleLogout} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#282142] rounded-full flex items-center gap-2eneo py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search user..."
          />
        </div>
      </div>
      <div className="flex flex-col">
        {users.map((user, index) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && "bg-[#282142]/50"
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="Profile Picture"
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              <span>{user.isOnline ? "Online" : "Offline"}</span>
            </div>
            {!user.isOnline && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {index + 1}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
