"use client"
import { CalendarView } from "@/components/schedule/CalendarView";
import { CreatePostDialog } from "@/components/schedule/CreatePostDialog";
import { ListView } from "@/components/schedule/Listview";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarIcon, LayoutList, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, useState } from "react";

type ViewType = "calendar" | "list"

function SchedulePageContent() {
  const t = useTranslations()
  const [activeView, setActiveView] = useQueryState("view", {
    defaultValue: "calendar",
  });
  const [_, setStatus] = useQueryState("status", {
    defaultValue: "",
  })
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-semibold">{t('common.allChannels')}</h1>
        </div>

        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(value) => {
              //reset the url status
              setStatus(null)
              setActiveView(value as ViewType)

            }}
            className="border rounded-lg p-px"
          >
            <ToggleGroupItem 
              value="list"
              className="gap-2 my-px cursor-pointer"
            >
              <LayoutList className="size-4" />
              <span className="text-sm">{t('common.list')}</span>
            </ToggleGroupItem>
            
            <ToggleGroupItem value="calendar" className="cursor-pointer">
              <CalendarIcon className="size-4" />
              <span className="text-sm">{t('common.calendar')}</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => setCreatePostModalOpen(true)}>
            <Plus className="size-4" />
            {t('common.addPost')}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeView === "list" ? (
          <ListView setCreatePostModalOpen={setCreatePostModalOpen} />
        ) : (
          <CalendarView />
        )}
      </div>

      <CreatePostDialog
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
      />
    </div>
  )
}

const SchedulePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NuqsAdapter>
        <SchedulePageContent />
      </NuqsAdapter>
    </Suspense>
  )
}

export default SchedulePage