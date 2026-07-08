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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
      </header>
      <div className="flex flex-col gap-6 px-5">
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
