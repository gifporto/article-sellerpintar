// app/auth/login.tsx
"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema validasi dengan Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

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

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await authService.login(values);

      // Simpan token dan role
      document.cookie = `token=${data.token}; path=/; secure; samesite=strict`;
      document.cookie = `role=${data.role}; path=/; secure; samesite=strict`;

      // Redirect berdasarkan role
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
      const message =
        err?.response?.data?.error ||
        "Login gagal, periksa username dan password!";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <img src="/bg-dummy.jpg" className="rounded-xl mb-4" alt="" />
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Username"
              {...register("username")}
              className="mb-1"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Password"
              type="password"
              {...register("password")}
              className="mb-1"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Loading..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-2">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-black hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
