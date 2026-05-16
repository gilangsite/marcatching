import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Marcatching',
  description: 'Terms of Service for using the Marcatching platform.',
};

export default function TermsOfServicePage() {
  return (
    <main className="section container" style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="btn btn-ghost">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="card" style={{ padding: '40px' }}>
        <h1 className="text-4xl font-bold" style={{ marginBottom: '24px' }}>Terms of Service</h1>
        <p className="text-base text-secondary" style={{ marginBottom: '32px' }}>
          Last updated: May 16, 2026
        </p>

        <div className="flex flex-col gap-6 text-base text-secondary" style={{ lineHeight: '1.8' }}>
          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Marcatching ("Company", “we”, “us”, or “our”), concerning your access to and use of the marcatching.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>3. User Representations</h2>
            <p style={{ marginBottom: '12px' }}>
              By using the Site, you represent and warrant that:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>4. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>5. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
