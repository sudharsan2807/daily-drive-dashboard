import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateSwitcherProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  viewMode: 'day' | 'month';
  onViewModeChange: (mode: 'day' | 'month') => void;
}

export const DateSwitcher = ({ 
  currentDate, 
  onDateChange, 
  viewMode, 
  onViewModeChange 
}: DateSwitcherProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const current = new Date(currentDate);

  const getDateLabel = () => {
    const diff = Math.floor((new Date(currentDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    
    return current.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePrevDay = () => {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    onDateChange(next.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(today);
  };

  const getMonthLabel = () => {
    return current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    const prev = new Date(current);
    prev.setMonth(prev.getMonth() - 1);
    onDateChange(prev.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    const next = new Date(current);
    next.setMonth(next.getMonth() + 1);
    onDateChange(next.toISOString().split('T')[0]);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date.toISOString().split('T')[0]);
      setCalendarOpen(false);
      onViewModeChange('day');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={viewMode === 'day' ? handlePrevDay : handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {viewMode === 'month' ? (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="min-w-[120px] font-medium">
                  {getMonthLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={current}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span className="min-w-[120px] text-center font-medium">
              {getDateLabel()}
            </span>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={viewMode === 'day' ? handleNextDay : handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {viewMode === 'day' && currentDate !== today && (
            <Button variant="outline" size="sm" onClick={handleToday} className="text-xs h-7">
              Today
            </Button>
          )}
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className="text-xs h-7"
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className="text-xs h-7"
          >
            Month
          </Button>
        </div>
      </div>
    </div>
  );
};