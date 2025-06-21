
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
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
  hackerrankBadges: { min: number; max: number } | null;
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
      leetcodeSolved
    });
  };

  const handleHackerRankBadgeFilter = (range: string) => {
    let hackerrankBadges = null;
    
    switch (range) {
      case 'few':
        hackerrankBadges = { min: 1, max: 3 };
        break;
      case 'moderate':
        hackerrankBadges = { min: 4, max: 8 };
        break;
      case 'many':
        hackerrankBadges = { min: 9, max: 9999 };
        break;
      default:
        hackerrankBadges = null;
    }
    
    onFilterChange({
      ...currentFilters,
      hackerrankBadges
    });
  };

  const resetFilters = () => {
    onFilterChange({
      leetcodeSolved: null,
      hackerrankBadges: null
    });
  };

  const hasActiveFilters = currentFilters.leetcodeSolved || currentFilters.hackerrankBadges;

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
          <DropdownMenuLabel>HackerRank Badges</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleHackerRankBadgeFilter('all')}>
            All Badges
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleHackerRankBadgeFilter('few')}>
            Few (1-3)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleHackerRankBadgeFilter('moderate')}>
            Moderate (4-8)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleHackerRankBadgeFilter('many')}>
            Many (9+)
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
