"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"

/**
 * Auth entry: sign in or create an account. A single quiet surface on a plain
 * canvas — the form is the focus. The brand mark anchors the top; switching
 * modes crossfades the form (reduced-motion aware).
 */
export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const reduce = useReducedMotion()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 font-sans">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            F
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your portfolio."
              : "Set up Folyo and launch your portfolio."}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New to Folyo?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setMode("register")}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
