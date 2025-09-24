interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export function StatsCard({ title, value, icon: Icon, change, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`inline-flex items-center justify-center p-3 rounded-md ${colorClasses[color]} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span
              className={`font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            <span className="text-gray-500"> from last month</span>
          </div>
        </div>
      )}
    </div>
  )
}