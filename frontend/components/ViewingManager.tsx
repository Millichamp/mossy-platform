"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Viewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  viewerName: string;
  viewerEmail: string;
  viewerPhone?: string;
  requestedDate: string;
  requestedTime: string;
  attendeeCount: string;
  viewingType: 'in-person' | 'virtual';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  confirmedDate?: string;
  confirmedTime?: string;
}

interface ViewingManagerProps {
  propertyId?: string; // If provided, shows viewings for specific property
  userRole: 'buyer' | 'seller';
}

export default function ViewingManager({ propertyId, userRole }: ViewingManagerProps) {
  const { user } = useAuth();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadViewings();
    }
  }, [user, propertyId, filter]);

  const loadViewings = async () => {
    try {
      setLoading(true);
      // This would connect to your backend API
      // For now, using mock data
      const mockViewings: Viewing[] = [
        {
          id: '1',
          propertyId: propertyId || 'prop1',
          propertyTitle: '4 Bed Victorian House',
          propertyAddress: '123 Garden Street, London SW1A 1AA',
          viewerName: 'John Smith',
          viewerEmail: 'john.smith@email.com',
          viewerPhone: '+44 7123 456789',
          requestedDate: '2024-07-25',
          requestedTime: '14:00',
          attendeeCount: '2',
          viewingType: 'in-person',
          status: 'pending',
          notes: 'Looking to move in quickly, very interested in the property.',
          createdAt: '2024-07-18T10:00:00Z'
        },
        {
          id: '2',
          propertyId: propertyId || 'prop1',
          propertyTitle: '4 Bed Victorian House',
          propertyAddress: '123 Garden Street, London SW1A 1AA',
          viewerName: 'Sarah Johnson',
          viewerEmail: 'sarah.j@email.com',
          requestedDate: '2024-07-26',
          requestedTime: '11:00',
          attendeeCount: '1',
          viewingType: 'virtual',
          status: 'confirmed',
          confirmedDate: '2024-07-26',
          confirmedTime: '11:00',
          createdAt: '2024-07-17T15:30:00Z'
        }
      ];

      const filtered = filter === 'all' ? mockViewings : mockViewings.filter(v => v.status === filter);
      setViewings(filtered);
    } catch (error) {
      console.error('Error loading viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateViewingStatus = async (viewingId: string, status: 'confirmed' | 'cancelled', confirmedDate?: string, confirmedTime?: string) => {
    try {
      // API call would go here
      setViewings(prev => prev.map(viewing => 
        viewing.id === viewingId 
          ? { ...viewing, status, confirmedDate, confirmedTime }
          : viewing
      ));
    } catch (error) {
      console.error('Error updating viewing:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: Viewing['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const icons = {
      pending: <AlertCircle className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'seller' ? 'Viewing Requests' : 'My Viewings'}
        </h2>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No viewing requests yet.'
              : `No ${filter} viewings found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {viewings.map(viewing => (
            <div key={viewing.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewing.propertyTitle}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {viewing.propertyAddress}
                  </div>
                </div>
                {getStatusBadge(viewing.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">Requested Date</div>
                    <div className="text-sm">{formatDate(viewing.requestedDate)}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div className="text-sm">{viewing.requestedTime}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">{viewing.viewingType === 'in-person' ? 'In-Person' : 'Virtual'}</div>
                    <div className="text-sm">{viewing.attendeeCount} attendee(s)</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {viewing.viewerName}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {viewing.viewerEmail}
                    </div>
                    {viewing.viewerPhone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {viewing.viewerPhone}
                      </div>
                    )}
                  </div>

                  {userRole === 'seller' && viewing.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateViewingStatus(viewing.id, 'confirmed', viewing.requestedDate, viewing.requestedTime)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateViewingStatus(viewing.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {viewing.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{viewing.notes}</p>
                  </div>
                )}

                {viewing.status === 'confirmed' && viewing.confirmedDate && viewing.confirmedTime && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Confirmed:</strong> {formatDate(viewing.confirmedDate)} at {viewing.confirmedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
