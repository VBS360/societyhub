import { Car, Calendar, Clock, MapPin, Plus, Filter, Users, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAmenities } from '@/hooks/useAmenities';

const mockAmenities = [
  {
    id: '1',
    name: 'Community Hall',
    description: 'Large hall suitable for events, meetings, and celebrations',
    bookingFee: 5000,
    maxHours: 8,
    advanceBookingDays: 30,
    isActive: true,
    currentBookings: 12,
    nextAvailable: '2024-01-18T10:00:00Z'
  },
  {
    id: '2',
    name: 'Swimming Pool',
    description: 'Olympic-size swimming pool with changing rooms and lifeguard',
    bookingFee: 0,
    maxHours: 2,
    advanceBookingDays: 7,
    isActive: true,
    currentBookings: 45,
    nextAvailable: '2024-01-16T06:00:00Z'
  },
  {
    id: '3',
    name: 'Gym & Fitness Center',
    description: 'Fully equipped gym with modern fitness equipment',
    bookingFee: 0,
    maxHours: 2,
    advanceBookingDays: 3,
    isActive: true,
    currentBookings: 78,
    nextAvailable: '2024-01-16T07:00:00Z'
  },
  {
    id: '4',
    name: 'Tennis Court',
    description: 'Professional tennis court with equipment available',
    bookingFee: 500,
    maxHours: 2,
    advanceBookingDays: 7,
    isActive: true,
    currentBookings: 23,
    nextAvailable: '2024-01-17T16:00:00Z'
  },
  {
    id: '5',
    name: 'Children\'s Play Area',
    description: 'Safe play area for children with various play equipment',
    bookingFee: 0,
    maxHours: 4,
    advanceBookingDays: 1,
    isActive: true,
    currentBookings: 34,
    nextAvailable: '2024-01-16T09:00:00Z'
  },
  {
    id: '6',
    name: 'Multipurpose Room',
    description: 'Medium-sized room for meetings, parties, and small events',
    bookingFee: 2000,
    maxHours: 6,
    advanceBookingDays: 15,
    isActive: false,
    currentBookings: 8,
    nextAvailable: '2024-01-25T10:00:00Z'
  }
];

const mockBookings = [
  {
    id: '1',
    amenityName: 'Community Hall',
    bookedBy: 'Sarah Johnson',
    unit: 'B-205',
    bookingDate: '2024-01-20',
    startTime: '18:00',
    endTime: '22:00',
    purpose: 'Birthday Party',
    status: 'confirmed',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    amenityName: 'Tennis Court',
    bookedBy: 'Mike Wilson',
    unit: 'C-302',
    bookingDate: '2024-01-16',
    startTime: '17:00',
    endTime: '19:00',
    purpose: 'Tennis Practice',
    status: 'confirmed',
    paymentStatus: 'paid'
  },
  {
    id: '3',
    amenityName: 'Swimming Pool',
    bookedBy: 'Emily Davis',
    unit: 'A-505',
    bookingDate: '2024-01-17',
    startTime: '08:00',
    endTime: '10:00',
    purpose: 'Swimming Training',
    status: 'pending',
    paymentStatus: 'pending'
  },
  {
    id: '4',
    amenityName: 'Gym & Fitness Center',
    bookedBy: 'Robert Brown',
    unit: 'B-108',
    bookingDate: '2024-01-16',
    startTime: '06:00',
    endTime: '08:00',
    purpose: 'Personal Training',
    status: 'confirmed',
    paymentStatus: 'paid'
  }
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Amenities = () => {
  const { amenities, bookings, stats, loading, error } = useAmenities();

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center text-red-600">Error loading amenities: {error}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
            <p className="text-muted-foreground">
              Manage society amenities and bookings
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            Book Amenity
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.totalAmenities}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Amenities</p>
                </div>
                <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.activeAmenities}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.totalBookings}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Bookings</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {stats.pendingBookings}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Pending</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amenities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Available Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{amenity.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{amenity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            <span>₹{Number(amenity.booking_fee).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Max {amenity.max_hours}h</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={amenity.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}>
                        {amenity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Booking advance: {amenity.advance_booking_days} days
                      </span>
                      <Button size="sm" variant="outline" disabled={!amenity.is_active}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{booking.amenities?.name}</h4>
                        <p className="text-sm text-muted-foreground">{booking.purpose}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={`text-xs ${booking.status === 'confirmed' ? statusColors.confirmed : 
                          booking.status === 'pending' ? statusColors.pending : statusColors.cancelled}`}>
                          {booking.status}
                        </Badge>
                        <Badge className={`text-xs ${booking.payment_status === 'paid' ? paymentStatusColors.paid : 
                          booking.payment_status === 'pending' ? paymentStatusColors.pending : paymentStatusColors.failed}`}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {booking.profiles?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{booking.profiles?.full_name}</span>
                      </div>
                      <span>{booking.profiles?.unit_number}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(booking.booking_date).toLocaleDateString('en-IN')}</span>
                      <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Amenities;