import React, { useState } from 'react';
import { ChevronLeft, ChevronRight,Check, X, Clock,Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface MeetingRequest {
  id: string;
  from: string;
  fromAvatar: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
  topic: string;
}

interface ConfirmedMeeting {
  id: string;
  with: string;
  withAvatar: string;
  date: string;
  time: string;
  topic: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  times.forEach((time, i) => {
    slots.push({ id: `slot-${i}`, time, available: Math.random() > 0.4 });
  });
  return slots;
};

const initialRequests: MeetingRequest[] = [
  {
    id: 'mr1',
    from: 'Michael Rodriguez',
    fromAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    date: '2024-03-20',
    time: '2:00 PM',
    status: 'pending',
    topic: 'Investment discussion for NexusWave'
  },
  {
    id: 'mr2',
    from: 'Jennifer Lee',
    fromAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    date: '2024-03-22',
    time: '10:00 AM',
    status: 'pending',
    topic: 'Series A funding overview'
  }
];

const confirmedMeetings: ConfirmedMeeting[] = [
  {
    id: 'cm1',
    with: 'Robert Torres',
    withAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    date: '2024-03-18',
    time: '3:00 PM',
    topic: 'Initial pitch review'
  },
  {
    id: 'cm2',
    with: 'Jennifer Lee',
    withAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    date: '2024-03-25',
    time: '11:00 AM',
    topic: 'Follow-up on sustainable packaging'
  }
];

export const CalendarPage: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [requests, setRequests] = useState<MeetingRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests' | 'confirmed'>('calendar');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const toggleSlot = (id: string) => {
    setTimeSlots(slots => slots.map(s => s.id === id ? { ...s, available: !s.available } : s));
  };

  const handleRequest = (id: string, status: 'accepted' | 'declined') => {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleSaveAvailability = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const calendarDays: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const meetingDates = new Set(confirmedMeetings.map(m => parseInt(m.date.split('-')[2])));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h1>
          <p className="text-gray-600">Manage your availability and meeting requests</p>
        </div>
      </div>

      {}
      <div className="flex gap-2 border-b border-gray-200">
        {(['calendar', 'requests', 'confirmed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {tab === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                      className={`
                        relative h-10 w-full rounded-lg text-sm font-medium transition-colors
                        ${!day ? 'invisible' : ''}
                        ${day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                          ? 'ring-2 ring-primary-500 ring-offset-1'
                          : ''}
                        ${day === selectedDate
                          ? 'bg-primary-600 text-white'
                          : day ? 'hover:bg-gray-100 text-gray-700' : ''}
                      `}
                    >
                      {day}
                      {day && meetingDates.has(day) && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${day === selectedDate ? 'bg-white' : 'bg-primary-500'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {}
            {selectedDate && (
              <Card className="mt-4">
                <CardHeader>
                  <h3 className="font-medium text-gray-900">
                    {MONTHS[currentMonth]} {selectedDate} — Meetings
                  </h3>
                </CardHeader>
                <CardBody>
                  {confirmedMeetings.filter(m => parseInt(m.date.split('-')[2]) === selectedDate).length > 0 ? (
                    confirmedMeetings
                      .filter(m => parseInt(m.date.split('-')[2]) === selectedDate)
                      .map(m => (
                        <div key={m.id} className="flex items-center p-3 bg-primary-50 rounded-lg">
                          <Avatar src={m.withAvatar} alt={m.with} size="sm" className="mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{m.with}</p>
                            <p className="text-xs text-gray-500">{m.topic}</p>
                          </div>
                          <div className="flex items-center text-xs text-primary-700">
                            <Clock size={12} className="mr-1" />
                            {m.time}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No meetings scheduled for this day</p>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          {}
          <div>
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">My Availability</h3>
                <p className="text-xs text-gray-500 mt-1">Toggle your available time slots</p>
              </CardHeader>
              <CardBody className="space-y-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlot(slot.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                      slot.available
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2" />
                      {slot.time}
                    </div>
                    <Badge variant={slot.available ? 'success' : 'gray'} size="sm">
                      {slot.available ? 'Available' : 'Blocked'}
                    </Badge>
                  </button>
                ))}
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <Button
                    className="w-full shadow-premium"
                    size="sm"
                    onClick={handleSaveAvailability}
                    isLoading={isSaving}
                  >
                    Save Availability
                  </Button>
                  {showSuccess && (
                    <p className="text-xs text-success-600 text-center font-medium animate-fade-in">
                      Availability updated successfully!
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No meeting requests</p>
              </CardBody>
            </Card>
          ) : (
            requests.map(req => (
              <Card key={req.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar src={req.fromAvatar} alt={req.from} size="md" />
                      <div>
                        <h3 className="font-medium text-gray-900">{req.from}</h3>
                        <p className="text-sm text-gray-600 mt-1">{req.topic}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center"><Calendar size={12} className="mr-1" />{req.date}</span>
                          <span className="flex items-center"><Clock size={12} className="mr-1" />{req.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            leftIcon={<Check size={14} />}
                            onClick={() => handleRequest(req.id, 'accepted')}
                          >Accept</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<X size={14} />}
                            onClick={() => handleRequest(req.id, 'declined')}
                          >Decline</Button>
                        </div>
                      ) : (
                        <Badge variant={req.status === 'accepted' ? 'success' : 'error'}>
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          {confirmedMeetings.map(meeting => (
            <Card key={meeting.id}>
              <CardBody>
                <div className="flex items-center gap-4">
                  <Avatar src={meeting.withAvatar} alt={meeting.with} size="md" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{meeting.with}</h3>
                    <p className="text-sm text-gray-600">{meeting.topic}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center"><Calendar size={12} className="mr-1" />{meeting.date}</span>
                      <span className="flex items-center"><Clock size={12} className="mr-1" />{meeting.time}</span>
                    </div>
                  </div>
                  <Badge variant="success">Confirmed</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};