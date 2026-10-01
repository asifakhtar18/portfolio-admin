"use client"

import Link from "next/link"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Folyo</h1>
          <p className="text-gray-500 mt-2">
            Create your account and launch your portfolio
          </p>
        </div>

        <RegisterForm />

        <div className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/" className="font-medium text-gray-900 underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
