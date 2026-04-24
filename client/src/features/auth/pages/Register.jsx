import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { authApi } from "../../../lib/api/auth.api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ROLES = [
  { value: "student", label: "Student", emoji: "🎓", desc: "Learn & grow" },
  { value: "mentor", label: "Mentor", emoji: "👨‍🏫", desc: "Teach & guide" },
];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      return setError(
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
      );
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      const continueUrl = `${window.location.origin}/auth/action`;
      await sendEmailVerification(cred.user, { url: continueUrl });

      try {
        await authApi.register({
          name: form.name.trim(),
          role,
          college: form.college.trim(),
        });
      } catch (backendErr) {
        console.error("Backend registration error:", backendErr.message);
      }

      navigate("/verify-email");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak.",
      };
      setError(messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white text-xl font-black mb-4">
            E
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">Join EduHub — it's free</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
              I am joining as a…
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-150 ${
                    role === opt.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span
                    className={`text-sm font-bold ${role === opt.value ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="College / Faculty"
              name="college"
              placeholder="Faculty of Science"
              value={form.college}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min 8 chars, upper + lower + number"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create {role === "mentor" ? "Mentor" : "Student"} Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
