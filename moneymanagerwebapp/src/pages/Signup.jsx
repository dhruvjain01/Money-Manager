import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { assets } from "../assets/assets.js";
import Input from "../components/Input.jsx";
import { validateEmail } from "../util/validation.js";
import { LoaderCircle } from "lucide-react"; 
import { toast } from "react-hot-toast";
import axiosConfig from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    setIsLoading(true);

    // Basic validation
    if (!fullName.trim()) {
      setError("Please enter your Full Name");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid Email Address");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    setError("");

    // Signup API call
    try {
      //upload image if present
      if (profilePhoto) {
        const imageUrl = await uploadProfileImage(profilePhoto);
        profileImageUrl = imageUrl || "";
      }
      
      // Construct payload
      const payload = {
        fullName,
        email,
        password,
      };

      // Only include profileImageUrl if available
      if (profileImageUrl) {
        payload.profileImageUrl = profileImageUrl;
      }
      const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, payload);
      if (response.status === 201) {
        toast.success("Account created. Please check your email and verify your account before login.");
        navigate("/login", {
          state: {
            activationNotice: `We sent an activation link to ${email}. Please verify your account before logging in.`,
          },
        });
      }
    } catch (err) {
      console.error("Something went wrong", err);
      setError(err.response?.data?.error || err.message || "Signup failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500">
      {/* Background image */}
      <img
        src={assets.login_bg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto transition-transform duration-300 hover:scale-[1.01] hover:shadow-indigo-200/50">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Create An Account
          </h3>
          <p className="text-base text-gray-600 text-center mb-8">
            Start Tracking Your Spendings
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center mb-6">
                <ProfilePhotoSelector image={profilePhoto} setImage={setProfilePhoto} />
            </div>
            <div>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
              className="focus:ring-2 focus:ring-indigo-500"
            />

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              className="focus:ring-2 focus:ring-indigo-500"
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="••••••••"
              type="password"
              className="focus:ring-2 focus:ring-indigo-500"
            />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 p-2 rounded-md animate-pulse">
                {error}
              </p>
            )}

            <button
              disabled={isLoading}
              className={`w-full py-3 text-lg font-medium text-white rounded-lg shadow-md transition-all flex items-center justify-center cursor-pointer gap-2
                ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
                }`}
              type="submit"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin w-5 h-5" />
                  Signing Up...
                </>
              ) : (
                "SIGN UP"
              )}
            </button>

            <div className="flex items-center justify-center mt-4">
              <span className="h-[1px] w-16 bg-gray-300"></span>
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <span className="h-[1px] w-16 bg-gray-300"></span>
            </div>

            <p className="text-sm text-gray-700 text-center mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
