"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  User, Palette, Bell, Shield, CreditCard, Upload, Check, Loader2,
  Sun, Moon, Monitor, Volume2, Sparkles,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { useUIStore } from "@/lib/stores/ui-store";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, initials } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SaveButton({ onSave }: { onSave: () => void }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  return (
    <Button
      variant="gradient"
      disabled={state === "saving"}
      onClick={() => {
        setState("saving");
        setTimeout(() => { setState("saved"); onSave(); setTimeout(() => setState("idle"), 1500); }, 800);
      }}
    >
      {state === "saving" ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : state === "saved" ? <><Check className="size-4" /> Saved</> : "Save changes"}
    </Button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const ambientEnabled = useUIStore((s) => s.ambientEnabled);
  const toggleAmbient = useUIStore((s) => s.toggleAmbient);

  const [email, setEmail] = useState(currentUser.email);
  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address" : "";

  const [notif, setNotif] = useState({ email: true, digest: true, push: false, achievements: true });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Tune your operating system" description="Profile, appearance, and preferences — saved automatically." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Tabs */}
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Settings sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                tab === t.id ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
              )}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border/70 bg-card/40 p-6 backdrop-blur-xl">
          {tab === "profile" && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 ring-2 ring-primary/30"><AvatarImage src={currentUser.avatarUrl} /><AvatarFallback className="text-lg">{initials(currentUser.name)}</AvatarFallback></Avatar>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/70 px-6 py-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-white/[0.02]">
                    <Upload className="size-4" /> Drag & drop or click to upload
                    <input type="file" accept="image/*" className="sr-only" onChange={() => toast.success("Avatar updated")} />
                  </label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="name">Full name</Label><Input id="name" defaultValue={currentUser.name} className="mt-1.5" /></div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!emailError} className="mt-1.5" />
                  {emailError && <p className="mt-1 text-xs text-red">{emailError}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea id="bio" defaultValue={currentUser.bio} rows={3} className="mt-1.5 w-full rounded-xl border border-input bg-surface/60 px-3.5 py-2.5 text-sm outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30" />
              </div>
              <SaveButton onSave={() => toast.success("Profile saved")} />
            </div>
          )}

          {tab === "appearance" && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([t, Icon]) => (
                    <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t}
                      className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 transition-all", theme === t ? "border-primary bg-primary/10 text-foreground" : "border-border/70 text-muted-foreground hover:bg-white/[0.03]")}>
                      <Icon className="size-5" />
                      <span className="text-xs font-medium capitalize">{t}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Premium dark mode is the designed-for experience; light & system are fully supported.</p>
              </div>
              <div className="space-y-3 border-t border-border/50 pt-5">
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Volume2 className="size-4 text-primary" /> Subtle sound effects</span>
                  <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
                </label>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Sparkles className="size-4 text-purple" /> Ambient background motion</span>
                  <Switch checked={ambientEnabled} onCheckedChange={toggleAmbient} />
                </label>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-3">
              {([
                ["email", "Email alerts", "Important updates to your inbox"],
                ["digest", "Weekly digest", "A summary of your progress each week"],
                ["push", "Push notifications", "Real-time nudges on your devices"],
                ["achievements", "Achievement alerts", "Celebrate unlocks instantly"],
              ] as const).map(([key, title, desc]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <span><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{desc}</span></span>
                  <Switch checked={notif[key]} onCheckedChange={(v) => { setNotif((n) => ({ ...n, [key]: v })); toast.success(`${title} ${v ? "on" : "off"}`); }} />
                </label>
              ))}
            </div>
          )}

          {tab === "account" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="current">Current password</Label><Input id="current" type="password" placeholder="••••••••" className="mt-1.5" /></div>
                <div><Label htmlFor="new">New password</Label><Input id="new" type="password" placeholder="••••••••" className="mt-1.5" /></div>
              </div>
              <SaveButton onSave={() => toast.success("Password updated")} />
              <div className="rounded-xl border border-red/20 bg-red/[0.04] p-4">
                <p className="text-sm font-medium text-red">Danger zone</p>
                <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
                <Button variant="destructive" size="sm" className="mt-3" onClick={() => toast("This is a demo — account deletion is disabled.")}>Delete account</Button>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-purple/10 p-5">
                <div>
                  <Badge variant="primary" className="mb-1">Current plan</Badge>
                  <p className="font-display text-lg font-semibold">Mastery Pro</p>
                  <p className="text-xs text-muted-foreground">$19 / month · renews monthly</p>
                </div>
                <Button variant="secondary" onClick={() => toast("Manage billing (demo)")}>Manage</Button>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-sm font-medium">Payment method</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><CreditCard className="size-4" /> Visa ending in 4242</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
