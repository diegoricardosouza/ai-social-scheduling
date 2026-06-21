/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChannelType } from "@/types/channel.type";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Copy, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChannelAvatar } from "../ChannelAvatar";

interface ScheduleToolbarProps {
  viewType?: "calendar" | "list";
  channelIds: string[];
  toggleChannel: (id: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string | any) => void;
}

export function ScheduleToolbar({
  viewType = "calendar",
  channelIds,
  toggleChannel,
  selectedStatus,
  setSelectedStatus,
}: ScheduleToolbarProps) {
  const { data: channelsData } = useQuery({
    queryKey: ["channels-connected"],
    queryFn: async () => {
      const res = await fetch("/api/channel?filter=connected");
      if (!res.ok) throw new Error("Failed to fetch channels");
      return res.json();
    },
  });
  const connectedChannels = channelsData?.channels || [];
  const t = useTranslations()

  const statusOptions = [
    { id: "all", label: t('common.allPosts') },
    { id: "draft", label: t('common.draft') },
    { id: "queue", label: t('common.queue') },
    { id: "published", label: t('common.published') },
    { id: "failed", label: t('common.failed') },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter */}
      {viewType === "calendar" && (

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="lg" className="h-8 gap-1 cursor-pointer">
              <Copy className="h-3.5 w-3.5" />
              <span className="font-medium text-sm text-muted-foreground!">
                {statusOptions.find((s) => s.id === selectedStatus)?.label || t('common.allPosts')}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end" asChild>
            <div className="space-y-1">
              {statusOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors cursor-pointer",
                    selectedStatus === option.id && "bg-muted font-medium"
                  )}
                  onClick={() => setSelectedStatus(option.id)}
                >
                  <Checkbox
                    checked={selectedStatus === option.id}
                    className="pointer-events-none"
                  />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Channels Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="lg" className="h-8 gap-1 cursor-pointer">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="font-medium text-sm text-muted-foreground!">
              {t('common.channels')}
            </span>
            {channelIds && channelIds?.length > 0 && (
              <Badge variant="default" className="size-4!">
                {channelIds.length}
              </Badge>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-86 p-0" align="end">
          <Command>
            <CommandList>
              <CommandGroup heading={t('common.connectedChannels')}>
                {connectedChannels?.length === 0 ? (
                  <div className="py-4 px-2 text-center">
                    <p className="text-xs text-muted-foreground mb-3">{t('common.nochannelsconnected')}</p>
                    <Button size="sm" className="w-fit px-5" asChild>
                      <Link href="/settings">{t('common.connectChannel')}</Link>
                    </Button>
                  </div>
                ) : (
                  connectedChannels?.map((channel: ChannelType) => (
                    <CommandItem
                      key={channel.id}
                      onSelect={() => toggleChannel(channel.user_channel_id!)}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer"
                    >
                      <ChannelAvatar
                        size="sm"
                        className="flex-1 flex items-center justify-start gap-2"
                        type={channel.type}
                        color={channel.color}
                        profileImage={channel.profile_image}
                        name={channel.handle || channel.name}
                      />

                      <Checkbox
                        checked={channelIds.includes(channel.user_channel_id!)}
                        className="border-black! cursor-pointer"
                      />
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

    </div>
  );
}