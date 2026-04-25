import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets.js";
import Input from "../components/Input.jsx";
import { validateEmail } from "../util/validation.js";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosConfig from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { AppContext } from "../context/AppContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useContext(AppContext);
  const activationNotice = location.state?.activationNotice || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
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

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (response.status === 200) {
        const { userId, email: loggedInEmail, token } = response.data;

        const existingUser = JSON.parse(localStorage.getItem("user") || "null");

        // Update context and persist to localStorage
        const userData = {
          userId,
          fullName:
            existingUser?.email === loggedInEmail
              ? existingUser.fullName
              : loggedInEmail?.split("@")?.[0] || "User",
          email: loggedInEmail,
          profileImageUrl: existingUser?.email === loggedInEmail ? existingUser.profileImageUrl : null,
        };
        setAuthSession({ token, userData });

        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const backendError = err.response?.data?.error || "Login failed. Please try again.";
      if (backendError.toLowerCase().includes("verify your email")) {
        setError("Please verify your email first. Check inbox/spam for the activation link, then try logging in.");
      } else {
        setError(backendError);
      }
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
            Welcome Back
          </h3>
          <p className="text-base text-gray-600 text-center mb-8">
            Please enter your credentials to login
          </p>

          {activationNotice && (
            <p className="text-blue-700 text-sm text-center bg-blue-50 border border-blue-100 p-2 rounded-md mb-4">
              {activationNotice}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  Logging In...
                </>
              ) : (
                "LOGIN"
              )}
            </button>

            <div className="flex items-center justify-center mt-4">
              <span className="h-[1px] w-16 bg-gray-300"></span>
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <span className="h-[1px] w-16 bg-gray-300"></span>
            </div>

            <p className="text-sm text-gray-700 text-center mt-6">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Signup
              </Link>
            </p>
            <p className="text-sm text-gray-700 text-center mt-2">
              Forgot password?{" "}
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Reset here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
