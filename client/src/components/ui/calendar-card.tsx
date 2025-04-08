import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { CalendarEvent } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  today: Date;
}

const CalendarDay = ({ day, currentMonth, events, today }: CalendarDayProps) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, today);
  
  // Check if there are events on this day
  const dayEvents = events.filter(event => isSameDay(parseISO(event.startTime.toString()), day));
  
  // Get styles for the event indicators
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-primary';
      case 'call':
        return 'bg-green-600';
      case 'reminder':
        return 'bg-red-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div 
      className={`text-center py-1 relative ${
        !isCurrentMonth ? 'text-neutral-300' : ''
      } ${
        isToday ? 'bg-primary text-white rounded-full' : ''
      }`}
    >
      {day.getDate()}
      
      {/* Event indicators */}
      {dayEvents.length > 0 && isCurrentMonth && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {dayEvents.slice(0, 3).map((event, index) => (
            <div 
              key={index} 
              className={`w-1 h-1 rounded-full ${getEventTypeColor(event.type)}`} 
              title={event.title}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UpcomingEventCard = ({ event }: { event: CalendarEvent }) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-neutral-50 border-neutral-100';
      case 'call':
        return 'bg-blue-50 border-blue-100';
      case 'reminder':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-neutral-50 border-neutral-100';
    }
  };

  const getEventTypeIconColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'text-neutral-600';
      case 'call':
        return 'text-primary';
      case 'reminder':
        return 'text-green-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className={`p-3 rounded-md ${getEventTypeColor(event.type)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CalendarIcon className={`h-4 w-4 ${getEventTypeIconColor(event.type)}`} />
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-neutral-900">{event.title}</p>
          <p className="text-xs text-neutral-600">
            {format(new Date(event.startTime), "MMM d 'at' h:mm a")} 
            ({Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60))} min)
          </p>
        </div>
      </div>
    </div>
  );
};

const CalendarCard = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  
  const { data: events, isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
  });

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "EEE";
    const days = [];
    let day = startDate;
    
    // Header row with day names
    const daysHeader = [];
    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={`header-${i}`} className="text-neutral-500">
          {format(addDays(startDate, i), dateFormat).charAt(0)}
        </div>
      );
    }
    days.push(<div key="header" className="grid grid-cols-7 gap-1 text-center text-xs mb-2">{daysHeader}</div>);

    // Date cells
    let formattedDate = '';
    let daysInMonth = [];
    let dayOfWeek = 0;
    
    while (day <= endDate) {
      formattedDate = format(day, 'd');
      
      daysInMonth.push(
        <CalendarDay 
          key={day.toString()} 
          day={day} 
          currentMonth={currentMonth} 
          events={events || []} 
          today={today} 
        />
      );
      
      day = addDays(day, 1);
      dayOfWeek++;
      
      if (dayOfWeek === 7) {
        days.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-1 text-xs">
            {daysInMonth}
          </div>
        );
        daysInMonth = [];
        dayOfWeek = 0;
      }
    }
    
    return days;
  };

  const getUpcomingEvents = () => {
    if (!events) return [];
    
    const now = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
      
    return upcomingEvents;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Upcoming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading calendar</div>;
  }

  const upcomingEvents = getUpcomingEvents();

  return (
    <Card>
      <CardHeader className="pb-2 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Schedule</CardTitle>
          <Button variant="link" className="text-primary p-0">Full Calendar</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium text-neutral-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="mb-4">
          {renderCalendarDays()}
        </div>
        
        {/* Upcoming Events */}
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center text-sm text-neutral-500 py-2">
              No upcoming events
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarCard;
