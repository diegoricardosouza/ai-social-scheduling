"use client";

import ChannelsTab from "@/components/settings/ChannelsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { UserProfile } from "@clerk/react";
import { Layers, Palette, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const t = useTranslations();

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto w-full h-full">
        <div className="py-4">
          <h1 className="text-xl font-semibold">{t('common.settings')}</h1>
        </div>

        <div>
          <Tabs defaultValue="channels">
            <div className="mb-6 w-full border-b py-2">
              <TabsList variant="line" className="w-fit space-x-4">
                <TabsTrigger value="profile" className="cursor-pointer">
                  <User className="size-4" />
                  {t('common.profile')}
                </TabsTrigger>
                <TabsTrigger value="channels" className="cursor-pointer">
                  <Layers className="size-4" />
                  {t('common.channels')}
                </TabsTrigger>
                <TabsTrigger value="appearance" className="cursor-pointer">
                  <Palette className="size-4" />
                  {t('common.appearance')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.profileTitle')}</CardTitle>
                  <CardDescription>{t('settings.profileDesc')}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        className="h-16 w-16 rounded-full"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="size-8 text-muted-foreground" />
                      </div>
                    )}

                    <div>
                      <p className="font-medium">{user?.fullName || t('common.error')}</p>
                      <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || t('common.error')}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <UserProfile
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "border-0 shadow-none"
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels">
              <ChannelsTab />
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.appearance')}</CardTitle>
                  <CardDescription>{t('appearance.appearanceDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="theme">{t('appearance.darkMode')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('appearance.darkModeDesc')}
                      </p>
                    </div>
                    <Switch
                      id="theme"
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}