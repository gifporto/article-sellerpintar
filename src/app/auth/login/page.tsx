// app/auth/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import dummyData from "@/data/dummyData.json";

// Schema validasi dengan Zod
const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(8, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const DUMMY_USERS = dummyData.users;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await authService.login(values);

      // Simpan token dan role
      document.cookie = `token=${data.token}; path=/; secure; samesite=strict`;
      document.cookie = `role=${data.role}; path=/; secure; samesite=strict`;

      if (data.role === "Admin") {
        router.push("/adminpage");
        toast.success("Login berhasil");
      } else if (data.role === "User") {
        router.push("/userpage");
        toast.success("Login berhasil");
      } else {
        toast.error("Role tidak dikenal");
      }
    } catch (err: any) {
      // Jika API gagal, cek dummy data
      const dummyUser = DUMMY_USERS.find(
        (u) => u.username === values.username && u.password === values.password
      );

      if (dummyUser) {
        document.cookie = `token=${dummyUser.token}; path=/; secure; samesite=strict`;
        document.cookie = `role=${dummyUser.role}; path=/; secure; samesite=strict`;

        toast.success("Login menggunakan data backup (dummy)");
        router.push(dummyUser.role === "Admin" ? "/adminpage" : "/userpage");
      } else {
        const message =
          err?.response?.data?.error ||
          "Login gagal, periksa username dan password!";
        toast.error(message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center my-6">
          <img src="/assets/logo-frame.svg" className="h-6" alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-900 font-medium mb-2">
              Username
            </label>
            <Input
              placeholder="Input username"
              {...register("username")}
              className="mb-1"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-900 font-medium mb-2 pt-12">
              Password
            </label>
            <div className="relative">
              <Input
                placeholder="Input password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="mb-1 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 my-6">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-primary underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
