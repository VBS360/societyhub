import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, MapPin, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Database } from '@/types/database.types';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string().min(1, 'Please select a time'),
  location: z.string().min(3, 'Location is required'),
  maxAttendees: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  isPaid: z.boolean().default(false),
  price: z.string().optional(),
  image: z.any().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Using the Database type from our generated types
type EventInsert = Database['public']['Tables']['events']['Insert'];

export function NewEventForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { profile } = useAuth();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: '19:00',
      location: '',
      maxAttendees: '',
      category: '',
      isPaid: false,
      price: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EventFormValues) => {
    if (!profile?.society_id) {
      toast({
        title: 'Error',
        description: 'No society associated with your account',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Handle file upload if there's a file
      let imageUrl = '';
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Combine date and time
      const [hours, minutes] = data.time.split(':').map(Number);
      const eventDate = new Date(data.date);
      eventDate.setHours(hours, minutes);

      const eventData = {
        title: data.title,
        description: data.description,
        event_date: eventDate.toISOString(),
        location: data.location,
        max_attendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        category: data.category,
        is_paid: data.isPaid,
        price: data.price ? parseFloat(data.price) : null,
        image_url: imageUrl,
        society_id: profile.society_id,
        created_by: profile.id,
      };

      const { error } = await supabase
        .from('events')
        .insert<EventInsert>(eventData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="space-y-1">
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
            Event Details
          </button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
            Ticket Types
          </button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
            Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
            <Button variant="outline" className="border-gray-300">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Event Image */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-gray-900">Event Image</h2>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Event preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg
                          className="h-full w-full"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload an image</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Event Title and Description */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="Add a short, clear name"
                  {...form.register('title')}
                  className={form.formState.errors.title ? 'border-red-500' : ''}
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  placeholder="Tell people what your event is about"
                  rows={4}
                  {...form.register('description')}
                  className={form.formState.errors.description ? 'border-red-500' : ''}
                />
                {form.formState.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Date, Time, and Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.watch('date') && 'text-muted-foreground',
                        form.formState.errors.date ? 'border-red-500' : ''
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('date') ? (
                        format(form.watch('date'), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('date')}
                      onSelect={(date) => form.setValue('date', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="time"
                    type="time"
                    className={`pl-10 ${form.formState.errors.time ? 'border-red-500' : ''}`}
                    {...form.register('time')}
                  />
                </div>
                {form.formState.errors.time && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.time.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="location"
                    placeholder="Add location"
                    className={`pl-10 ${form.formState.errors.location ? 'border-red-500' : ''}`}
                    {...form.register('location')}
                  />
                </div>
                {form.formState.errors.location && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Category and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className={`w-full rounded-md border ${
                    form.formState.errors.category ? 'border-red-500' : 'border-gray-300'
                  } py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                  {...form.register('category')}
                >
                  <option value="">Select a category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="concert">Concert</option>
                  <option value="exhibition">Exhibition</option>
                </select>
                {form.formState.errors.category && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="pl-10"
                    {...form.register('maxAttendees')}
                  />
                </div>
              </div>
            </div>

            {/* Paid Event Toggle */}
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="isPaid"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  {...form.register('isPaid')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isPaid" className="font-medium text-gray-700">
                  This is a paid event
                </label>
              </div>
            </div>

            {form.watch('isPaid') && (
              <div className="w-1/3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    {...form.register('price', { required: 'Price is required for paid events' })}
                  />
                </div>
                {form.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.price.message}</p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                disabled={isLoading}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
