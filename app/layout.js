import { Crimson_Pro, Playfair_Display } from 'next/font/google';
import './globals.css';

const crimson = Crimson_Pro({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

export const metadata = {
  title: 'Storytime — AI Bedtime Story Narrator',
  description:
    'Generate personalized bedtime stories for your child and listen to them narrated in a warm voice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${crimson.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}