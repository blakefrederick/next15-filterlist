import { notFound } from 'next/navigation';
import React from 'react';
import { ActionIcon } from '@/components/ui/icons/ActionIcon';
import { getTasks } from '@/data/services/weather';
import { taskStatusSchema, type TaskStatus } from '@/types/task';
import { cn } from '@/utils/cn';
import { getCategoryColor } from '@/utils/getCategoryColor';

type PageProps = {
  params: Promise<{
    tab: TaskStatus;
  }>;
  searchParams: Promise<{
    q?: string;
    category?: string | string[];
  }>;
};

export default async function TabPage({ params, searchParams }: PageProps) {
  const { tab } = await params;
  const { q, category } = await searchParams;

  try {
    taskStatusSchema.parse(tab);
  } catch (e) {
    notFound();
  }

  const data = await getTasks({
    categories: Array.isArray(category) ? category.map(Number) : category ? [Number(category)] : undefined,
    q,
    status: tab,
  });

  return (
    <div className="overflow-x-auto rounded group-has-[[data-pending]]:animate-pulse">
      <table>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col">Cache Status</th>
            <th scope="col">Cached At</th>
            <th scope="col">Revalidates At</th>
            <th scope="col">Created Date</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {data.map((task, index) => {
            const color = getCategoryColor(task.category || index);
            return (
              <tr key={index}>
                <td className="font-medium">{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <div className={cn(color, 'flex w-fit justify-center px-3 py-1 text-white dark:text-black')}>
                    {task.category || 'Uncategorized'}
                  </div>
                </td>
                <td>{task.cacheStatus}</td>
                <td>{new Date(task.cacheDate).toLocaleString()}</td>
                <td>{new Date(task.revalidateAt).toLocaleString()}</td>
                <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                <td>
                  <button aria-label="Options">
                    <ActionIcon aria-hidden="true" width={20} height={20} />
                  </button>
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td className="italic" colSpan={8}>
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
