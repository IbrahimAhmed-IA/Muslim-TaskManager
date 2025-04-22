'use client';

import MainLayout from '@/components/layout/main-layout';
import WorshipTasksManager from '@/components/worship-tasks/worship-tasks-manager';
import Providers from '@/providers';

export default function WorshipTasksPage() {
  return (
    <Providers>
      <MainLayout>
        <WorshipTasksManager />
      </MainLayout>
    </Providers>
  );
}
