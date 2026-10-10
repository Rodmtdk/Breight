import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPublicProfile } from "@/app/actions/profile"

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getPublicProfile(id)
  if (!profile) notFound()

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background px-5 py-6">
      <Link href="/chat" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour aux messages
      </Link>
      <section className="mt-10 flex flex-col items-center text-center">
        <Avatar className="size-24 ring-4 ring-primary/15">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-5 text-2xl font-semibold">{profile.displayName}</h1>
        {profile.location ? <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{profile.location}</p> : null}
        {profile.bio ? <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">{profile.bio}</p> : null}
        {profile.interests?.length ? <div className="mt-5 flex flex-wrap justify-center gap-2">{profile.interests.map((interest) => <span key={interest} className="rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">{interest}</span>)}</div> : null}
      </section>
    </main>
  )
}
