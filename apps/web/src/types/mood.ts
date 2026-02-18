export type Mood = 
  | 'calming' 
  | 'cozy' 
  | 'immersive' 
  | 'atmospheric' 
  | 'adrenaline' 
  | 'tactical-mindset' 
  | 'strategic-depth' 
  | 'creative-flow' 
  | 'wanderlust' 
  | 'social-energy' 
  | 'competitive-drive' 
  | 'pick-up-and-play' 
  | 'brain-tickle' 
  | 'survival-instinct' 
  | 'deep-dive' 
  | 'power-fantasy'

export interface GameMoodTag {
  gameId: string
  moods: Mood[]
}
