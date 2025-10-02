"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

// Dummy fallback profile
const DUMMY_PROFILE = {
  username: "user@123",
  role: "User",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(DUMMY_PROFILE);
  const router = useRouter();

  const initial = profile.username
    ? profile.username.charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    authService
      .profile()
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        setProfile(DUMMY_PROFILE);
        toast.warning(
          "Sedang menggunakan data backup karena server tidak merespon"
        );
      });
  }, []);

  return (
    <Card className="w-full h-full">
    <div className="md:w-1/3 w-full h-screen mx-auto flex flex-col items-center justify-center px-4">
      {/* Title */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        <h1 className="text-xl font-bold">User Profile</h1>
      </div>

      {/* Avatar */}
      <div className="w-full flex justify-center mb-6">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-blue-200 text-blue-900 font-semibold text-xl">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Data Fields */}
      <div className="text-sm text-slate-700 w-full flex flex-col gap-3">
        {/* Username */}
        <div className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md flex justify-between">
          <div className="font-semibold w-1/3 text-left text-gray-900 text-base flex justify-between">
            <span>Username</span>:
          </div>
          <div className="w-2/3 text-center text-gray-900 text-base">
            {profile.username}
          </div>
        </div>

        {/* Role */}
        <div className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md flex justify-between">
          <div className="font-semibold w-1/3 text-left text-gray-900 text-base flex justify-between">
            <span>Role</span>:
          </div>
          <div className="w-2/3 text-center text-gray-900 text-base">
            {profile.role}
          </div>
        </div>
      </div>

      {/* Button */}
      <Button variant="default" onClick={() => router.push(`/userpage`)} className="mt-8 w-full">
        Back to home
      </Button>
    </div>
    </Card>
  );
}
