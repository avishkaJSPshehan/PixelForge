import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us – PixelForge | Get in Touch with ByteBuilders',
  description:
    'Have a bug report, feature request, or business inquiry? Contact the ByteBuilders team behind PixelForge. We read every message and typically respond within 1–2 business days.',
  alternates: { canonical: 'https://www.pixel-forge.online/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
