import { redirect } from 'next/navigation'

// /about sudah dipindahkan ke root marcatching.com
// Redirect permanen agar link lama tidak broken
export default function AboutPage() {
  redirect('/')
}
