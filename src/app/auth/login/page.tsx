// app/auth/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async () => {
  try {
    const data = await authService.login({ username, password });

    // Simpan token dan role
    document.cookie = `token=${data.token}; path=/; secure; samesite=strict`;
    document.cookie = `role=${data.role}; path=/; secure; samesite=strict`;

    // Redirect berdasarkan role
    if (data.role === "Admin") {
      router.push("/adminpage");
      const message = "Login berhasil";
      toast.success(message);
    } else if (data.role === "User") {
      router.push("/userpage/article");
      const message = "Login berhasil";
      toast.success(message);
    } else {
      toast.error("Role tidak dikenal");
    }
  } catch (err: any) {
    // Error dari backend akan muncul di sini
    const message = err?.response?.data?.error || "Login gagal, periksa username dan password!";
    toast.error(message);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <img src="/bg-dummy.jpg" className="rounded-xl mb-4" alt="" />
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        <Button onClick={handleLogin} className="w-full mb-2">
          Login
        </Button>
        <p className="text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-black hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
