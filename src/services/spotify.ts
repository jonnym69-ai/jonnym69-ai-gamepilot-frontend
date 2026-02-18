export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  previewUrl: string
  explicit: boolean
  popularity: number
  externalUrl: string
}

// Mock track data
const mockTracks: SpotifyTrack[] = [
  {
    id: '1',
    name: 'Cyberpunk 2077 OST',
    artist: 'Various Artists',
    album: 'Cyberpunk 2077: Original Soundtrack',
    duration: '3:45',
    previewUrl: 'https://p.scdn.co/preview/1234567890123456789',
    explicit: false,
    popularity: 95,
    externalUrl: 'https://open.spotify.com/track/1234567890123456789'
  },
  {
    id: '2',
    name: 'Elden Ring Boss Theme',
    artist: 'FromSoftware',
    album: 'Elden Ring Original Soundtrack',
    duration: '4:12',
    previewUrl: 'https://p.scdn.co/preview/234567890123456789',
    explicit: false,
    popularity: 88,
    externalUrl: 'https://open.spotify.com/track/234567890123456789'
  },
  {
    id: '3',
    name: 'The Witcher 3 - Wild Hunt',
    artist: 'Jason Schwartz',
    album: 'The Witcher 3: Wild Hunt Original Soundtrack',
    duration: '2:30',
    previewUrl: 'https://p.scdn.co/preview/34567890123456789',
    explicit: false,
    popularity: 92,
    externalUrl: 'https://open.spotify.com/track/34567890123456789'
  }
]

export const searchSoundtracks = async (title: string): Promise<SpotifyTrack[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // Filter tracks based on title match
  const filteredTracks = mockTracks.filter(track => 
    track.name.toLowerCase().includes(title.toLowerCase()) ||
    track.artist.toLowerCase().includes(title.toLowerCase()) ||
    track.album.toLowerCase().includes(title.toLowerCase())
  )
  
  return filteredTracks.slice(0, 5) // Return up to 5 tracks
}
