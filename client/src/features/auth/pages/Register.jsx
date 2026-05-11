import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { authApi } from "../../../lib/api/auth.api";
import { facultiesApi } from "../../../lib/api/faculties.api";
import { programsApi } from "../../../lib/api/programs.api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Dropdown";
import { EduHubLogo } from "../../../components/ui/Logo";
import RequestModal from "../../../components/common/RequestModal";
import { useToast } from "../../../hooks/useToasts";
import { ThemeToggleFixedCorner } from "../../../components/common/ThemeToggle";

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
    password: "",
    confirmPassword: "",
    faculty: "",
    year: "",
    program: "",
    university: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const { addToast } = useToast();

  // Request modal state
  const [requestModal, setRequestModal] = useState({
    isOpen: false,
    type: null,
  });

  // Fetch faculties on mount
  useEffect(() => {
    facultiesApi.getPublic()
      .then(data => {
        setFaculties(data?.data || data || []);
      })
      .catch(() => setFaculties([]))
      .finally(() => setFacultiesLoading(false));
  }, []);

  const selectedFaculty = faculties.find(f => f._id === form.faculty);
  const availableYearsRaw =
    selectedFaculty?.years?.filter((y) => y.active !== false) || [];
  const programStr =
    form.program && form.program !== "__request_new__"
      ? String(form.program)
      : "";
  const availableYears = programStr
    ? availableYearsRaw.filter((y) => {
        const yp = y.program;
        if (yp == null || yp === "") return true;
        const ypStr =
          typeof yp === "object" && yp?._id != null ? String(yp._id) : String(yp);
        return ypStr === programStr;
      })
    : availableYearsRaw;

  // Fetch programs when faculty changes
  useEffect(() => {
    if (form.faculty) {
      setProgramsLoading(true);
      programsApi.getByFaculty(form.faculty)
        .then(data => {
          setPrograms(data?.data || data || []);
        })
        .catch(() => setPrograms([]))
        .finally(() => setProgramsLoading(false));
    } else {
      setPrograms([]);
    }
  }, [form.faculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      // Reset dependent fields when faculty or year changes
      if (name === "faculty") {
        return { ...p, [name]: value, year: "", program: "" };
      }
      if (name === "program") {
        return { ...p, [name]: value, year: "" };
      }
      return { ...p, [name]: value };
    });
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
        const registerData = {
          name: form.name.trim(),
          role,
        };
        // Include faculty for all roles
        if (form.faculty) {
          registerData.faculty = form.faculty;
        }
        // Include year/program for students
        if (role === "student") {
          if (form.year) registerData.year = parseInt(form.year);
          if (form.program) registerData.program = form.program;
        }
        // Include university for mentors
        if (role === "mentor" && form.university) {
          registerData.university = form.university.trim();
        }
        await authApi.register(registerData);
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
    <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ThemeToggleFixedCorner />
      {/* Aurora blobs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-bg__blob-1" />
        <div className="aurora-bg__blob-2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <EduHubLogo className="w-14 h-14 rounded-[var(--radius-xl)] shadow-[var(--shadow-accent)]" />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-3)]">
            Join EduHub — it's free
          </p>
        </div>

        <div className="glass-strong rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-xl)]">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-[var(--text-xs)] font-bold uppercase tracking-wide text-[var(--color-text-3)] mb-3">
              I am joining as a…
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-center rounded-[var(--radius-xl)] border-2 p-4 text-center transition-all duration-[var(--duration-normal)] ${
                    role === opt.value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-border-2)] hover:border-[var(--color-accent)] hover:border-opacity-50"
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span
                    className={`text-[var(--text-sm)] font-bold ${
                      role === opt.value
                        ? "text-[var(--color-accent-2)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-[var(--radius-lg)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)] border-opacity-30 px-4 py-3 text-[var(--text-sm)] text-[var(--color-danger)]">
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
            {/* Faculty selection for all roles */}
            <div>
              <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                Faculty
              </label>
              <Select
                value={form.faculty}
                onChange={(val) => handleChange({ target: { name: "faculty", value: val } })}
                options={[
                  ...faculties.map(f => ({ value: f._id, label: `${f.code} - ${f.name}` })),
                  { value: "__request_new__", label: "+ Request New Faculty" },
                ]}
                placeholder={facultiesLoading ? "Loading..." : "Select faculty..."}
                disabled={facultiesLoading}
              />
              {form.faculty === "__request_new__" && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(p => ({ ...p, faculty: "" }));
                    setRequestModal({ isOpen: true, type: "add_faculty" });
                  }}
                  className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
                >
                  Click here to request a new faculty
                </button>
              )}
            </div>

            {role === "student" && form.faculty && form.faculty !== "__request_new__" && (
              <>
                <div>
                  <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                    Program
                  </label>
                  <Select
                    value={form.program}
                    onChange={(val) => handleChange({ target: { name: "program", value: val } })}
                    options={[
                      ...programs.map(p => ({ value: p._id, label: `${p.code} - ${p.name}` })),
                      { value: "__request_new__", label: "+ Request New Program" },
                    ]}
                    placeholder={programsLoading ? "Loading..." : "Select program..."}
                    disabled={programsLoading || !form.faculty}
                  />
                  {form.program === "__request_new__" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(p => ({ ...p, program: "" }));
                        setRequestModal({ isOpen: true, type: "add_program" });
                      }}
                      className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
                    >
                      Click here to request a new program
                    </button>
                  )}
                </div>

                {availableYears.length > 0 && (
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                      Year
                    </label>
                    <Select
                      value={form.year}
                      onChange={(val) => handleChange({ target: { name: "year", value: val } })}
                      options={availableYears.map(y => ({ value: String(y.year), label: y.name }))}
                      placeholder={
                        programStr ? "Select year..." : "Select program first to see your years"
                      }
                      disabled={!programStr}
                    />
                  </div>
                )}
              </>
            )}

            {role === "mentor" && (
              <Input
                label="University / Institution"
                name="university"
                placeholder="Cairo University"
                value={form.university}
                onChange={handleChange}
              />
            )}
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
              variant="gradient"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create {role === "mentor" ? "Mentor" : "Student"} Account
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-3)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-2)] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <RequestModal
        isOpen={requestModal.isOpen}
        onClose={() => setRequestModal({ isOpen: false, type: null })}
        type={requestModal.type}
        facultyId={form.faculty}
        isPublic={true}
        guestInfo={{ name: form.name, email: form.email }}
      />
    </div>
  );
}
