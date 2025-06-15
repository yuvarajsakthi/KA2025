
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FilterControlsProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  leetcodeSolved: { min: number; max: number } | null;
  hackerrankStars: number | null;
  problemsRange: 'all' | 'beginner' | 'intermediate' | 'advanced';
  showOnlineOnly: boolean;
}

export const FilterControls = ({ onFilterChange, currentFilters }: FilterControlsProps) => {
  const handleLeetCodeFilter = (range: string) => {
    let leetcodeSolved = null;
    
    switch (range) {
      case 'beginner':
        leetcodeSolved = { min: 0, max: 50 };
        break;
      case 'intermediate':
        leetcodeSolved = { min: 51, max: 200 };
        break;
      case 'advanced':
        leetcodeSolved = { min: 201, max: 9999 };
        break;
      default:
        leetcodeSolved = null;
    }
    
    onFilterChange({
      ...currentFilters,
      leetcodeSolved,
      problemsRange: range as FilterOptions['problemsRange']
    });
  };

  const handleHackerRankFilter = (stars: number | null) => {
    onFilterChange({
      ...currentFilters,
      hackerrankStars: stars
    });
  };

  const handleOnlineFilter = () => {
    onFilterChange({
      ...currentFilters,
      showOnlineOnly: !currentFilters.showOnlineOnly
    });
  };

  const resetFilters = () => {
    onFilterChange({
      leetcodeSolved: null,
      hackerrankStars: null,
      problemsRange: 'all',
      showOnlineOnly: false
    });
  };

  const hasActiveFilters = currentFilters.leetcodeSolved || 
                          currentFilters.hackerrankStars || 
                          currentFilters.problemsRange !== 'all' || 
                          currentFilters.showOnlineOnly;

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <DropdownMenuLabel>LeetCode Problems</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleLeetCodeFilter('all')}>
            All Levels
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLeetCodeFilter('beginner')}>
            Beginner (0-50)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLeetCodeFilter('intermediate')}>
            Intermediate (51-200)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLeetCodeFilter('advanced')}>
            Advanced (200+)
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>HackerRank Stars</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleHackerRankFilter(null)}>
            All Stars
          </DropdownMenuItem>
          {[1, 2, 3, 4, 5].map((star) => (
            <DropdownMenuItem key={star} onClick={() => handleHackerRankFilter(star)}>
              {star}+ Stars
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOnlineFilter}>
            {currentFilters.showOnlineOnly ? '✓' : ''} Online Users Only
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
