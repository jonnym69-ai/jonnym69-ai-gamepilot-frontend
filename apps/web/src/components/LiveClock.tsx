import { useEffect, useState } from 'react'

export function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="text-right text-gray-300">
      <div className="text-2xl font-semibold">{time}</div>
      <div className="text-sm opacity-70">{date}</div>
    </div>
  )
}
