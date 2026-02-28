import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white flex min-h-screen`}>
        {/* SIDEBAR: Stays fixed on the left */}
        <aside className="w-72 border-r border-zinc-900 p-8 flex flex-col fixed h-full bg-black/60 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">🏋️</div>
            <div>
              <div className="text-sm font-black tracking-tighter">IRON BLUEPRINT</div>
              <div className="text-[11px] text-zinc-500">Plan. Track. Improve.</div>
            </div>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <Link href="/" className="px-3 py-2 rounded-lg font-semibold hover:bg-white/3 transition">Dashboard</Link>
            <Link href="#" className="px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/3 transition">History</Link>
            <Link href="#" className="px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/3 transition">Templates</Link>
          </nav>

          <div className="mt-auto pt-6">
            <div className="text-[12px] text-zinc-500">Signed in as</div>
            <div className="mt-2 text-sm font-bold">User</div>
          </div>
        </aside>

        {/* CONTENT AREA: Pushed 72px from the left to prevent overlap */}
        <main className="flex-1 ml-72 p-12 min-h-screen bg-transparent">
          <div className="container">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}