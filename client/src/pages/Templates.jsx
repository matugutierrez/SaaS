import { useState } from 'react';

const templates = [
  {
    name: 'Bug Tracking',
    description: 'Standard bug reporting and tracking workflow',
    icon: '🐛',
    columns: ['To Do', 'In Progress', 'Review', 'Testing', 'Done'],
  },
  {
    name: 'Sprint Planning',
    description: 'Agile sprint with backlog management',
    icon: '🏃',
    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    name: 'Content Calendar',
    description: 'Plan and track content creation',
    icon: '📝',
    columns: ['Idea', 'Writing', 'Review', 'Scheduled', 'Published'],
  },
  {
    name: 'Product Roadmap',
    description: 'Track features from ideation to launch',
    icon: '🗺️',
    columns: ['Discovery', 'Design', 'Development', 'Testing', 'Launched'],
  },
  {
    name: 'Support Queue',
    description: 'Manage customer support tickets',
    icon: '🎫',
    columns: ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
  },
  {
    name: 'HR Onboarding',
    description: 'New employee onboarding checklist',
    icon: '👤',
    columns: ['To Do', 'In Progress', 'Review', 'Done'],
  },
];

export default function Templates() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Templates</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Pre-built board templates to get started quickly</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t, i) => (
          <button key={i} onClick={() => setSelected(selected === i ? null : i)}
            className={`text-left bg-white dark:bg-gray-900 rounded-2xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
              selected === i ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' : 'border-gray-100 dark:border-gray-800'
            }`}>
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {t.columns.map((c, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">{c}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
