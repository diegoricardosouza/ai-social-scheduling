/* eslint-disable @next/next/no-img-element */
import { capitalize } from "@/lib/capitalize";
import { getDateFnsLocale } from "@/lib/date-fns-locale";
import { cn } from "@/lib/utils";
import { PostType } from "@/types/post.type";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, isPast, parse, parseISO } from "date-fns";
import { AlarmClockCheck, ExternalLink, LayoutList, Pin, Plus, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { ChannelAvatar } from "../ChannelAvatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { EditPostDialog } from "./EditPostDialog";
import { ScheduleToolbar } from "./ScheduleToolbar";

type TabType = "draft" | "queue" | "published" | "failed";

type GroupPostType = {
  key: string;
  label: string;
  posts: PostType[]
}

export function ListView({ setCreatePostModalOpen }: {
  setCreatePostModalOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const t = useTranslations()
  const locale = useLocale()
  const dateFnsLocale = getDateFnsLocale(locale)
  const [activeTab, setActiveTab] = useQueryState("status", {
    defaultValue: "draft"
  })
  const [channelIds, setChannelIds] = useQueryState("channelIds", {
    defaultValue: [],
    parse: (query) => query.split(","),
    serialize: (value) => value.join(",")
  })

  const [selectedPostForEdit, setSelectedPostForEdit] = useState<PostType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // const { data, isFetching:isPending } = useQuery({
  //   queryKey: ["posts", activeTab, channelIds],
  //   queryFn: async () => {
  //     const params = new URLSearchParams()
  //     params.append("group_by_date", "true")
  //     if (activeTab) params.append("status", activeTab)
  //     if (channelIds.length > 0) params.append("channelIds", channelIds.join(","))
  //     const res = await fetch(`/api/post?${params.toString()}`);
  //     if (!res.ok) throw new Error("Failed to fetch posts");
  //     return res.json();
  //   },
  // })

  //  const { data:totalPosts } = useQuery({
  //   queryKey: ["posts", "totals", channelIds],
  //   queryFn: async () => {
  //     const params = new URLSearchParams()
  //     if (channelIds.length > 0) params.append("channelIds", channelIds.join(","))
  //     const res = await fetch(`/api/post/totals?${params.toString()}`);
  //     if (!res.ok) throw new Error("Failed to fetch posts");
  //     return res.json();
  //   }
  // })

  const STATUS_LABEL: Record<string, string> = {
    draft: t('common.draft'),
    queue: t('common.queue'),
    published: t('common.published'),
    failed: t('common.failed'),
  }

  const POST_STATUS_LABEL: Record<string, string> = {
    overdue: t('common.overdue'),
    draft: t('common.draft'),
    custom: t('common.custom'),
  }

  const [postsQuery, totalsQuery] = useQueries({
    queries: [
      {
        queryKey: ["posts", activeTab, channelIds],
        queryFn: async () => {
          const params = new URLSearchParams()
          params.append("group_by_date", "true")
          if (activeTab) params.append("status", activeTab)
          if (channelIds.length > 0) params.append("channelIds", channelIds.join(","))
          const res = await fetch(`/api/post?${params.toString()}`)
          if (!res.ok) throw new Error("Failed to fetch posts")
          return res.json()
        },
      },
      {
        queryKey: ["posts", "totals", channelIds],
        queryFn: async () => {
          const params = new URLSearchParams()
          if (channelIds.length > 0) params.append("channelIds", channelIds.join(","))
          const res = await fetch(`/api/post/totals?${params.toString()}`)
          if (!res.ok) throw new Error("Failed to fetch totals")
          return res.json()
        },
      },
    ],
  })

  const data = postsQuery.data
  const isPending = postsQuery.isFetching
  const totalPosts = totalsQuery.data
  const isTotalsFetching = totalsQuery.isFetching

  const publishPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/post/${postId}/publish`, {
        method: "POST"
      })
      if (!res.ok) throw new Error("Failed to publish post");
      return res.json();
    },
    onSuccess: () => {
      const message = t('common.postProcessing')+"..."
      toast.success(message)
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "posts",
      });
    }
  })

  const groupPosts = (data?.groupPosts || []) as GroupPostType[]

  const totalDrafts = totalPosts?.totalDrafts || 0
  const totalQueue = totalPosts?.totalQueue || 0
  const totalPublished = totalPosts?.totalPublished || 0
  const totalFailed = totalPosts?.totalFailed || 0

  const renderTotalBadge = (total: number) => (
    <Badge variant="secondary" className="min-w-6">
      {isTotalsFetching ? <Spinner className="size-3" /> : total}
    </Badge>
  )

  const toggleChannel = (channelId: string) => {
    setChannelIds((prev) => {
      if (!prev) {
        return [channelId]
      }
      if (prev.includes(channelId)) {
        const filtered = prev.filter((id) => id !== channelId)
        return filtered.length === 0 ? null : filtered
      }
      return [...prev, channelId]
    })
  }

  const handleEditPost = (post: PostType) => {
    setSelectedPostForEdit(post)
    setIsEditDialogOpen(true)
  }

  const handlePublishNow = (post: PostType) => {
    if (publishPostMutation.isPending) return;
    publishPostMutation.mutate(
      post.id
    )
  }

  return (
    <>
      <div className="flex flex-col h-full pt-3">
        <div className="flex items-center justify-between border-b px-6">
          <Tabs value={activeTab || "draft"} onValueChange={(val) => setActiveTab(val)}>
            <TabsList variant="line" className="space-x-4">
              <TabsTrigger value="draft" className="cursor-pointer">
                {t('common.draft')} {renderTotalBadge(totalDrafts)}
              </TabsTrigger>
              <TabsTrigger value="queue" className="cursor-pointer">
                {t('common.queue')} {renderTotalBadge(totalQueue)}
              </TabsTrigger>
              <TabsTrigger value="published" className="cursor-pointer">
                {t('common.published')} {renderTotalBadge(totalPublished)}
              </TabsTrigger>
              <TabsTrigger value="failed" className="cursor-pointer">
                {t('common.failed')} {renderTotalBadge(totalFailed)}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScheduleToolbar
            viewType="list"
            channelIds={channelIds}
            toggleChannel={toggleChannel}
            selectedStatus={activeTab}
            setSelectedStatus={setActiveTab}
          />
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-[900px] mx-auto w-full space-y-2">
            {isPending ? (
              <div className="space-y-8">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-10 w-56 rounded-md" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ))}
              </div>
            ) : groupPosts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="max-w-sm space-y-4">
                  <div className="mx-auto flex size-15 items-center justify-center rounded-full bg-muted">
                    <LayoutList className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold capitalize">
                    {t('common.noPostsYet', { status: STATUS_LABEL[activeTab] ?? activeTab })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('common.connectChannelToCreatePost')}
                  </p>
                  <Button size="lg"
                    onClick={() => setCreatePostModalOpen(true)}
                  >
                    <Plus className="size-4" />
                    {t('common.createPost')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-5">
                {groupPosts.map((group) => (
                  <div key={group.key}>
                    {/* <h2 className="text-lg font-medium">{group.label}</h2> */}
                    <h2 className="text-lg font-medium capitalize">
                      {capitalize(format(parse(group.key, 'yyyy-MM-dd', new Date()), "EEEE, dd MMMM yyyy", { locale: dateFnsLocale }))}
                    </h2>
                    <div className="space-y-6">
                      {group.posts.map((post) => {
                        const scheduleDate = parseISO(post.scheduled_at);
                        const channel = post.user_channels?.channel_types;
                        const previewImage = post.images?.[0]?.url;
                        
                        return (
                          <div key={post.id} className="grid gap-2 lg:grid-cols-[150px_minmax(0,1fr)]">
                            <div>
                              <h5>
                                {format(scheduleDate, "h:mm a", { locale: dateFnsLocale })}
                              </h5>
                              {/* <div className="flex items-center gap-2 text-muted-foreground">
                                <Pin className="size-4" />
                                <span>{post.status === "draft" ? "Draft" : "Custom"}</span>
                              </div> */}
                              <div className={cn(
                                "flex items-center gap-2",
                                isPast(scheduleDate) && (post.status === "queue" || post.status === "draft")
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}>
                                <Pin className="size-4" />
                                <span className="capitalize">
                                  {isPast(scheduleDate) && (post.status === "queue" || post.status === "draft")
                                    ? POST_STATUS_LABEL.overdue
                                    : post.status === "draft"
                                      ? POST_STATUS_LABEL.draft
                                      : POST_STATUS_LABEL.custom}
                                </span>
                              </div>
                            </div>

                            <Card className="py-0 gap-0">
                              <CardContent className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_250px]">
                                <div className="space-y-5">
                                  {channel ? (
                                    <ChannelAvatar
                                      type={channel.type}
                                      color={channel.color}
                                      profileImage={post.user_channels?.profile_image}
                                      name={post.user_channels?.handle || channel.name}
                                    />
                                  ) : null}

                                  <p className="whitespace-pre-wrap text-sm leading-6 line-clamp-4
                                ">{post.content}</p>
                                </div>

                                <div className="max-h-[165px] overflow-hidden rounded-2xl border bg-muted/40">
                                  {previewImage ? (
                                    <img
                                      src={previewImage}
                                      alt="Post media"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full-center justify-center text-sm text-muted-foreground">
                                      {t('common.noMedia')}
                                    </div>
                                  )}
                                </div>
                              </CardContent>

                              <CardFooter className="flex flex-col gap-4 border-t px-6 py-3 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm text-muted-foreground">
                                  {post.status === "published" ? (
                                    <>
                                      {t('common.publishedVia')} <span className="font-medium text-foreground">{channel?.name || t('common.channel')}</span>
                                    </>
                                  ) : (
                                    <>
                                      {t('common.youCreatedThis')} <span className="font-medium text-foreground">
                                        {formatDistanceToNow(parseISO(post.created_at), { locale: dateFnsLocale })}
                                      </span> {t('common.ago')}
                                    </>
                                  )}
                                </p>

                                <div className="flex items-center gap-3">
                                  {post.published_url && post.status === "published" ? (
                                    <Button asChild variant="outline">
                                      <a
                                        href={post.published_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        {t('common.viewPost')}
                                      </a>
                                    </Button>
                                  ) : (
                                    <>
                                      <Button variant="outline"
                                        onClick={() => handleEditPost(post)}
                                      >
                                        <AlarmClockCheck className="size-4" />
                                        {t('common.reschedule')}
                                      </Button>

                                      {post.status === "draft" && (
                                        <Button variant="outline"
                                          disabled={publishPostMutation.isPending}
                                          onClick={() => handlePublishNow(post)}
                                        >
                                          {publishPostMutation.isPending ? (
                                            <Spinner />
                                          ) : (
                                            <Send className="size-4" />
                                          )}
                                          {t('common.publishNow')}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </CardFooter>
                            </Card>

                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditPostDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        post={selectedPostForEdit ? {
          id: selectedPostForEdit.id,
          content: selectedPostForEdit.content,
          images: selectedPostForEdit.images || [],
          scheduledDate: selectedPostForEdit.scheduled_at,
          userChannelId: selectedPostForEdit.user_channel_id || "",
          channel: selectedPostForEdit.user_channels?.channel_types ? {
            ...selectedPostForEdit.user_channels.channel_types,
            profile_image: selectedPostForEdit.user_channels.profile_image,
            handle: selectedPostForEdit.user_channels.handle
          } : null,
        } : null}
      />
    </>
  )
}