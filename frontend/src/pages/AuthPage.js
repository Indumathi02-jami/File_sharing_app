import { motion } from "framer-motion";
import { useState } from "react";

import MotionButton from "../components/MotionButton";
import { useAuth } from "../context/AuthContext";
import { pageTransition, shakeMotion } from "../utils/animations";
import { getErrorMessage } from "../utils/getErrorMessage";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main className="auth-layout" {...pageTransition}>
      <motion.section className="hero-panel" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
        <p className="eyebrow">Smart File Sharing and Collaboration Platform</p>
        <h1>Share files securely, organize work faster, and keep every upload within reach.</h1>
        <p>
          This MERN app combines JWT authentication, drag-and-drop uploads, shareable links, file search, filtering,
          and pagination in one responsive dashboard.
        </p>
        <div className="hero-tags">
          <span>JWT Secure</span>
          <span>Fast Uploads</span>
          <span>Share Links</span>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>All-in-one</strong>
            <span>auth, uploads, sharing</span>
          </div>
          <div>
            <strong>Responsive</strong>
            <span>desktop and mobile ready</span>
          </div>
        </div>
      </motion.section>

      <motion.section className="auth-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.04 }}>
        <div className="auth-switch">
          <MotionButton type="button" className={mode === "login" ? "active auth-tab" : "auth-tab"} onClick={() => setMode("login")}>
            Login
          </MotionButton>
          <MotionButton type="button" className={mode === "signup" ? "active auth-tab" : "auth-tab"} onClick={() => setMode("signup")}>
            Signup
          </MotionButton>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup ? (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          ) : null}

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />

          {error ? (
            <motion.p className="form-error" {...shakeMotion}>
              {error}
            </motion.p>
          ) : null}

          <MotionButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </MotionButton>
        </form>
      </motion.section>
    </motion.main>
  );
}

export default AuthPage;
