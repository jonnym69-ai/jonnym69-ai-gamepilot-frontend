export interface RecommendedGame {
  id: number
  name: string
  image: string
  steamUrl: string
  genres: string[]
  price?: string
  recommendationReason?: string
}
