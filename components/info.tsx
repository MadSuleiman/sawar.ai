import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./ui/sidebar";
import { Paintbrush, Keyboard, Video, Lock, Info } from "lucide-react";

const tabs = [
  { name: "Appearance", icon: Paintbrush },
  { name: "Accessibility", icon: Keyboard },
  { name: "Audio & video", icon: Video },
  { name: "Privacy & visibility", icon: Lock },
  { name: "Credits", icon: Info },
];

export default function InfoDialog() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("Credits");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105 transition-transform duration-200">
          <Image src="/logos/icon.png" alt="Logo" width={60} height={60} />
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[80vh] md:max-w-[800px] bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <DialogTitle className="sr-only">Info</DialogTitle>
        <DialogDescription className="sr-only">
          View app information and credits.
        </DialogDescription>
        <SidebarProvider>
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {tabs.map((tab) => (
                      <SidebarMenuItem key={tab.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={active === tab.name}
                        >
                          <button
                            onClick={() => setActive(tab.name)}
                            className="flex items-center gap-2 w-full p-2"
                          >
                            <tab.icon />
                            <span>{tab.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 items-center px-4">
              <h2 className="text-xl font-semibold">{active}</h2>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {active === "Credits" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/me.jpg"
                      alt="Creator"
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium">Ahmad Suleiman</span>
                  </div>
                  <a
                    href="https://www.ahmadsul.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    ahmadsul.com
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Customize your {active.toLowerCase()} settings here.
                  </p>
                  {/* settings fields go here */}
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
