import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// POST — Record analytics event (page_view or click)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, page_path, link_id, link_title, session_id, referrer, user_agent } = body

    if (!event_type || !['page_view', 'click'].includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      page_path: page_path || null,
      link_id: link_id || null,
      link_title: link_title || null,
      session_id: session_id || null,
      referrer: referrer || null,
      user_agent: user_agent || null,
    })

    if (error) {
      console.error('Analytics insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// GET — Query aggregated analytics for admin dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'start and end query params required' }, { status: 400 })
  }

  try {
    // Fetch all events in range
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Analytics query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const allEvents = events || []

    // Aggregate KPIs
    const pageViews = allEvents.filter(e => e.event_type === 'page_view')
    const clicks = allEvents.filter(e => e.event_type === 'click')

    const uniqueVisitors = new Set(pageViews.map(e => e.session_id).filter(Boolean)).size
    const totalPageViews = pageViews.length
    const totalClicks = clicks.length
    const ctr = totalPageViews > 0 ? ((totalClicks / totalPageViews) * 100) : 0

    // Button performance breakdown
    const buttonClicksMap: Record<string, { link_id: string; link_title: string; clicks: number }> = {}
    for (const ev of clicks) {
      if (ev.link_id) {
        if (!buttonClicksMap[ev.link_id]) {
          buttonClicksMap[ev.link_id] = {
            link_id: ev.link_id,
            link_title: ev.link_title || 'Unknown',
            clicks: 0,
          }
        }
        buttonClicksMap[ev.link_id].clicks++
      }
    }

    const buttonPerformance = Object.values(buttonClicksMap)
      .sort((a, b) => b.clicks - a.clicks)

    // Daily trend data (for sparkline/chart)
    const dailyMap: Record<string, { views: number; clicks: number; visitors: Set<string> }> = {}
    for (const ev of allEvents) {
      const day = ev.created_at.substring(0, 10) // YYYY-MM-DD
      if (!dailyMap[day]) {
        dailyMap[day] = { views: 0, clicks: 0, visitors: new Set() }
      }
      if (ev.event_type === 'page_view') {
        dailyMap[day].views++
        if (ev.session_id) dailyMap[day].visitors.add(ev.session_id)
      } else if (ev.event_type === 'click') {
        dailyMap[day].clicks++
      }
    }

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        views: data.views,
        clicks: data.clicks,
        visitors: data.visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top pages
    const pageMap: Record<string, number> = {}
    for (const ev of pageViews) {
      const path = ev.page_path || '/'
      pageMap[path] = (pageMap[path] || 0) + 1
    }
    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Traffic Sources
    const visitorsBySource = new Map<string, Set<string>>()
    for (const ev of pageViews) {
      if (!ev.session_id) continue
      
      let source = 'Direct URL'
      const ref = (ev.referrer || '').toLowerCase()
      const path = (ev.page_path || '').toLowerCase()
      
      // WhatsApp Detection:
      // 1. By Referrer (web.whatsapp, wa.me, com.whatsapp)
      // 2. By URL parameters (?ref=wa, ?utm_source=whatsapp, ?source=whatsapp)
      const isWhatsApp = 
        ref.includes('whatsapp') || 
        ref.includes('wa.me') ||
        path.includes('utm_source=whatsapp') || 
        path.includes('utm_source=wa') ||
        path.includes('source=whatsapp') ||
        path.includes('ref=whatsapp') ||
        path.includes('ref=wa') ||
        path.includes('source=wa')

      if (isWhatsApp) {
        source = 'WhatsApp'
      } else if (ref.includes('instagram.com') || path.includes('utm_source=ig') || path.includes('utm_source=instagram')) {
        source = 'Instagram'
      } else if (ref.includes('tiktok.com') || path.includes('utm_source=tiktok')) {
        source = 'TikTok'
      } else if (ref.includes('facebook') || ref.includes('fb.com')) {
        source = 'Facebook'
      } else if (ref.includes('google')) {
        source = 'Google'
      } else if (ref) {
        // You could put generic External Sites here, but keeping it simple
        source = 'External Link / Others'
      }

      if (!visitorsBySource.has(source)) {
        visitorsBySource.set(source, new Set())
      }
      visitorsBySource.get(source)!.add(ev.session_id)
    }
    
    const trafficSources = Array.from(visitorsBySource.entries())
      .map(([source, set]) => ({ source, count: set.size }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      kpi: {
        uniqueVisitors,
        totalPageViews,
        totalClicks,
        ctr: Math.round(ctr * 100) / 100,
      },
      buttonPerformance,
      dailyTrend,
      topPages,
      trafficSources,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
