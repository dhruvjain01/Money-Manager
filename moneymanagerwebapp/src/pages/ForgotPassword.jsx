import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/Input.jsx";
import { validateEmail } from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid Email Address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      if (response.status === 200) {
        toast.success(response.data || "If this email is registered, a reset link has been sent");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 px-4">
      <div className="w-full max-w-md bg-white/85 backdrop-blur rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email and we will send a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 p-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-lg font-medium cursor-pointer flex justify-center items-center gap-2 ${
              isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin w-5 h-5" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="text-sm text-center text-gray-700">
            Back to{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
