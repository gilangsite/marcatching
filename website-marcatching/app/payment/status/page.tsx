import PaymentStatusClient from './PaymentStatusClient'

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>
}) {
  const query = await searchParams
  return (
    <PaymentStatusClient
      orderId={query.order || ''}
      publicStatusToken={query.token || ''}
    />
  )
}
