import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Reset token is missing.");
        setValidating(false);
        return;
      }

      try {
        await axiosConfig.post(API_ENDPOINTS.VALIDATE_RESET_TOKEN, { token });
        setIsTokenValid(true);
      } catch (err) {
        setError(err.response?.data?.error || "Reset link is invalid or expired.");
        setIsTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword,
      });
      if (response.status === 200) {
        toast.success("Password updated successfully. Please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 px-4">
      <div className="w-full max-w-md bg-white/85 backdrop-blur rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>

        {validating ? (
          <div className="flex items-center justify-center py-6 text-gray-700 gap-2">
            <LoaderCircle className="animate-spin w-5 h-5" />
            Validating reset link...
          </div>
        ) : !isTokenValid ? (
          <div className="text-center space-y-3">
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-md">{error}</p>
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 p-2 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white rounded-lg font-medium cursor-pointer flex justify-center items-center gap-2 ${
                isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin w-5 h-5" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>

            <p className="text-sm text-center text-gray-700">
              Back to{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
