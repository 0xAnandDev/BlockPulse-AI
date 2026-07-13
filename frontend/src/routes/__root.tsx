import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SidebarNav from '../components/SidebarNav'

const APP_ROUTE_PREFIX = /^\/(dashboard|wallets|alerts|ai-insights|notifications|settings|profile)(\/|$)/

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAppRoute = APP_ROUTE_PREFIX.test(pathname)

  return (
    <>
      {!isAppRoute && (
        <>
          <Header />
          <SidebarNav />
        </>
      )}
      <Outlet />
      {!isAppRoute && <Footer />}
    </>
  )
}
