import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Woodstock & Wifi Media Manager - Agent',
  description: '',
};

export default async function Page() {
  return redirect('/agents/new');
}
