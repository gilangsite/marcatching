import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Marcatching',
  description: 'Privacy Policy for Marcatching platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="section container" style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" className="btn btn-ghost">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="card" style={{ padding: '40px' }}>
        <h1 className="text-4xl font-bold" style={{ marginBottom: '24px' }}>Privacy Policy</h1>
        <p className="text-base text-secondary" style={{ marginBottom: '32px' }}>
          Last updated: May 16, 2026
        </p>

        <div className="flex flex-col gap-6 text-base text-secondary" style={{ lineHeight: '1.8' }}>
          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>1. Introduction</h2>
            <p>
              Welcome to Marcatching. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>2. Information We Collect</h2>
            <p>
              We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information. We also automatically collect certain information when you visit, use or navigate the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>4. Will Your Information Be Shared With Anyone?</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold" style={{ color: '#fff', marginBottom: '12px' }}>5. How Long Do We Keep Your Information?</h2>
            <p>
              We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
