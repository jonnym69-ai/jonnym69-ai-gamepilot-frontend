import { MASTER_MOODS } from '../constants/masterMoods'
import { getMoodCustomizations } from '../utils/preferences'

export interface MoodDisplay {
  id: string
  name: string
  emoji: string
  description: string
  isCustom: boolean
}

export function getMoodDisplay(moodId: string): MoodDisplay {
  const masterMood = MASTER_MOODS.find(m => m.id === moodId)
  if (!masterMood) {
    return {
      id: moodId,
      name: moodId,
      emoji: '❓',
      description: 'Unknown mood',
      isCustom: false
    }
  }

  const customizations = getMoodCustomizations()
  const customization = customizations[moodId]

  return {
    id: moodId,
    name: customization?.name || masterMood.name,
    emoji: customization?.emoji || masterMood.emoji,
    description: customization?.description || masterMood.description,
    isCustom: !!customization
  }
}

export function getAllMoodDisplays(): MoodDisplay[] {
  return MASTER_MOODS.map(mood => getMoodDisplay(mood.id))
}

export function getMoodDisplayName(moodId: string): string {
  return getMoodDisplay(moodId).name
}

export function getMoodEmoji(moodId: string): string {
  return getMoodDisplay(moodId).emoji
}

export function formatMoodWithEmoji(moodId: string): string {
  const display = getMoodDisplay(moodId)
  return `${display.emoji} ${display.name}`
}
