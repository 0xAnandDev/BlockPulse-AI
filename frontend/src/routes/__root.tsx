import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SidebarNav from '../components/SidebarNav'

import appCss from '../styles.css?url'

const APP_ROUTE_PREFIX = /^\/(dashboard|wallets|alerts|ai-insights|notifications|settings|profile)(\/|$)/

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'BlockPulse AI — AI-Powered Blockchain Intelligence',
      },
      {
        name: 'description',
        content:
          'BlockPulse AI monitors your wallets and smart contracts in real time, detects suspicious on-chain activity, and explains it in plain English so you always know what happened to your assets.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAppRoute = APP_ROUTE_PREFIX.test(pathname)

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(99,102,241,0.35)]">
        {!isAppRoute && (
          <>
            <Header />
            <SidebarNav />
          </>
        )}
        {children}
        {!isAppRoute && <Footer />}
        <Scripts />
      </body>
    </html>
  )
}
