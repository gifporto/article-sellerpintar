// app/auth/register.tsx
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
import { toast } from "sonner";
import Link from "next/link";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

// Schema validasi Zod
const registerSchema = z.object({
  username: z.string().min(1, "Username field cannot be empty"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["User", "Admin"]).refine((val) => !!val, {
    message: "Role wajib dipilih",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "User",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authService.register(values);
      toast.success("Register berhasil, silahkan login");
      router.push("/auth/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "Register gagal, periksa username dan password!";
      toast.error(message);
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

          {/* Role */}
          <div>
            <label className="text-sm text-gray-900 font-medium mb-2">
              Role
            </label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full mb-1">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 my-6">
          SAlready have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
