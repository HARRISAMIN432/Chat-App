import React, { useState } from "react";
import assets from "../assets/assets";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currentState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col sm:flex-row items-center justify-center px-4 sm:px-8 md:px-16 gap-8 backdrop-blur-2xl">
      <img
        src={assets.logo_big}
        alt="Logo"
        className="w-[150px] sm:w-[200px] md:w-[250px] object-contain"
      />

      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-[400px] md:w-[450px] border bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-xl sm:text-2xl flex justify-between items-center">
          {currentState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="toggle"
              className="cursor-pointer w-5"
              onClick={() => {
                setCurrentState(
                  currentState === "Sign up" ? "Sign in" : "Sign up"
                );
                setIsDataSubmitted(false);
              }}
            />
          )}
        </h2>

        {currentState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Full Name"
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {currentState === "Sign up" && isDataSubmitted && (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short bio about yourself..."
          ></textarea>
        )}

        <button className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:opacity-90 transition">
          {currentState === "Sign up" ? "Sign up" : "Sign in"}
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className="flex flex-col gap-2">
          {currentState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrentState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>{" "}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account{" "}
              <span
                onClick={() => setCurrentState("Sign up")}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>{" "}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
