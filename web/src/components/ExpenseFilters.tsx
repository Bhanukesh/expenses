'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, Filter } from 'lucide-react'
import type { ExpenseFilters } from '@/hooks/useExpenseFilters'

interface ExpenseFiltersProps {
  filters: ExpenseFilters
  availableCategories: string[]
  hasActiveFilters: boolean
  onUpdateFilter: <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => void
  onClearFilters: () => void
}

export function ExpenseFiltersComponent({
  filters,
  availableCategories,
  hasActiveFilters,
  onUpdateFilter,
  onClearFilters
}: ExpenseFiltersProps) {
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ] as const

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Date Range */}
          <div>
            <p className="text-sm font-medium mb-2">Time Period</p>
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={filters.dateRange === value ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => onUpdateFilter('dateRange', value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.category === 'all' ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => onUpdateFilter('category', 'all')}
                >
                  All Categories
                </Badge>
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.category === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => onUpdateFilter('category', category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amount Range */}
          <div>
            <p className="text-sm font-medium mb-2">Amount Range</p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min $"
                value={filters.minAmount ?? ''}
                onChange={(e) => onUpdateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                className="w-24"
              />
              <span className="self-center text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max $"
                value={filters.maxAmount ?? ''}
                onChange={(e) => onUpdateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}