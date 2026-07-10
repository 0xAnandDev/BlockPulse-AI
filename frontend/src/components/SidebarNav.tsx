import LineSidebar from './LineSidebar'

const NAV_ITEMS = [
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Detection', href: '#detection' },
  { label: 'Tech Stack', href: '#stack' },
  { label: 'GitHub', href: 'https://github.com/0xAnandDev/BlockPulse-AI' },
]

export default function SidebarNav() {
  function handleItemClick(index: number) {
    const item = NAV_ITEMS[index]
    if (!item) return
    if (item.href.startsWith('http')) {
      window.open(item.href, '_blank', 'noreferrer')
      return
    }
    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed left-8 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <LineSidebar
        items={NAV_ITEMS.map((item) => item.label)}
        accentColor="#22D3EE"
        textColor="#98a2b8"
        markerColor="#5b6478"
        showIndex
        showMarker
        proximityRadius={90}
        maxShift={22}
        falloff="smooth"
        markerLength={44}
        markerGap={0}
        tickScale={0.5}
        scaleTick
        itemGap={26}
        fontSize={0.95}
        smoothing={100}
        onItemClick={handleItemClick}
      />
    </div>
  )
}
