//app/auth/register.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await authService.register({ username, password, role });
      router.push("/auth/login");
      const message = "Register berhasil, Silahkan login";
      toast.success(message);
    } catch (err: any) {
      // Error dari backend akan muncul di sini
      const message = err?.response?.data?.error || "Register gagal, periksa username dan password!";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <img src="/bg-dummy.jpg" className="rounded-xl mb-4" alt="" />
        <h1 className="text-2xl font-bold mb-4">Register</h1>

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

        <Select onValueChange={setRole} value={role}>
          <SelectTrigger className="mb-3 w-full">
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleRegister} className="w-full mb-2">
          Register
        </Button>
        <p className="text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-black hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
