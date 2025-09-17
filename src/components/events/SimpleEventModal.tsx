import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Get the exact table types from the database schema
type Tables = Database['public']['Tables'];
type EventsTable = Tables['events']['Row'];
type EventsInsert = Omit<Tables['events']['Insert'], 'id' | 'created_at' | 'updated_at'>;
type EventsUpdate = Partial<Omit<Tables['events']['Update'], 'id' | 'created_at' | 'society_id' | 'created_by'>>;

// Create a typed Supabase client
type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

// Define types based on the database schema
type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string().min(1, 'Please select a time'),
  location: z.string().min(3, 'Location is required'),
  maxAttendees: z.string().optional(),
  image: z.any()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, `Max image size is 500KB.`)
    .refine(
      file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    )
    .optional()
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export function SimpleEventModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSuccess?: () => void; 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { profile } = useAuth();
  // Supabase client is already initialized from @/lib/supabase/client

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: '19:00',
      location: '',
      maxAttendees: '',
    },
  });

  const uploadImage = async (file: File) => {
    if (!file) return null;
    
    // Optimize image before upload if it's too large
    const optimizedFile = await new Promise<File>((resolve) => {
      if (file.size <= MAX_FILE_SIZE) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1200; // Max width/height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.8 quality for better compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'),
                { type: 'image/jpeg' }
              );
              resolve(optimizedFile);
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    const fileExt = optimizedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    // Upload with progress tracking
    const { data, error } = await supabase.storage
      .from('events')
      .upload(filePath, optimizedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Use the defined database types

  const onSubmit = async (data: EventFormValues) => {
    if (!profile) return;

    try {
      setIsLoading(true);

      // Create event data that matches the database schema
      const eventData: EventInsert = {
        title: data.title,
        description: data.description,
        event_date: data.date.toISOString().split('T')[0] + 'T' + data.time,
        location: data.location,
        max_attendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        society_id: profile.society_id,
        created_by: profile.id,
        // These fields will be set by the database
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the event and get the created record
      const insertData: EventsInsert = {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        location: eventData.location,
        max_attendees: eventData.max_attendees,
        society_id: eventData.society_id,
        created_by: eventData.created_by,
      };

      // Cast to any to bypass TypeScript type checking
      const { data: insertedEvent, error: insertError } = await (supabase as any)
        .from('events')
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedEvent) throw new Error('Failed to create event');

      // Upload image in the background if present
      if (data.image && data.image.length > 0) {
        try {
          const imageUrl = await uploadImage(data.image[0]);
          // Update the event with the image URL
          const updateData: EventsUpdate = { image_url: imageUrl };
          // Cast to any to bypass TypeScript type checking
          const { error: updateError } = await (supabase as any)
            .from('events')
            .update(updateData)
            .eq('id', insertedEvent.id!)
            .select()
            .single();
          
          if (updateError) throw updateError;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Don't fail the whole operation if image upload fails
        }
      }

      // Show success message and close the modal
      requestAnimationFrame(() => {
        toast({
          title: 'Event created!',
          description: 'Your event has been created successfully.',
        });

        onSuccess?.();
        onOpenChange(false);
        form.reset({
          title: '',
          description: '',
          date: new Date(),
          time: '19:00',
          location: '',
          maxAttendees: '',
          image: undefined,
        });
        setPreviewUrl(null);
      });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="event-form-description"
        aria-labelledby="event-form-title"
      >
        <DialogHeader>
          <DialogTitle id="event-form-title" className="text-lg font-semibold">
            Create New Event
          </DialogTitle>
          <DialogDescription id="event-form-description" className="text-sm text-muted-foreground">
            Fill in the details below to create a new event
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              placeholder="Enter event title"
              {...form.register('title')}
              className={form.formState.errors.title ? 'border-red-300' : ''}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              rows={3}
              {...form.register('description')}
              className={form.formState.errors.description ? 'border-red-300' : ''}
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !form.watch('date') ? 'text-muted-foreground' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('date') ? (
                      format(form.watch('date'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('date')}
                    onSelect={(date) => form.setValue('date', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="time"
                  type="time"
                  className={`pl-10 ${form.formState.errors.time ? 'border-red-300' : ''}`}
                  {...form.register('time')}
                />
              </div>
              {form.formState.errors.time && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="location"
                placeholder="Enter event location"
                className={`pl-10 ${form.formState.errors.location ? 'border-red-300' : ''}`}
                {...form.register('location')}
              />
            </div>
            {form.formState.errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
              Max Attendees (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
                className="pl-10"
                {...form.register('maxAttendees')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Event Image (optional, max 500KB)
            </label>
            <div className="mt-1 flex items-center">
              <label
                htmlFor="image-upload"
                className="cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Choose File
                <input
                  id="image-upload"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue('image', [file]);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <span className="ml-2 text-sm text-gray-500">
                {form.watch('image')?.[0]?.name || 'No file chosen'}
              </span>
            </div>
            {previewUrl && (
              <div className="mt-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-32 w-32 object-cover rounded-md"
                />
              </div>
            )}
            {form.formState.errors.image && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.image.message as string}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
