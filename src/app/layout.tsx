import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import MenuToggle from './components/MenuToggle'
import Logo from './components/Logo'
import InactivityHandler from './components/InactivityHandler'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

// Debug environment variables
console.log('Firebase config check:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} 
                  bg-gradient-to-br from-green-50 to-blue-50
                  dark:from-gray-900 dark:to-gray-800
                  transition-colors duration-300
                  min-h-screen`}
      >
        <ThemeProvider>
          <AuthProvider>
            <InactivityHandler>
              <header>
                <div className="max-w-4xl mx-auto px-4">
                  <div className="h-16 flex items-center">
                    <div className="flex-1">
                      <div className="md:hidden">
                        <MenuToggle />
                      </div>
                      <div className="hidden md:block">
                        <ThemeToggle showThemeToggle={false} />
                      </div>
                    </div>
                    
                    <div className="flex-1 flex justify-center">
                      <Logo />
                    </div>
                    
                    <div className="flex-1 flex justify-end">
                      <div className="block">
                        <ThemeToggle showProfileControls={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              <div className="text-center py-3">
                <p className="text-sm sm:text-base font-space-grotesk font-bold
                           text-green-800 dark:text-green-400 tracking-wide uppercase">
                  Your <span className="italic underline decoration-2 underline-offset-2">Ultimate</span> Camping Checklist
                </p>
              </div>
              <main className="max-w-4xl mx-auto px-4 pt-8">
                {children}
              </main>
            </InactivityHandler>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
