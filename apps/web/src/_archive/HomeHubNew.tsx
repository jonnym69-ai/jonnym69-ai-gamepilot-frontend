import { useGamePilotStore } from "../../stores/useGamePilotStore";
import { useLibraryStore } from "../../stores/useLibraryStore";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
import { PageErrorBoundary } from "../../components/ErrorBoundary";
import { Loading } from "../../components/Loading";
import { createApiUrl } from "../../config/api";

export function HomeHub() {
  const { user, isLoading: userLoading, error: userError } = useAuthStore();
  const { games } = useLibraryStore();
  const { integrations } = useGamePilotStore();

  // Mock recently played data using games from library
  const recentlyPlayed = (games || [])?.slice(0, 5).map(game => ({
    id: game?.id || '',
    title: game?.title || 'Unknown Game',
    coverImage: game?.coverImage || createApiUrl('/placeholder/cover/default.jpg'),
    hoursPlayed: Math.floor(Math.random() * 120), // Mock playtime
  }));

  if (userLoading) return <HomeHubLoading />;
  if (userError) return <HomeHubError message={userError} />;

  return (
    <PageErrorBoundary>
      <div className="flex flex-col gap-8 p-6">
        {/* HEADER */}
        <header className="flex items-center gap-4">
          <img
            src={user?.avatar || createApiUrl('/placeholder/avatar/default.jpg')}
            alt={user?.username || user?.displayName || 'User'}
            className="w-16 h-16 rounded-full object-cover border-2 border-gaming-primary/50"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.username || user?.displayName || 'Gamer'}</h1>
            <p className="text-sm text-gray-400">
              Your gaming universe at a glance
            </p>
          </div>
        </header>

        {/* QUICK LINKS */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">Integrations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IntegrationCard 
              name="Steam" 
              to="/integrations/steam" 
              icon="🎮" 
              connected={integrations?.steam?.connected || false}
            />
            <IntegrationCard 
              name="Discord" 
              to="/integrations/discord" 
              icon="💬" 
              connected={integrations?.discord?.connected || false}
            />
            <IntegrationCard 
              name="YouTube" 
              to="/integrations/youtube" 
              icon="📺" 
              connected={integrations?.youtube?.connected || false}
            />
            <IntegrationCard name="Twitch" to="/integrations/twitch" icon="🎥" />
          </div>
        </section>

        {/* RECENTLY PLAYED */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">Recently Played</h2>

          {(recentlyPlayed && recentlyPlayed.length > 0) && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyPlayed.map((game) => (
                <div
                  key={game.id}
                  className="min-w-[160px] glass-morphism rounded-lg p-3 border border-white/10"
                >
                  <img
                    src={game.coverImage || createApiUrl('/placeholder/cover/default.jpg')}
                    alt={game.title}
                    className="rounded mb-2 w-full h-20 object-cover"
                  />
                  <p className="font-medium text-white">{game.title}</p>
                  <p className="text-xs text-gray-400">
                    {game.hoursPlayed || 0} hours played
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECOMMENDATIONS (STATIC FOR V1) */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlaceholderRecommendation 
              title="Try something atmospheric" 
              description="Immersive worlds with stunning visuals and ambient soundtracks"
            />
            <PlaceholderRecommendation 
              title="Games with strong narrative" 
              description="Compelling stories that will keep you engaged for hours"
            />
            <PlaceholderRecommendation 
              title="Fast‑paced action picks" 
              description="Adrenaline-pumping gameplay for competitive sessions"
            />
          </div>
        </section>
      </div>
    </PageErrorBoundary>
  );
}

/* -------------------------
   SUPPORTING COMPONENTS
-------------------------- */

function IntegrationCard({ name, to, icon, connected }: { name: string; to: string; icon: string; connected?: boolean }) {
  return (
    <Link
      to={to}
      className={`glass-morphism hover:bg-white/10 transition-all duration-200 rounded-lg p-4 flex flex-col items-center justify-center font-medium text-white border ${
        connected ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'
      }`}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm">{name}</span>
      {connected && (
        <span className="text-xs text-green-400 mt-1">Connected</span>
      )}
    </Link>
  );
}

function PlaceholderRecommendation({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-morphism rounded-lg p-4 border border-white/10">
      <p className="font-medium mb-1 text-white">{title}</p>
      <p className="text-sm text-gray-400 mb-2">{description}</p>
      <p className="text-xs text-gaming-primary">
        Smart recommendations coming in Phase 5
      </p>
    </div>
  );
}

function HomeHubLoading() {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <Loading message="Loading your dashboard…" size="xl" />
      </div>
    </PageErrorBoundary>
  );
}

function HomeHubError({ message }: { message: string }) {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center p-4">
        <div className="glass-morphism rounded-xl p-8 max-w-md w-full border border-red-500/30">
          <div className="text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-white mb-4">Home Hub Error</h1>
            <p className="text-gray-300 mb-6">
              Something went wrong loading your dashboard: {message}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-colors"
              >
                🔄 Reload Dashboard
              </button>
              
              <Link
                to="/"
                className="w-full px-6 py-3 bg-gaming-secondary text-white rounded-lg hover:bg-gaming-secondary/80 transition-colors block text-center"
              >
                🏠 Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}

