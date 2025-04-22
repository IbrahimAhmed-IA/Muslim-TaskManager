'use client';

import MainLayout from '@/components/layout/main-layout';
import NotesManager from '@/components/notes/notes-manager';
import Providers from '@/providers';

export default function NotesPage() {
  return (
    <Providers>
      <MainLayout>
        <NotesManager />
      </MainLayout>
    </Providers>
  );
}
