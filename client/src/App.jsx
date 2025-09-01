import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthContext } from "./context/authContext";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster />
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Login />} />
        <Route path="/login" element={!authUser ? <Login /> : <Home />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Login />} />
      </Routes>
    </div>
  );
};

export default App;
