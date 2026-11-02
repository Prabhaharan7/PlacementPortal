import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import {
    Calendar, Clock, Monitor, MapPin, User, CheckCircle,
    XCircle, AlertCircle, BookOpen, ChevronRight, Video, Coffee
} from 'lucide-react';

/* ─── helpers ─── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const am = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${am}`;
}

const STATUS_CONFIG = {
    booked: { label: 'Booked', color: 'text-blue-400   bg-blue-400/10   border-blue-400/30' },
    completed: { label: 'Completed', color: 'text-green-400  bg-green-400/10  border-green-400/30' },
    cancelled: { label: 'Cancelled', color: 'text-red-400    bg-red-400/10    border-red-400/30' },
    no_show: { label: 'No Show', color: 'text-gray-400   bg-gray-400/10   border-gray-400/30' },
};

/* ─── Calendar mini-widget ─── */
const MiniCalendar = ({ slots, selectedDate, onDateSelect }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay(); // 0=Sun
    const days = new Date(year, month + 1, 0).getDate();

    // Collect dates that have slots
    const slotDates = new Set(slots.map(s => s.date));

    const prev = () => setViewDate(new Date(year, month - 1, 1));
    const next = () => setViewDate(new Date(year, month + 1, 1));

    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prev} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-secondary transition-colors">‹</button>
                <span className="font-semibold text-text-primary text-sm">{MONTH_NAMES[month]} {year}</span>
                <button onClick={next} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-secondary transition-colors">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(d => <div key={d} className="text-center text-xs text-text-secondary font-medium">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const hasSlot = slotDates.has(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const today = new Date();
                    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    return (
                        <button key={i} onClick={() => hasSlot && onDateSelect(dateStr)}
                            className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
                                ${isSelected ? 'bg-accent text-white font-bold' :
                                    hasSlot ? 'bg-accent/20 text-accent hover:bg-accent/30 font-semibold cursor-pointer' :
                                        isToday ? 'border border-border text-text-primary' :
                                            'text-text-secondary cursor-default'}`}>
                            {d}
                            {hasSlot && !isSelected && <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Slot Card ─── */
const SlotCard = ({ slot, myBooking, onBook, onCancel, booking }) => {
    const available = slot.available;
    const isBooked = !!myBooking;
    const isFull = !available && !isBooked;

    return (
        <div className={`bg-card border rounded-2xl p-5 transition-all ${isBooked ? 'border-blue-500/50 shadow-blue-500/10 shadow-lg' : isFull ? 'border-border opacity-60' : 'border-border hover:border-accent/40 card-hover'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBooked ? 'bg-blue-500/20' : 'bg-accent/20'}`}>
                        {slot.mode === 'online' ? <Video className={`w-5 h-5 ${isBooked ? 'text-blue-400' : 'text-accent'}`} /> : <Coffee className={`w-5 h-5 ${isBooked ? 'text-blue-400' : 'text-accent'}`} />}
                    </div>
                    <div>
                        <p className="font-semibold text-text-primary text-sm">{formatTime(slot.start_time)}</p>
                        <p className="text-text-secondary text-xs">{slot.duration_mins} mins · {slot.mode === 'online' ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                {isBooked ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-blue-400 text-xs font-semibold">Booked</span>
                    </div>
                ) : isFull ? (
                    <span className="text-xs text-text-secondary bg-secondary px-2.5 py-1 rounded-full border border-border">Full</span>
                ) : (
                    <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 px-2.5 py-1 rounded-full">Open</span>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <User className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                    <span>{slot.interviewer}</span>
                </div>
                {slot.notes && (
                    <div className="flex items-start gap-2 text-xs text-text-secondary">
                        <BookOpen className="w-3.5 h-3.5 text-text-secondary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{slot.notes}</span>
                    </div>
                )}
                <div className="text-xs text-text-secondary">
                    {slot.booked_count}/{slot.max_students} students booked
                </div>
            </div>

            {isBooked ? (
                <button onClick={() => onCancel(slot.id)}
                    className="w-full py-2.5 border border-red-500/40 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors">
                    Cancel Booking
                </button>
            ) : !isFull ? (
                <button onClick={() => onBook(slot.id)}
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-accent/20">
                    Book Slot
                </button>
            ) : (
                <div className="w-full py-2.5 bg-secondary rounded-xl text-center text-text-secondary text-sm">Fully Booked</div>
            )}
        </div>
    );
};

/* ─── Main Page ─── */
const InterviewPage = () => {
    const [slots, setSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | mybookings
    const [actionLoading, setActionLoading] = useState(null);
    const [msg, setMsg] = useState(null); // {type, text}

    const fetchAll = async () => {
        try {
            const [slotsRes, bookRes] = await Promise.all([
                apiCall('/api/interviews/slots/'),
                apiCall('/api/interviews/mybookings/'),
            ]);
            setSlots(slotsRes.slots || []);
            setMyBookings(bookRes.bookings || []);

            // Auto-select first date with slots
            if (slotsRes.slots?.length && !selectedDate) {
                setSelectedDate(slotsRes.slots[0].date);
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 4000);
    };

    const handleBook = async (slotId) => {
        setActionLoading(slotId);
        try {
            await apiCall(`/api/interviews/slots/${slotId}/book/`, { method: 'POST' });
            showMsg('success', 'Slot booked successfully!');
            await fetchAll();
        } catch (e) {
            showMsg('error', e.message || 'Booking failed. Slot may be full.');
        }
        setActionLoading(null);
    };

    const handleCancel = async (slotId) => {
        if (!confirm('Cancel this booking?')) return;
        setActionLoading(slotId);
        try {
            await apiCall(`/api/interviews/slots/${slotId}/cancel/`, { method: 'POST' });
            showMsg('success', 'Booking cancelled.');
            await fetchAll();
        } catch (e) {
            showMsg('error', e.message || 'Cancel failed.');
        }
        setActionLoading(null);
    };

    // Build a map: slotId → booking
    const bookedMap = Object.fromEntries(myBookings.map(b => [b.slot_id, b]));

    const filteredSlots = selectedDate
        ? slots.filter(s => s.date === selectedDate)
        : slots;

    const upcomingBookings = myBookings.filter(b => b.status === 'booked');

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Interview Scheduling</h1>
                    <p className="text-text-secondary text-sm">Browse and book mock interview slots</p>
                </div>
                {upcomingBookings.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-semibold">{upcomingBookings.length} upcoming</span>
                    </div>
                )}
            </div>

            {/* Toast message */}
            {msg && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {msg.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary rounded-2xl p-1.5 w-fit">
                {[['upcoming', 'Browse Slots'], ['mybookings', 'My Bookings']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                        {label}
                        {id === 'mybookings' && upcomingBookings.length > 0 &&
                            <span className="ml-1.5 w-5 h-5 inline-flex items-center justify-center bg-accent text-white text-xs rounded-full">{upcomingBookings.length}</span>}
                    </button>
                ))}
            </div>

            {/* ── Browse Slots ── */}
            {activeTab === 'upcoming' && (
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Calendar */}
                    <div className="space-y-4">
                        <MiniCalendar slots={slots} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                        {selectedDate && (
                            <div className="text-center">
                                <p className="text-text-secondary text-xs">Showing slots for</p>
                                <p className="text-accent font-semibold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <button onClick={() => setSelectedDate(null)} className="text-xs text-text-secondary hover:text-text-primary mt-1 underline">Clear filter</button>
                            </div>
                        )}
                    </div>

                    {/* Slots grid */}
                    <div>
                        {filteredSlots.length === 0 ? (
                            <div className="bg-card border border-border rounded-2xl p-16 text-center">
                                <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                                <p className="text-text-primary font-semibold mb-1">
                                    {selectedDate ? 'No slots on this date' : 'No interview slots available'}
                                </p>
                                <p className="text-text-secondary text-sm">Check back later or ask your placement coordinator</p>
                            </div>
                        ) : (
                            <>
                                {/* Group by date if no date selected */}
                                {!selectedDate ? (
                                    (() => {
                                        const groups = {};
                                        filteredSlots.forEach(s => {
                                            if (!groups[s.date]) groups[s.date] = [];
                                            groups[s.date].push(s);
                                        });
                                        return Object.entries(groups).map(([date, dateSlots]) => (
                                            <div key={date} className="mb-6">
                                                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                    {dateSlots.map(slot => (
                                                        <SlotCard key={slot.id} slot={slot} myBooking={bookedMap[slot.id]}
                                                            onBook={handleBook} onCancel={handleCancel} />
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {filteredSlots.map(slot => (
                                            <SlotCard key={slot.id} slot={slot} myBooking={bookedMap[slot.id]}
                                                onBook={handleBook} onCancel={handleCancel} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── My Bookings ── */}
            {activeTab === 'mybookings' && (
                <div className="space-y-4">
                    {myBookings.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-16 text-center">
                            <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                            <p className="text-text-primary font-semibold mb-1">No bookings yet</p>
                            <p className="text-text-secondary text-sm">Go to "Browse Slots" to book your first interview slot</p>
                        </div>
                    ) : (
                        myBookings.map(b => {
                            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.booked;
                            return (
                                <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-accent font-bold text-sm leading-none">{new Date(b.date + 'T00:00:00').getDate()}</span>
                                            <span className="text-accent text-[10px]">{MONTH_NAMES[new Date(b.date + 'T00:00:00').getMonth()].slice(0, 3)}</span>
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-semibold text-sm">{formatTime(b.start_time)} — {b.interviewer}</p>
                                            <p className="text-text-secondary text-xs mt-0.5">{b.duration_mins} mins · {b.mode === 'online' ? 'Online' : 'Offline'}</p>
                                            {b.feedback && <p className="text-blue-400 text-xs mt-1 italic">"{b.feedback}"</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>{cfg.label}</span>
                                        {b.status === 'booked' && (
                                            <button onClick={() => handleCancel(b.slot_id)}
                                                className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewPage;
