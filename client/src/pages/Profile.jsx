import React, { useState, useEffect } from "react";
import assets from "../assets/assets";
import { getUserProfile, updateProfile } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setName(response.user.fullName);
        setBio(response.user.bio || "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("bio", bio);
      if (selectedImage) {
        formData.append("profilePic", selectedImage);
      }
      await updateProfile(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center px-4">
      <div className="w-full max-w-2xl backdrop-blur-xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-8 sm:p-10 flex-1 w-full"
        >
          <h3 className="text-lg font-semibold">Profile Details</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : assets.avatar_icon
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-sm">Upload Profile Image</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio..."
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          ></textarea>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-purple-400 to-violet-600 rounded-md 
             hover:from-purple-500 hover:to-violet-700 cursor-pointer transition-colors duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-2 border cursor-pointer border-gray-500 rounded-md 
             hover:bg-gray-100 hover:text-gray-900 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
        <div className="flex flex-col items-center justify-center gap-3 p-6">
          <img
            src={
              selectedImage
                ? URL.createObjectURL(selectedImage)
                : assets.avatar_icon
            }
            alt="preview"
            className="w-28 h-28 rounded-full object-cover border border-gray-500"
          />
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-gray-400 text-center">{bio}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
