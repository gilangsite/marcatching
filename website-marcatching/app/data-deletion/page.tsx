import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Data Deletion Policy | Marcatching',
  description: 'Learn how to request data deletion on Marcatching.',
};

export default function DataDeletionPage() {
  return (
    <main className="section container" style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="btn btn-ghost">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="card" style={{ padding: '40px' }}>
        <h1 className="text-4xl font-bold" style={{ marginBottom: '24px' }}>Data Deletion Policy</h1>
        <p className="text-base text-secondary" style={{ marginBottom: '32px' }}>
          Last updated: May 16, 2026
        </p>

        <div className="flex flex-col gap-6 text-base text-secondary" style={{ lineHeight: '1.8' }}>
          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>1. Your Right to Deletion</h2>
            <p>
              At Marcatching, we respect your privacy and your right to control your personal data. You have the right to request the deletion of your personal information collected and maintained by our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>2. How to Request Deletion</h2>
            <p style={{ marginBottom: '12px' }}>
              To request the deletion of your data, you can contact our support team using the following methods:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Email:</strong> Send a request to support@marcatching.com with the subject line "Data Deletion Request".</li>
              <li><strong>In-App:</strong> Navigate to your account settings and select the "Delete Account" option.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>3. Processing Time</h2>
            <p>
              Once we receive your verified request, we will process your data deletion within 30 days. Please note that certain data may be retained for legal, security, or anti-fraud purposes as permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>4. What Happens When Your Data is Deleted?</h2>
            <p>
              When your data is deleted, your account will be permanently closed, and you will lose access to all Marcatching services, campaign histories, and saved preferences. This action is irreversible.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
