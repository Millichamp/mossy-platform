Feature 1: Property Viewing System
Overview
A calendar-based viewing appointment system where sellers control availability and buyers book specific time slots.
Database Schema
sql-- Viewing availability rules set by seller
CREATE TABLE viewing_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id),
  is_enabled BOOLEAN DEFAULT false,
  
  -- Recurring availability
  recurring_slots JSONB, -- Array of {dayOfWeek: 0-6, startTime: "09:00", endTime: "17:00", duration: 30}
  
  -- Specific date overrides
  date_overrides JSONB, -- Array of {date: "2024-01-15", slots: [{start: "10:00", end: "10:30"}], available: true}
  
  -- Booking settings
  min_notice_hours INTEGER DEFAULT 24, -- Minimum hours notice required
  max_advance_days INTEGER DEFAULT 30, -- How far in advance can book
  buffer_minutes INTEGER DEFAULT 15, -- Buffer between viewings
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual viewing bookings
CREATE TABLE viewing_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  
  -- Booking details
  viewing_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
  
  -- Buyer details
  buyer_phone VARCHAR(20),
  buyer_message TEXT,
  number_of_viewers INTEGER DEFAULT 1,
  
  -- Seller actions
  seller_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double bookings
  UNIQUE(property_id, viewing_date, start_time)
);

-- Indexes for performance
CREATE INDEX idx_viewing_bookings_property_date ON viewing_bookings(property_id, viewing_date);
CREATE INDEX idx_viewing_bookings_buyer ON viewing_bookings(buyer_id, status);
CREATE INDEX idx_viewing_bookings_seller ON viewing_bookings(seller_id, viewing_date);
Backend Architecture
API Endpoints
typescript// viewing-availability.routes.ts
router.post('/properties/:propertyId/viewing-availability', async (req, res) => {
  /**
   * Enable viewing availability for a property
   * Body: {
   *   isEnabled: boolean,
   *   recurringSlots: Array<{
   *     dayOfWeek: number, // 0-6 (Sunday-Saturday)
   *     startTime: string, // "09:00"
   *     endTime: string,   // "17:00"
   *     duration: number   // 30 (minutes)
   *   }>,
   *   minNoticeHours: number,
   *   maxAdvanceDays: number
   * }
   */
});

router.get('/properties/:propertyId/available-slots', async (req, res) => {
  /**
   * Get available viewing slots for next X days
   * Query params: 
   *   - startDate: ISO date
   *   - endDate: ISO date
   * Returns: Array of available slots grouped by date
   */
});

router.post('/properties/:propertyId/viewing-bookings', async (req, res) => {
  /**
   * Book a viewing slot
   * Body: {
   *   viewingDate: string,
   *   startTime: string,
   *   endTime: string,
   *   buyerPhone: string,
   *   buyerMessage: string,
   *   numberOfViewers: number
   * }
   */
});
Viewing Slot Calculation Service
typescript// viewing-slots.service.ts
export class ViewingSlotService {
  /**
   * Calculate available slots for a date range
   * This is the core algorithm that handles:
   * - Recurring weekly patterns
   * - Date-specific overrides
   * - Existing bookings
   * - Buffer times
   * - Minimum notice periods
   */
  async getAvailableSlots(
    propertyId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AvailableSlotsByDate> {
    // 1. Get viewing availability settings
    const availability = await supabase
      .from('viewing_availability')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (!availability.data?.is_enabled) {
      return { enabled: false, slots: {} };
    }

    // 2. Get existing bookings for date range
    const bookings = await supabase
      .from('viewing_bookings')
      .select('viewing_date, start_time, end_time')
      .eq('property_id', propertyId)
      .gte('viewing_date', startDate)
      .lte('viewing_date', endDate)
      .in('status', ['pending', 'confirmed']);

    // 3. Calculate slots for each day
    const slots: AvailableSlotsByDate = { enabled: true, slots: {} };
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Check if date is within allowed booking window
      const hoursUntilDate = differenceInHours(currentDate, new Date());
      if (hoursUntilDate >= availability.data.min_notice_hours) {
        const daySlots = this.calculateDaySlots(
          currentDate,
          availability.data,
          bookings.data
        );
        
        if (daySlots.length > 0) {
          slots.slots[format(currentDate, 'yyyy-MM-dd')] = daySlots;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  private calculateDaySlots(
    date: Date,
    availability: ViewingAvailability,
    bookings: ViewingBooking[]
  ): TimeSlot[] {
    // Complex slot calculation logic here
    // 1. Get base slots from recurring rules
    // 2. Apply date-specific overrides
    // 3. Remove booked slots
    // 4. Add buffer times
    // 5. Return available slots
  }
}
Frontend Implementation
Seller Side - Viewing Availability Setup
tsx// EnableViewingsModal.tsx
export function EnableViewingsModal({ property, onClose, onSave }) {
  const [settings, setSettings] = useState<ViewingSettings>({
    isEnabled: false,
    recurringSlots: [
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', duration: 30 } // Saturday default
    ],
    minNoticeHours: 24,
    maxAdvanceDays: 30
  });

  return (
    <Modal>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Set Up Property Viewings</h2>
        
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Enable Viewings</h3>
            <p className="text-sm text-gray-600">
              Allow buyers to book viewing appointments
            </p>
          </div>
          <Switch
            checked={settings.isEnabled}
            onChange={(checked) => setSettings({...settings, isEnabled: checked})}
          />
        </div>

        {settings.isEnabled && (
          <>
            {/* Weekly Schedule */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Weekly Availability</h3>
              <WeeklyScheduleGrid
                slots={settings.recurringSlots}
                onChange={(slots) => setSettings({...settings, recurringSlots: slots})}
              />
            </div>

            {/* Booking Rules */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Notice Required
                </label>
                <select
                  value={settings.minNoticeHours}
                  onChange={(e) => setSettings({...settings, minNoticeHours: Number(e.target.value)})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  How far in advance can buyers book?
                </label>
                <select
                  value={settings.maxAdvanceDays}
                  onChange={(e) => setSettings({...settings, maxAdvanceDays: Number(e.target.value)})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value={14}>2 weeks</option>
                  <option value={30}>1 month</option>
                  <option value={60}>2 months</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSave(settings)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
}

// WeeklyScheduleGrid.tsx - Visual time slot selector
export function WeeklyScheduleGrid({ slots, onChange }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="border rounded-lg p-4">
      {days.map((day, index) => (
        <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
          <div className="w-12 font-medium">{day}</div>
          <DayScheduleEditor
            dayOfWeek={index}
            slots={slots.filter(s => s.dayOfWeek === index)}
            onChange={(daySlots) => {
              const otherDays = slots.filter(s => s.dayOfWeek !== index);
              onChange([...otherDays, ...daySlots]);
            }}
          />
        </div>
      ))}
    </div>
  );
}
Buyer Side - Viewing Booking Interface
tsx// ViewingBookingModal.tsx
export function ViewingBookingModal({ property, onClose }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsByDate | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    phone: '',
    message: '',
    numberOfViewers: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load available slots
  useEffect(() => {
    loadAvailableSlots();
  }, [property.id]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    const startDate = new Date();
    const endDate = addDays(startDate, 30);
    
    const response = await fetch(
      `/api/properties/${property.id}/available-slots?` +
      `startDate=${format(startDate, 'yyyy-MM-dd')}&` +
      `endDate=${format(endDate, 'yyyy-MM-dd')}`
    );
    
    const data = await response.json();
    setAvailableSlots(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return <ViewingBookingModalSkeleton />;
  }

  if (!availableSlots?.enabled) {
    return (
      <Modal>
        <div className="p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Viewings Not Available Yet</h3>
          <p className="text-gray-600 mb-6">
            The seller hasn't set up viewing times for this property yet.
          </p>
          <p className="text-sm text-gray-500">
            Save this property and check back later, or send the seller a message.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal size="lg">
      <div className="flex h-[600px]">
        {/* Left side - Calendar */}
        <div className="w-1/2 p-6 border-r">
          <h3 className="text-lg font-semibold mb-4">Select a Date</h3>
          <ViewingCalendar
            availableSlots={availableSlots.slots}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Right side - Time slots and form */}
        <div className="w-1/2 p-6">
          {!selectedDate ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Select a date to see available times</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">
                Available times for {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              
              {/* Time slot grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {availableSlots.slots[format(selectedDate, 'yyyy-MM-dd')]?.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                      p-3 rounded-lg border text-sm font-medium transition
                      ${selectedSlot?.startTime === slot.startTime
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Selected: {format(selectedDate, 'MMM d')} at {selectedSlot.startTime}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingDetails.phone}
                      onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of Viewers
                    </label>
                    <select
                      value={bookingDetails.numberOfViewers}
                      onChange={(e) => setBookingDetails({...bookingDetails, numberOfViewers: Number(e.target.value)})}
                      className="w-full border rounded-lg p-2"
                    >
                      {[1,2,3,4].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message to Seller (Optional)
                    </label>
                    <textarea
                      value={bookingDetails.message}
                      onChange={(e) => setBookingDetails({...bookingDetails, message: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      rows={3}
                      placeholder="Any special requirements or questions?"
                    />
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    Request Viewing
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
Seller Dashboard - Managing Viewing Requests
tsx// ViewingManagementDashboard.tsx
export function ViewingManagementDashboard({ propertyId }) {
  const [viewings, setViewings] = useState<ViewingBooking[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Viewing Appointments</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={filter === 'past' ? 'btn-primary' : 'btn-secondary'}
          >
            Past
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {viewings.map((viewing) => (
          <ViewingCard
            key={viewing.id}
            viewing={viewing}
            onConfirm={() => handleConfirm(viewing.id)}
            onCancel={() => handleCancel(viewing.id)}
            onComplete={() => handleComplete(viewing.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ViewingCard.tsx
function ViewingCard({ viewing, onConfirm, onCancel, onComplete }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            {format(viewing.viewingDate, 'EEEE, MMMM d')} at {viewing.startTime}
          </p>
          <p className="text-sm text-gray-600">
            {viewing.buyerName} • {viewing.numberOfViewers} viewer(s)
          </p>
          {viewing.buyerMessage && (
            <p className="text-sm mt-2 italic">"{viewing.buyerMessage}"</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {viewing.status === 'pending' && (
            <>
              <button
                onClick={onConfirm}
                className="text-green-600 hover:bg-green-50 p-2 rounded"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={onCancel}
                className="text-red-600 hover:bg-red-50 p-2 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
          {viewing.status === 'confirmed' && isPast(viewing.viewingDate) && (
            <button
              onClick={onComplete}
              className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex gap-4 text-sm">
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${viewing.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
          ${viewing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${viewing.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
        `}>
          {viewing.status}
        </span>
        <a href={`tel:${viewing.buyerPhone}`} className="text-blue-600 hover:underline">
          {viewing.buyerPhone}
        </a>
      </div>
    </div>
  );
}
Scalability Considerations

Database Performance

Indexed queries on property_id, viewing_date
Materialized views for availability calculations
Partitioning viewing_bookings table by date for large scale


Caching Strategy
typescript// Redis caching for slot availability
const cacheKey = `viewing:slots:${propertyId}:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const slots = await calculateSlots();
await redis.setex(cacheKey, 300, JSON.stringify(slots)); // 5 min cache

Real-time Updates
typescript// Supabase real-time subscription for viewing updates
supabase
  .channel('viewings')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'viewing_bookings',
    filter: `property_id=eq.${propertyId}`
  }, handleViewingUpdate)
  .subscribe();



Feature 2: Chat/Messaging System
Overview
A real-time messaging system allowing buyers to ask questions about properties and sellers to respond, with conversation history and notifications.
Database Schema
sql-- Conversations between users about properties
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  
  -- Conversation state
  status VARCHAR(20) DEFAULT 'active', -- active, archived, blocked
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  -- Unread counts
  buyer_unread_count INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,
  
  -- Metadata
  buyer_archived BOOLEAN DEFAULT false,
  seller_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique conversation per property-buyer pair
  UNIQUE(property_id, buyer_id)
);

-- Individual messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  
  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, offer, system, viewing_request
  metadata JSONB, -- For special message types (offers, etc.)
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_conversations_buyer ON conversations(buyer_id, status);
CREATE INDEX idx_conversations_seller ON conversations(seller_id, status);
CREATE INDEX idx_conversations_property ON conversations(property_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

-- Message templates for quick responses
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(100),
  content TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Backend Architecture
Real-time WebSocket Server
typescript// websocket-server.ts
import { Server } from 'socket.io';
import { verifyJWT } from '../auth/jwt';

export class ChatWebSocketServer {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: { origin: process.env.FRONTEND_URL }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await verifyJWT(token);
        socket.data.userId = user.id;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      
      // Track user's sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user's room for direct messaging
      socket.join(`user:${userId}`);

      // Handle joining conversation rooms
      socket.on('join_conversation', async (conversationId) => {
        // Verify user is part of this conversation
        const hasAccess = await this.verifyConversationAccess(userId, conversationId);
        if (hasAccess) {
          socket.join(`conversation:${conversationId}`);
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        const { conversationId, content, messageType = 'text' } = data;
        
        // Create message in database
        const message = await this.createMessage({
          conversationId,
          senderId: userId,
          content,
          messageType
        });

        // Emit to conversation room
        this.io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Update conversation last message
        await this.updateConversationLastMessage(conversationId, message);

        // Send push notification to offline recipient
        await this.sendPushNotification(conversationId, userId, message);
      });

      // Handle marking messages as read
      socket.on('mark_read', async (conversationId) => {
        await this.markMessagesAsRead(conversationId, userId);
        
        // Notify sender that messages were read
        const otherUserId = await this.getOtherUserId(conversationId, userId);
        this.io.to(`user:${otherUserId}`).emit('messages_read', {
          conversationId,
          readBy: userId
        });
      });

      // Handle typing indicators
      socket.on('typing_start', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          userId
        });
      });

      socket.on('typing_stop', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          conversationId,
          userId
        });
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  // Helper methods
  private async verifyConversationAccess(userId: string, conversationId: string): Promise<boolean> {
    const { data } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();
    
    return data && (data.buyer_id === userId || data.seller_id === userId);
  }

  private async createMessage(messageData: any) {
    const { data } = await supabase
      .from('messages')
      .insert([messageData])
      .select('*, sender:users(id, name, avatar_url)')
      .single();
    
    return data;
  }

  private async updateConversationLastMessage(conversationId: string, message: any) {
    // Update conversation with last message info and increment unread count
    const conversation = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    const updateData: any = {
      last_message_at: message.created_at,
      last_message_preview: message.content.substring(0, 100)
    };

    // Increment unread count for recipient
    if (message.sender_id === conversation.data.buyer_id) {
      updateData.seller_unread_count = supabase.sql`seller_unread_count + 1`;
    } else {
      updateData.buyer_unread_count = supabase.sql`buyer_unread_count + 1`;
    }

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);
  }
}
REST API Endpoints
typescript// chat.routes.ts
router.post('/conversations', async (req, res) => {
  /**
   * Start a new conversation about a property
   * Body: {
   *   propertyId: string,
   *   initialMessage: string
   * }
   */
  const { propertyId, initialMessage } = req.body;
  const buyerId = req.user.id;

  // Get property and seller info
  const { data: property } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Check if conversation already exists
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('property_id', propertyId)
    .eq('buyer_id', buyerId)
    .single();

  // Create new conversation if doesn't exist
  if (!conversation) {
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert([{
        property_id: propertyId,
        buyer_id: buyerId,
        seller_id: property.seller_id
      }])
      .select()
      .single();
    
    conversation = newConversation;
  }

  // Add initial message
  const { data: message } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversation.id,
      sender_id: buyerId,
      content: initialMessage
    }])
    .select()
    .single();

  res.json({ conversation, message });
});

router.get('/conversations', async (req, res) => {
  /**
   * Get user's conversations
   * Query params:
   *   - role: 'buyer' | 'seller'
   *   - status: 'active' | 'archived'
   *   - propertyId: filter by property
   */
  const userId = req.user.id;
  const { role = 'buyer', status = 'active', propertyId } = req.query;

  let query = supabase
    .from('conversations')
    .select(`
      *,
      property:listings(id, title, images, price, address),
      buyer:users!buyer_id(id, name, avatar_url),
      seller:users!seller_id(id, name, avatar_url),
      last_message:messages(content, created_at, sender_id)
    `)
    .eq('status', status)
    .order('last_message_at', { ascending: false });

  if (role === 'buyer') {
    query = query.eq('buyer_id', userId);
    if (status === 'archived') {
      query = query.eq('buyer_archived', true);
    }
  } else {
    query = query.eq('seller_id', userId);
    if (status === 'archived') {
      query = query.eq('seller_archived', true);
    }
  }

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;
  res.json(data);
});

router.get('/conversations/:conversationId/messages', async (req, res) => {
  /**
   * Get paginated messages for a conversation
   * Query params:
   *   - page: number
   *   - limit: number (default 50)
   */
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users(id, name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Reverse to show oldest first
  messages.reverse();

  res.json(messages);
});
Frontend Implementation
Chat Interface Component
tsx// ChatWindow.tsx
export function ChatWindow({ conversationId, currentUser }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Initialize WebSocket connection
  const socket = useSocket();

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Join conversation room
    socket.emit('join_conversation', conversationId);

    // Listen for new messages
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [conversationId]);

  const loadMessages = async () => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await response.json();
    setMessages(data);
    scrollToBottom();
    
    // Mark messages as read
    socket.emit('mark_read', conversationId);
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
    
    // Mark as read if window is focused
    if (document.hasFocus() && message.sender_id !== currentUser.id) {
      socket.emit('mark_read', conversationId);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender_id: currentUser.id,
      sender: currentUser,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    // Send via WebSocket
    socket.emit('send_message', {
      conversationId,
      content: newMessage
    });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', conversationId);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUser.id}
          />
        ))}
        
        {otherUserTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <TypingIndicator />
            <span className="text-sm">Typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// MessageBubble.tsx
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs lg:max-w-md px-4 py-2 rounded-lg
        ${isOwn 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-100 text-gray-900'
        }
      `}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
          {format(new Date(message.created_at), 'HH:mm')}
          {message.is_read && isOwn && ' ✓✓'}
        </p>
      </div>
    </div>
  );
}
Conversations List Component
tsx// ConversationsList.tsx
export function ConversationsList({ role, onSelectConversation }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const socket = useSocket();

  useEffect(() => {
    loadConversations();

    // Listen for real-time updates
    socket.on('new_message', handleMessageUpdate);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message');
      socket.off('messages_read');
    };
  }, [role]);

  const loadConversations = async () => {
    const response = await fetch(`/api/conversations?role=${role}`);
    const data = await response.json();
    setConversations(data);
  };

  const handleMessageUpdate = async ({ conversationId }) => {
    // Reload conversations to update last message and unread count
    loadConversations();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'unread' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations
          .filter(conv => filter === 'all' || conv[`${role}_unread_count`] > 0)
          .map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              role={role}
              onClick={() => onSelectConversation(conversation)}
            />
          ))}
      </div>
    </div>
  );
}

// ConversationItem.tsx
function ConversationItem({ conversation, role, onClick }) {
  const otherUser = role === 'buyer' ? conversation.seller : conversation.buyer;
  const unreadCount = conversation[`${role}_unread_count`];

  return (
    <button
      onClick={onClick}
      className="w-full p-4 hover:bg-gray-50 border-b transition"
    >
      <div className="flex items-start space-x-3">
        <img
          src={otherUser.avatar_url || '/default-avatar.png'}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 text-left">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm">{otherUser.name}</h3>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {conversation.property.title}
          </p>
          <p className="text-sm text-gray-500 truncate mt-1">
            {conversation.last_message_preview}
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
Quick Message Templates
tsx// QuickMessageTemplates.tsx
export function QuickMessageTemplates({ onSelectTemplate }) {
  const templates = [
    "Is this property still available?",
    "Can I schedule a viewing?",
    "What's included in the service charge?",
    "Is the price negotiable?",
    "How long has the property been on the market?",
    "Are there any ongoing issues with the property?",
    "What's the parking situation?",
    "Can you tell me more about the local area?"
  ];

  return (
    <div className="p-4 border-t">
      <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelectTemplate(template)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}
Scalability Considerations for Chat

Message Pagination
typescript// Implement cursor-based pagination for messages
const getMessages = async (conversationId: string, cursor?: string) => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  
  return query;
};

Redis for WebSocket State
typescript// Store active socket connections in Redis for horizontal scaling
class RedisSocketAdapter {
  async addUserSocket(userId: string, socketId: string) {
    await redis.sadd(`user:${userId}:sockets`, socketId);
    await redis.expire(`user:${userId}:sockets`, 86400); // 24h TTL
  }
  
  async getUserSockets(userId: string): Promise<string[]> {
    return redis.smembers(`user:${userId}:sockets`);
  }
}

Message Queue for Notifications
typescript// Use message queue for reliable notification delivery
await messageQueue.add('send-notification', {
  type: 'new_message',
  recipientId: conversation.seller_id,
  data: {
    senderName: sender.name,
    propertyTitle: property.title,
    messagePreview: message.content.substring(0, 50)
  }
});



Feature 3: Offer Management System
Overview
A structured offer system where buyers can submit formal offers with restrictions (one active offer at a time) and sellers can accept, reject, or counter offers.
Database Schema
sql-- Property offers
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  
  -- Offer details
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn, expired, countered
  
  -- Buyer details
  buyer_position VARCHAR(50), -- first_time_buyer, chain, cash, mortgage_approved
  mortgage_approved BOOLEAN DEFAULT false,
  cash_buyer BOOLEAN DEFAULT false,
  chain_details TEXT,
  proposed_completion_date DATE,
  
  -- Offer message
  message TEXT,
  
  -- Counter offer tracking
  is_counter_offer BOOLEAN DEFAULT false,
  previous_offer_id UUID REFERENCES offers(id),
  counter_amount DECIMAL(12, 2),
  counter_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  
  -- Response details
  response_message TEXT
);

-- Ensure one active offer per buyer
CREATE UNIQUE INDEX idx_one_active_offer_per_buyer 
ON offers(buyer_id) 
WHERE status IN ('pending', 'countered');

-- Offer activity log for audit trail
CREATE TABLE offer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id),
  event_type VARCHAR(50), -- created, viewed, accepted, rejected, countered, withdrawn
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offers_property ON offers(property_id, status);
CREATE INDEX idx_offers_buyer ON offers(buyer_id, status);
CREATE INDEX idx_offers_seller ON offers(seller_id, status);
Backend Implementation
Offer Validation Service
typescript// offer-validation.service.ts
export class OfferValidationService {
  async validateNewOffer(buyerId: string, propertyId: string, amount: number) {
    // Check for existing active offers
    const { data: activeOffers } = await supabase
      .from('offers')
      .select('id, property_id, amount, status')
      .eq('buyer_id', buyerId)
      .in('status', ['pending', 'countered']);

    if (activeOffers && activeOffers.length > 0) {
      const activeOffer = activeOffers[0];
      throw new ValidationError(
        'ACTIVE_OFFER_EXISTS',
        `You already have an active offer on another property. Please withdraw or wait for a response on your existing offer before making a new one.`,
        {
          existingOfferId: activeOffer.id,
          existingPropertyId: activeOffer.property_id,
          existingAmount: activeOffer.amount
        }
      );
    }

    // Validate offer amount
    const { data: property } = await supabase
      .from('listings')
      .select('price, minimum_offer_percentage')
      .eq('id', propertyId)
      .single();

    const minimumOffer = property.price * (property.minimum_offer_percentage || 0.9);
    if (amount < minimumOffer) {
      throw new ValidationError(
        'OFFER_TOO_LOW',
        `Your offer must be at least ${((property.minimum_offer_percentage || 0.9) * 100).toFixed(0)}% of the asking price (£${minimumOffer.toLocaleString()}).`
      );
    }

    return true;
  }
}
Offer API Endpoints
typescript// offers.routes.ts
router.post('/offers', async (req, res) => {
  try {
    const buyerId = req.user.id;
    const {
      propertyId,
      amount,
      buyerPosition,
      mortgageApproved,
      cashBuyer,
      chainDetails,
      proposedCompletionDate,
      message
    } = req.body;

    // Validate offer
    await offerValidationService.validateNewOffer(buyerId, propertyId, amount);

    // Get property and seller details
    const { data: property } = await supabase
      .from('listings')
      .select('seller_id, title, address')
      .eq('id', propertyId)
      .single();

    // Create or get conversation
    const conversation = await ensureConversation(propertyId, buyerId, property.seller_id);

    // Create offer
    const { data: offer } = await supabase
      .from('offers')
      .insert([{
        property_id: propertyId,
        buyer_id: buyerId,
        seller_id: property.seller_id,
        conversation_id: conversation.id,
        amount,
        buyer_position: buyerPosition,
        mortgage_approved: mortgageApproved,
        cash_buyer: cashBuyer,
        chain_details: chainDetails,
        proposed_completion_date: proposedCompletionDate,
        message
      }])
      .select()
      .single();

    // Create offer message in conversation
    await supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        sender_id: buyerId,
        content: `I've made an offer of £${amount.toLocaleString()}`,
        message_type: 'offer',
        metadata: { offerId: offer.id }
      }]);

    // Log event
    await logOfferEvent(offer.id, 'created', buyerId, { amount });

    // Send notifications
    await notificationService.notifyNewOffer(offer);

    res.status(201).json(offer);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.put('/offers/:offerId/respond', async (req, res) => {
  const { offerId } = req.params;
  const sellerId = req.user.id;
  const { action, message, counterAmount } = req.body;

  // Verify seller owns the property
  const { data: offer } = await supabase
    .from('offers')
    .select('*, property:listings(seller_id)')
    .eq('id', offerId)
    .single();

  if (offer.property.seller_id !== sellerId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  let updateData: any = {
    responded_at: new Date().toISOString(),
    response_message: message
  };

  switch (action) {
    case 'accept':
      updateData.status = 'accepted';
      // Mark property as under offer
      await supabase
        .from('listings')
        .update({ status: 'under_offer' })
        .eq('id', offer.property_id);
      break;

    case 'reject':
      updateData.status = 'rejected';
      break;

    case 'counter':
      // Create counter offer
      const { data: counterOffer } = await supabase
        .from('offers')
        .insert([{
          ...offer,
          id: undefined,
          amount: counterAmount,
          status: 'pending',
          is_counter_offer: true,
          previous_offer_id: offer.id,
          counter_message: message,
          created_at: undefined,
          expires_at: undefined
        }])
        .select()
        .single();

      updateData.status = 'countered';
      updateData.counter_amount = counterAmount;
      break;
  }

  // Update original offer
  await supabase
    .from('offers')
    .update(updateData)
    .eq('id', offerId);

  // Send notification
  await notificationService.notifyOfferResponse(offer, action);

  res.json({ success: true });
});
Frontend Implementation
Offer Submission Flow
tsx// MakeOfferModal.tsx
export function MakeOfferModal({ property, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [offerData, setOfferData] = useState({
    amount: Math.floor(property.price * 0.95), // Default to 95% of asking
    buyerPosition: '',
    mortgageApproved: false,
    cashBuyer: false,
    chainDetails: '',
    proposedCompletionDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          ...offerData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'ACTIVE_OFFER_EXISTS') {
          setError(errorData.error);
          // Show option to view existing offer
        } else {
          throw new Error(errorData.error);
        }
        return;
      }

      const offer = await response.json();
      onSuccess(offer);
    } catch (error) {
      setError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="p-6">
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 mx-1 rounded ${
                i <= step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <OfferAmountStep
            property={property}
            offerData={offerData}
            onUpdate={(data) => setOfferData({ ...offerData, ...data })}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <BuyerDetailsStep
            offerData={offerData}
            onUpdate={(data) => setOfferData({ ...offerData, ...data })}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <OfferSummaryStep
            property={property}
            offerData={offerData}
            error={error}
            isSubmitting={isSubmitting}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </Modal>
  );
}

// Step 1: Offer Amount
function OfferAmountStep({ property, offerData, onUpdate, onNext }) {
  const [showWarning, setShowWarning] = useState(false);
  
  const percentageOfAsking = (offerData.amount / property.price) * 100;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Make an Offer</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Asking Price
        </label>
        <p className="text-2xl font-bold text-gray-900">
          £{property.price.toLocaleString()}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Your Offer
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            £
          </span>
          <input
            type="number"
            value={offerData.amount}
            onChange={(e) => {
              const amount = parseInt(e.target.value) || 0;
              onUpdate({ amount });
              setShowWarning(amount < property.price * 0.9);
            }}
            className="w-full pl-8 pr-3 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="mt-2 flex justify-between text-sm">
          <span className={percentageOfAsking < 90 ? 'text-red-600' : 'text-gray-600'}>
            {percentageOfAsking.toFixed(1)}% of asking price
          </span>
          <span className="text-gray-600">
            £{(property.price - offerData.amount).toLocaleString()} below asking
          </span>
        </div>
      </div>

      {showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Offers below 90% of asking price are less likely to be accepted
          </p>
        </div>
      )}

      {/* Quick offer buttons */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Quick options:</p>
        <div className="flex gap-2">
          {[100, 97.5, 95, 92.5, 90].map((percent) => (
            <button
              key={percent}
              onClick={() => onUpdate({ amount: Math.floor(property.price * (percent / 100)) })}
              className="px-3 py-1 text-sm border rounded-full hover:bg-gray-50"
            >
              {percent}%
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
      >
        Continue
      </button>
    </div>
  );
}

// Step 3: Final Summary with Warning Modal
function OfferSummaryStep({ property, offerData, error, isSubmitting, onBack, onSubmit }) {
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmitClick = () => {
    setShowWarning(true);
  };

  const handleConfirmSubmit = () => {
    setShowWarning(false);
    onSubmit();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Offer</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Offer Summary</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-gray-600">Property:</dt>
            <dd className="font-medium">{property.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Your Offer:</dt>
            <dd className="font-bold text-lg">£{offerData.amount.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Position:</dt>
            <dd>{offerData.buyerPosition.replace('_', ' ')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Completion:</dt>
            <dd>{format(new Date(offerData.proposedCompletionDate), 'MMMM yyyy')}</dd>
          </div>
        </dl>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Important:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You can only have one active offer at a time</li>
          <li>• The seller has 48 hours to respond</li>
          <li>• You can withdraw your offer at any time</li>
          <li>• This offer is not legally binding until contracts are exchanged</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Offer'}
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <OfferWarningModal
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowWarning(false)}
        />
      )}
    </div>
  );
}

// Warning Modal Component
function OfferWarningModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold">Important: One Offer at a Time</h3>
        </div>
        
        <div className="mb-6 space-y-3">
          <p className="text-gray-700">
            You can only have <strong>one active offer</strong> at a time on Mossy.
          </p>
          <p className="text-gray-700">
            Once you submit this offer:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>You cannot make offers on other properties until this is resolved</li>
            <li>The seller has 48 hours to respond</li>
            <li>You can withdraw the offer if needed</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">
            This prevents offer spam and shows sellers you're serious about their property.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            I Understand, Submit Offer
          </button>
        </div>
      </div>
    </div>
  );
}
Seller Offer Management Dashboard
tsx// SellerOffersDashboard.tsx
export function SellerOffersDashboard({ propertyId }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  useEffect(() => {
    loadOffers();
    
    // Subscribe to real-time offer updates
    const subscription = supabase
      .channel('offers')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `property_id=eq.${propertyId}`
      }, handleOfferUpdate)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [propertyId]);

  const loadOffers = async () => {
    const { data } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!buyer_id(id, name, avatar_url),
        events:offer_events(event_type, created_at)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    setOffers(data || []);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Property Offers</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'btn-primary' : 'btn-secondary'}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
            >
              All Offers
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {offers
          .filter(offer => 
            filter === 'active' 
              ? ['pending', 'countered'].includes(offer.status)
              : true
          )
          .map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onSelect={() => setSelectedOffer(offer)}
            />
          ))}
      </div>

      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onRespond={(action, data) => handleOfferResponse(selectedOffer.id, action, data)}
        />
      )}
    </div>
  );
}

// OfferCard.tsx
function OfferCard({ offer, onSelect }) {
  const timeRemaining = offer.status === 'pending' 
    ? formatDistanceToNow(new Date(offer.expires_at))
    : null;

  return (
    <div 
      onClick={onSelect}
      className="p-6 hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={offer.buyer.avatar_url || '/default-avatar.png'}
              alt={offer.buyer.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{offer.buyer.name}</h3>
              <p className="text-sm text-gray-600">
                {offer.cash_buyer ? 'Cash Buyer' : 'Mortgage Buyer'}
                {offer.chain_details && ' • In a chain'}
              </p>
            </div>
          </div>
          
          <div className="ml-13">
            <p className="text-2xl font-bold text-green-600">
              £{offer.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {((offer.amount / offer.property.price) * 100).toFixed(1)}% of asking price
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`
            inline-block px-3 py-1 rounded-full text-sm font-medium
            ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
            ${offer.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
            ${offer.status === 'countered' ? 'bg-blue-100 text-blue-800' : ''}
          `}>
            {offer.status}
          </span>
          
          {timeRemaining && (
            <p className="text-xs text-gray-500 mt-2">
              Expires in {timeRemaining}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// OfferDetailModal.tsx
function OfferDetailModal({ offer, onClose, onRespond }) {
  const [response, setResponse] = useState<'accept' | 'reject' | 'counter' | null>(null);
  const [counterAmount, setCounterAmount] = useState(offer.amount);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    await onRespond(response, {
      message,
      counterAmount: response === 'counter' ? counterAmount : undefined
    });
    onClose();
  };

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Offer Details</h2>

        {/* Buyer Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Buyer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{offer.buyer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium">
                {offer.buyer_position.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Financing</p>
              <p className="font-medium">
                {offer.cash_buyer ? 'Cash' : 'Mortgage'}
                {offer.mortgage_approved && ' (Pre-approved)'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Proposed Completion</p>
              <p className="font-medium">
                {format(new Date(offer.proposed_completion_date), 'MMMM yyyy')}
              </p>
            </div>
          </div>
          
          {offer.message && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Message from buyer:</p>
              <p className="mt-1 italic">"{offer.message}"</p>
            </div>
          )}
        </div>

        {/* Offer Amount */}
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2">Offer Amount</h3>
          <p className="text-3xl font-bold text-green-700">
            £{offer.amount.toLocaleString()}
          </p>
          <p className="text-sm text-green-600">
            {((offer.amount / offer.property.price) * 100).toFixed(1)}% of asking price
          </p>
        </div>

        {/* Response Options */}
        {offer.status === 'pending' && (
          <div>
            <h3 className="font-semibold mb-4">Your Response</h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="response"
                  value="accept"
                  onChange={() => setResponse('accept')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Accept Offer</p>
                  <p className="text-sm text-gray-600">
                    Accept the offer as presented
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="response"
                  value="counter"
                  onChange={() => setResponse('counter')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Counter Offer</p>
                  <p className="text-sm text-gray-600">
                    Propose a different amount
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="response"
                  value="reject"
                  onChange={() => setResponse('reject')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Reject Offer</p>
                  <p className="text-sm text-gray-600">
                    Decline this offer
                  </p>
                </div>
              </label>
            </div>

            {response === 'counter' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Counter Offer Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    £
                  </span>
                  <input
                    type="number"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(parseInt(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {response && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Message to Buyer (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg p-3"
                  placeholder={
                    response === 'accept' 
                      ? "Congratulations! Looking forward to proceeding..."
                      : response === 'counter'
                      ? "Thank you for your offer. I would consider..."
                      : "Thank you for your interest, however..."
                  }
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!response}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Send Response
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
Scalability Considerations for Offers

Offer Expiration Service
typescript// Scheduled job to expire old offers
async function expireOldOffers() {
  const { data: expiredOffers } = await supabase
    .from('offers')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select();
  
  // Notify buyers of expired offers
  for (const offer of expiredOffers) {
    await notificationService.notifyOfferExpired(offer);
  }
}

Analytics and Reporting
typescript// Track offer patterns for insights
interface OfferAnalytics {
  averageOfferPercentage: number;
  acceptanceRate: number;
  averageResponseTime: number;
  offersByDayOfWeek: Record<string, number>;
}

async function generateOfferAnalytics(propertyId: string): Promise<OfferAnalytics> {
  // Aggregate offer data for property insights
}

Fraud Detection
typescript// Monitor for suspicious offer patterns
async function detectSuspiciousOfferActivity(buyerId: string) {
  const recentOffers = await getRecentOffers(buyerId, 7); // Last 7 days
  
  if (recentOffers.length > 10) {
    await flagUserForReview(buyerId, 'HIGH_OFFER_VOLUME');
  }
  
  const withdrawnCount = recentOffers.filter(o => o.status === 'withdrawn').length;
  if (withdrawnCount > 5) {
    await flagUserForReview(buyerId, 'EXCESSIVE_WITHDRAWALS');
  }
}



System Integration and Refactoring
Now that all three features are defined, let's review how they work together:
Unified Communication Hub
All three features integrate through the conversation system:
typescript// Unified conversation view showing all interactions
interface ConversationActivity {
  id: string;
  type: 'message' | 'viewing' | 'offer';
  timestamp: Date;
  data: Message | ViewingBooking | Offer;
}

export function PropertyConversation({ propertyId, userId, role }) {
  const [activities, setActivities] = useState<ConversationActivity[]>([]);

  useEffect(() => {
    // Load all activities for this property conversation
    Promise.all([
      loadMessages(conversationId),
      loadViewings(propertyId, userId),
      loadOffers(propertyId, userId)
    ]).then(([messages, viewings, offers]) => {
      // Combine and sort by timestamp
      const combined = [
        ...messages.map(m => ({ type: 'message', timestamp: m.created_at, data: m })),
        ...viewings.map(v => ({ type: 'viewing', timestamp: v.created_at, data: v })),
        ...offers.map(o => ({ type: 'offer', timestamp: o.created_at, data: o }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setActivities(combined);
    });
  }, [propertyId, userId]);

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        switch (activity.type) {
          case 'message':
            return <MessageBubble key={activity.id} message={activity.data} />;
          case 'viewing':
            return <ViewingCard key={activity.id} viewing={activity.data} />;
          case 'offer':
            return <OfferCard key={activity.id} offer={activity.data} />;
        }
      })}
    </div>
  );
}
Buyer's Interacted Properties Dashboard
tsxexport function BuyerInteractedProperties() {
  const [properties, setProperties] = useState<InteractedProperty[]>([]);

  interface InteractedProperty {
    property: Property;
    lastInteraction: Date;
    interactions: {
      hasMessaged: boolean;
      hasViewing: boolean;
      hasOffer: boolean;
      unreadMessages: number;
      nextViewing?: Date;
      offerStatus?: string;
    };
  }

  return (
    <div className="grid gap-4">
      {properties.map((item) => (
        <div key={item.property.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{item.property.title}</h3>
              <p className="text-gray-600">{item.property.address.displayAddress}</p>
              
              <div className="flex gap-4 mt-3">
                {item.interactions.hasMessaged && (
                  <span className="text-sm text-blue-600">
                    💬 Messages {item.interactions.unreadMessages > 0 && `(${item.interactions.unreadMessages} new)`}
                  </span>
                )}
                {item.interactions.hasViewing && (
                  <span className="text-sm text-purple-600">
                    📅 Viewing {item.interactions.nextViewing && format(item.interactions.nextViewing, 'MMM d')}
                  </span>
                )}
                {item.interactions.hasOffer && (
                  <span className="text-sm text-green-600">
                    💰 Offer {item.interactions.offerStatus}
                  </span>
                )}
              </div>
            </div>
            
            <button className="text-blue-600 hover:underline">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
Performance Optimizations

Database Indexes for all foreign keys and common query patterns
Caching Strategy using Redis for frequently accessed data
Connection Pooling for database connections
Horizontal Scaling ready with Redis-backed WebSocket state
Event-Driven Architecture for real-time updates without polling

Security Considerations

Row Level Security in Supabase for all tables
Input Validation on all user inputs
Rate Limiting on API endpoints
CSRF Protection for state-changing operations
XSS Prevention through proper React rendering

This comprehensive system provides a professional, scalable solution for buyer-seller communication that can grow with Mossy from MVP to market leader.