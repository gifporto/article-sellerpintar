// app/auth/register.tsx
"use client";

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

// Schema validasi Zod
const registerSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["User", "Admin"]).refine((val) => !!val, {
    message: "Role wajib dipilih",
  }),
});


type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

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
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <img src="/bg-dummy.jpg" className="rounded-xl mb-4" alt="" />
        <h1 className="text-2xl font-bold mb-4">Register</h1>

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

          <div>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-2">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-black hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
