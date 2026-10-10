import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getMyProfile } from "@/app/actions/profile"
import { getMyConnections } from "@/app/actions/discovery"
import { BottomNav } from "@/components/bottom-nav"
import { ProfileEditor } from "@/components/profile/profile-editor"
import { ConnectionsList } from "@/components/profile/connections-list"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [profile, connections] = await Promise.all([getMyProfile(), getMyConnections()])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background pb-20">
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-jade/15 text-lg font-bold text-jade" aria-hidden="true">
            {(profile?.displayName ?? session.user.name ?? session.user.email ?? 'B').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">Mon espace BR8</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{profile?.displayName ?? session.user.name ?? 'Mon profil'}</h1>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-[#24203d] via-[#17182d] to-[#0e1926] p-4 shadow-[0_18px_60px_rgba(31,24,67,0.25)]">
          <div className="relative z-10 max-w-[58%]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Ton espace</p>
            <p className="mt-2 text-xl font-semibold leading-tight text-white">Reste toi-même.<br />Le reste suit.</p>
          </div>
          <img src="/br8-avatar-art.png" alt="Illustration de quatre avatars BR8" className="absolute -right-8 -bottom-10 w-[68%] max-w-none rotate-[-4deg] opacity-95" />
          <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-[#e46b91]/25 blur-3xl" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Gère tes informations, ta visibilité et les personnes avec qui tu échanges.</p>
      </header>
      <div className="flex flex-col gap-4 px-5">
        <ProfileEditor
          initial={
            profile
              ? {
                  displayName: profile.displayName,
                  bio: profile.bio ?? "",
                  age: profile.age,
                  location: profile.location ?? "",
                  interests: profile.interests ?? [],
                  isDiscoverable: profile.isDiscoverable,
                }
              : { displayName: session.user.name ?? "", bio: "", age: null, location: "", interests: [], isDiscoverable: true }
          }
        />
        <ConnectionsList connections={connections} />
      </div>
      <BottomNav />
    </main>
  )
}
