"use client"
import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Folyo</h1>
          <p className="text-gray-500 mt-2">
            {mode === "login"
              ? "Sign in to manage your portfolio"
              : "Create your account and launch your portfolio"}
          </p>
        </div>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-medium text-gray-900 underline"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-gray-900 underline"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
