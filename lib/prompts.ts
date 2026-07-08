// Psychological listening framework: guided prompts, conversation templates
// and mood vocabulary that transform "salut, ça va ?" into deep listening.

export interface GuidedPrompt {
  id: string
  category: PromptCategory
  text: string
  followUp?: string
}

export type PromptCategory = "checkin" | "vulnerable" | "dreams" | "appreciation" | "values" | "comfort"

export const PROMPT_CATEGORIES: Record<PromptCategory, { label: string; description: string }> = {
  checkin: { label: "Vrai check-in", description: "Aller au-delà du \u00ab ça va ? \u00bb" },
  vulnerable: { label: "Partage vulnérable", description: "Oser dire ce qui pèse" },
  dreams: { label: "Rêves & envies", description: "Explorer ce qui fait vibrer" },
  appreciation: { label: "Gratitude", description: "Dire ce qu'on apprécie vraiment" },
  values: { label: "Valeurs profondes", description: "Ce qui compte vraiment" },
  comfort: { label: "Réconfort", description: "Être présent dans la difficulté" },
}

export const GUIDED_PROMPTS: GuidedPrompt[] = [
  // Check-in
  { id: "ci-1", category: "checkin", text: "Comment tu te sens vraiment, là, maintenant ?", followUp: "Qu'est-ce qui a le plus influencé cette sensation aujourd'hui ?" },
  { id: "ci-2", category: "checkin", text: "Sur une échelle de 1 à 10, où est ton énergie aujourd'hui ? Pourquoi ?" },
  { id: "ci-3", category: "checkin", text: "Qu'est-ce qui occupe ton esprit en ce moment, même si c'est petit ?" },
  { id: "ci-4", category: "checkin", text: "Quel moment de ta journée aimerais-tu revivre ou effacer ?" },
  // Vulnerable
  { id: "vu-1", category: "vulnerable", text: "Y a-t-il quelque chose que tu portes seul(e) en ce moment ?", followUp: "Comment je peux t'accompagner là-dedans ?" },
  { id: "vu-2", category: "vulnerable", text: "De quoi as-tu peur ces derniers temps ?" },
  { id: "vu-3", category: "vulnerable", text: "Quand t'es-tu senti(e) incompris(e) récemment ?" },
  { id: "vu-4", category: "vulnerable", text: "Qu'est-ce que tu n'oses pas me dire, de peur de ma réaction ?" },
  // Dreams
  { id: "dr-1", category: "dreams", text: "Si rien ne te retenait, tu ferais quoi cette année ?" },
  { id: "dr-2", category: "dreams", text: "Quel rêve d'enfance vit encore en toi ?" },
  { id: "dr-3", category: "dreams", text: "À quoi ressemblerait ta journée parfaite, minute par minute ?" },
  // Appreciation
  { id: "ap-1", category: "appreciation", text: "Qu'est-ce que j'ai fait récemment qui t'a fait du bien, même sans le savoir ?" },
  { id: "ap-2", category: "appreciation", text: "Quelle qualité chez moi t'inspire ou te rassure ?" },
  { id: "ap-3", category: "appreciation", text: "Raconte-moi un souvenir de nous qui te fait sourire." },
  // Values
  { id: "va-1", category: "values", text: "Qu'est-ce qui est non négociable pour toi dans une relation ?" },
  { id: "va-2", category: "values", text: "Quelle décision difficile t'a le plus défini(e) ?" },
  { id: "va-3", category: "values", text: "Qu'aimerais-tu qu'on dise de toi quand tu n'es pas là ?" },
  // Comfort
  { id: "co-1", category: "comfort", text: "Je suis là. Tu veux en parler ou juste être écouté(e) ?" },
  { id: "co-2", category: "comfort", text: "Qu'est-ce qui t'apaise quand tout semble trop ?" },
  { id: "co-3", category: "comfort", text: "De quoi as-tu besoin de ma part, là, tout de suite ?" },
]

export const MOODS = [
  { id: "joyful", label: "Joyeux", color: "#e8a33d" },
  { id: "calm", label: "Serein", color: "#7fa66a" },
  { id: "tired", label: "Fatigué", color: "#8a8a8a" },
  { id: "anxious", label: "Anxieux", color: "#c96f4a" },
  { id: "sad", label: "Triste", color: "#6a84a6" },
  { id: "grateful", label: "Reconnaissant", color: "#c9a24a" },
  { id: "frustrated", label: "Frustré", color: "#b8543e" },
  { id: "loved", label: "Aimé", color: "#c96a8a" },
] as const

export type MoodId = (typeof MOODS)[number]["id"]

export function getPromptById(id: string): GuidedPrompt | undefined {
  return GUIDED_PROMPTS.find((p) => p.id === id)
}

export function getMoodById(id: string) {
  return MOODS.find((m) => m.id === id)
}
