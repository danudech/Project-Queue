"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useProfile } from "@/hooks/use-me";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Camera, Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const t = useTranslations("Menu");
  const tProfile = useTranslations("Profile");
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await http.put<{ success: boolean; message: string }>("updateprofile", formData);
      return response;
    },
    onSuccess: () => {
      toast.success(tProfile("updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || tProfile("updateFailed"));
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("Name", name);
    if (phone) formData.append("Phone", phone);
    if (selectedFile) formData.append("ProfilePicture", selectedFile);

    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("myProfile") ?? "My Profile"}</h1>
        <p className="text-muted-foreground mt-2">
          {tProfile("desc")}
        </p>
      </div>

      <Card className="border shadow-lg bg-card overflow-hidden rounded-2xl relative">
        {/* Decorative Header Banner */}
        <div className="h-40 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <CardContent className="px-8 pb-10 pt-0 relative">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end relative -mt-16 mb-10">
              
              {/* Avatar Section */}
              <div className="relative group z-10">
                <Avatar className="h-32 w-32 border-4 border-card shadow-xl bg-card transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage 
                    src={previewUrl || (profile?.profilePictureUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${profile.profilePictureUrl}` : '')} 
                    alt={profile?.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary font-light">
                    <User className="h-14 w-14" />
                  </AvatarFallback>
                </Avatar>
                
                <Label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
                  title={tProfile("changeAvatar")}
                >
                  <Camera className="h-4 w-4" />
                </Label>
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>

              {/* Quick Info Summary */}
              <div className="flex-1 pb-2 space-y-1">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {profile?.name || tProfile("unknownUser")}
                  {profile?.status?.toLowerCase() === "active" && (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" title={tProfile("verifiedAccount")} />
                  )}
                </h2>
                <div className="flex items-center text-muted-foreground text-sm gap-4">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {profile?.email}</span>
                  <span className="flex items-center gap-1.5 capitalize px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                    {profile?.role || tProfile("userRole")}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">{tProfile("fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder={tProfile("fullNamePlaceholder")} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-9 h-11 bg-background border-input focus-visible:ring-primary focus-visible:bg-background transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80">{tProfile("phoneNumber")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder={tProfile("phoneNumberPlaceholder")} 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="pl-9 h-11 bg-background border-input focus-visible:ring-primary focus-visible:bg-background transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                setName(profile?.name || "");
                setPhone(profile?.phone || "");
                setSelectedFile(null);
                setPreviewUrl(null);
              }}>
                {tProfile("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="min-w-[140px] shadow-md hover:shadow-lg transition-all"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  tProfile("saveChanges")
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
