interface MusicShare {
  id: string
  isMine: boolean
  authorName: string
  youtubeVideoId: string
  title: string
  artist: string | null
  message: string | null
  sharedAt: string
}

export function MusicList({ shares }: { shares: MusicShare[] }) {
  if (shares.length === 0) {
    return (
      <p className="py-8 text-center text-sm leading-relaxed text-muted-foreground">
        Aucun morceau partag&eacute; pour l&apos;instant.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {shares.map((s) => (
        <li key={s.id}>
          <article className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${s.youtubeVideoId}`}
                title={s.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-sm font-medium text-card-foreground">{s.title}</span>
              {s.message ? (
                <p className="text-sm leading-relaxed text-muted-foreground">&laquo;&nbsp;{s.message}&nbsp;&raquo;</p>
              ) : null}
              <span className="text-xs text-muted-foreground">
                Partag&eacute; par {s.isMine ? "toi" : s.authorName} &middot;{" "}
                {new Date(s.sharedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
