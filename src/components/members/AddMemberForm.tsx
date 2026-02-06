import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse, isValid } from 'date-fns';
import { DateOfBirthInput } from '@/components/ui/DateOfBirthInput';
import { Loader2, Shield, User, Users } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type FormData = {
  // Section 1: Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  salutation: string;
  residentialAddress: string;
  officeAddress?: string;
  mobile: string;
  email: string;
  dateOfBirth: Date;
  aadhaarNumber: string;
  isMinor: boolean;
  guardianName?: string;
  guardianRelation?: string;

  // Section 2: Family Members
  familyMembers: Array<{
    name: string;
    relation: string;
    dateOfBirth: Date;
  }>;

  // Section 3: Flat & Ownership
  flatNumber: string;
  membershipType: 'owner' | 'associate' | 'tenant';
  dateOfPossession: Date;
  dateOfShareTransfer?: Date;
  parkingSlots: Array<{
    type: 'car' | 'bike' | 'other';
    slotNumber: string;
  }>;

  // Section 4: Membership & Financial
  dateOfAdmission: Date;
  entranceFee: number;
  shareCertificateNumber: string;
  nominees: Array<{
    name: string;
    address: string;
    percentage: number;
  }>;

  // Section 5: Additional Details
  emergencyContactName: string;
  emergencyContactNumber: string;
  vehicleNumbers: string[];
  documentProofs: FileList | null;

  // Terms & Conditions
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
};

// Form validation schema using Zod
const formSchema = z.object({
  // Personal Information
  salutation: z.string().min(1, 'Salutation is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  residentialAddress: z.string().min(10, 'Residential address is required'),
  officeAddress: z.string().optional(),
  mobile: z.string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only numbers'),
  email: z.string().email('Invalid email address'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: 'Invalid date',
  }),
  aadhaarNumber: z.string()
    .length(12, 'Aadhaar number must be 12 digits')
    .regex(/^[0-9]+$/, 'Aadhaar must contain only numbers'),
  isMinor: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string()
    .optional()
    .refine((value) => !value || (/^[0-9]{10}$/.test(value)), {
      message: 'Emergency contact number must be 10 digits',
    }),

  // Family Members
  familyMembers: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    relation: z.string().min(1, 'Relation is required'),
    dateOfBirth: z.date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Invalid date',
    }),
  })),

  // Flat & Ownership
  flatNumber: z.string().min(1, 'Flat number is required'),
  membershipType: z.enum(['owner', 'associate', 'tenant']),
  dateOfPossession: z.date({
    required_error: 'Date of possession is required',
  }),
  dateOfShareTransfer: z.date().optional(),
  parkingSlots: z.array(z.object({
    type: z.enum(['car', 'bike', 'other']),
    slotNumber: z.string().min(1, 'Slot number is required').optional(),
  })).optional(),

  // Membership & Financial
  dateOfAdmission: z.date().optional(),
  entranceFee: z
    .number({ invalid_type_error: 'Entrance fee must be a number' })
    .min(0, 'Entrance fee cannot be negative')
    .optional(),
  shareCertificateNumber: z.string().optional(),
  nominees: z.array(z.object({
    name: z.string().min(1, 'Nominee name is required'),
    address: z.string().min(1, 'Nominee address is required'),
    percentage: z.number().min(1, 'Percentage must be at least 1').max(100, 'Percentage cannot exceed 100'),
  })).optional()
    .default([])
    .refine(
      (nominees) => {
        if (!nominees || nominees.length === 0) return true;
        const total = nominees.reduce((sum, n) => sum + (n.percentage || 0), 0);
        return total === 100;
      },
      {
        message: 'Total percentage must be 100%',
        path: ['nominees'],
      }
    ),

  // Additional Details
  vehicleNumbers: z.array(z.string()).optional(),
  documentProofs: z.any().optional(),

  // Terms & Conditions
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const salutationOptions = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'prof', label: 'Prof.' },
];

const relationOptions = [
  'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'
];

interface AddMemberFormProps {
  onSuccess: () => void;
  societyId: string;
}

const AddMemberForm = ({ onSuccess, societyId }: AddMemberFormProps): JSX.Element => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add loading state check
  if (!profile) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const form = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      familyMembers: [{
        name: '',
        relation: '',
        dateOfBirth: new Date(),
      }],
      parkingSlots: [{
        type: 'car',
        slotNumber: '',
      }],
      nominees: [],
      vehicleNumbers: [''],
      membershipType: 'owner',
      isMinor: false,
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid: isFormValid },
    setValue,
    getValues,
    trigger,
    formState
  } = form;

  const { fields: familyMemberFields, append: appendFamilyMember, remove: removeFamilyMember } =
    useFieldArray({
      control,
      name: 'familyMembers',
    });

  const { fields: parkingSlotFields, append: appendParkingSlot, remove: removeParkingSlot } =
    useFieldArray({
      control,
      name: 'parkingSlots',
    });

  const { fields: nomineeFields, append: appendNominee, remove: removeNominee } =
    useFieldArray({
      control,
      name: 'nominees',
    });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } =
    useFieldArray({
      control,
      name: 'vehicleNumbers',
    });

  const isMinor = watch('isMinor');
  const dateOfBirth = watch('dateOfBirth');
  const nominees = watch('nominees');

  // Calculate age based on date of birth
  useEffect(() => {
    if (dateOfBirth) {
      let birthDate: Date;

      try {
        // Handle string input (from manual entry)
        if (typeof dateOfBirth === 'string') {
          // Try to parse the date from dd/mm/yyyy format
          const parsedDate = parse(dateOfBirth, 'dd/MM/yyyy', new Date());
          birthDate = isValid(parsedDate) ? parsedDate : new Date(dateOfBirth);
        } else {
          birthDate = new Date(dateOfBirth);
        }

        // Only proceed if we have a valid date
        if (isValid(birthDate)) {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          setValue('isMinor', age < 18);
        }
      } catch (error) {
        console.error('Error processing date of birth:', error);
      }
    }
  }, [dateOfBirth, setValue]);

  // Calculate total percentage for nominees
  const totalPercentage = nominees?.reduce((sum, nominee) => sum + (nominee.percentage || 0), 0) || 0;

  // Memoize steps to prevent recreation on each render
  const steps = React.useMemo(() => [
    { id: 'personal', name: 'Personal Info', fields: ['salutation', 'firstName', 'lastName', 'email', 'mobile', 'dateOfBirth', 'aadhaarNumber', 'isMinor'] as const },
    { id: 'family', name: 'Family', fields: ['familyMembers'] as const },
    { id: 'property', name: 'Property', fields: ['flatNumber', 'membershipType', 'dateOfPossession'] as const },
    { id: 'documents', name: 'Documents', fields: ['documentProofs'] as const },
    { id: 'review', name: 'Review', fields: [] as const },
  ], []); // Empty dependency array means this only runs once

  // Define the form data type with all required fields
  type MemberFormData = {
    firstName: string;
    middleName?: string;
    lastName: string;
    salutation: string;
    residentialAddress: string;
    officeAddress?: string;
    mobile: string;
    email: string;
    dateOfBirth: Date;
    aadhaarNumber: string;
    isMinor: boolean;
    guardianName?: string;
    guardianRelation?: string;
    familyMembers: Array<{ name: string; relation: string; dateOfBirth: Date }>;
    flatNumber: string;
    membershipType: 'owner' | 'associate' | 'tenant';
    dateOfPossession: Date;
    dateOfShareTransfer?: Date;
    emergencyContactName: string;
    emergencyContactNumber: string;
    vehicleNumbers: string[];
    documentProofs: FileList | null;
    shareCertificateNumber?: string;
    entranceFee?: number;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
  };

  type MemberRole = 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest';

  type MemberPayload = {
    email: string;
    phone: string | null;
    fullName: string;
    societyId: string;
    memberData: {
      family_members?: string[] | null;
      role?: MemberRole;
      is_owner?: boolean;
      unit_number?: string | null;
      emergency_contact?: string | null;
      vehicle_details?: string | null;
      is_active?: boolean;
    };
  };

  type CreateMemberResponse = {
    status: 'success';
    operation: 'created' | 'updated';
    userId: string;
    temporaryPassword: string | null;
  };

  const onSubmit = async (formData: FormValues): Promise<'created' | 'updated'> => {
    console.log('onSubmit handler called with form data');
    console.log('Starting form data processing...');
    try {
      const activeSocietyId = societyId || profile?.society_id || null;

      console.log('Active Society ID:', activeSocietyId);
      console.log('Profile Society ID:', profile?.society_id);
      console.log('Prop Society ID:', societyId);

      if (!activeSocietyId) {
        console.error('Missing society ID context during member creation');
        throw new Error('Unable to determine the society. Please refresh and try again.');
      }

      const normalizedEmail = formData.email.toLowerCase().trim();
      const normalizedPhone = formData.mobile.trim();
      const normalizedUnit = formData.flatNumber.trim();
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.replace(/\s+/g, ' ');

      const familyMembersArray = formData.familyMembers && formData.familyMembers.length > 0
        ? formData.familyMembers
          .filter(member => member && member.name.trim() !== '')
          .map(member => `${member.name.trim()} (${member.relation})`)
        : [];

      const vehicleNumbersArray = formData.vehicleNumbers && formData.vehicleNumbers.length > 0
        ? formData.vehicleNumbers
          .filter((vehicle): vehicle is string => typeof vehicle === 'string' && vehicle.trim() !== '')
          .map(vehicle => vehicle.trim())
        : [];

      const vehicleDetails = vehicleNumbersArray.length > 0 ? vehicleNumbersArray.join(', ') : null;
      const emergencyContactParts = [formData.emergencyContactName?.trim(), formData.emergencyContactNumber?.trim()]
        .filter((value): value is string => !!value && value.length > 0);
      const emergencyContact = emergencyContactParts.length > 0 ? emergencyContactParts.join(' | ') : null;

      const memberProfileData = {
        family_members: familyMembersArray.length > 0 ? familyMembersArray : null,
        role: 'resident' as const,
        is_owner: formData.membershipType === 'owner',
        unit_number: normalizedUnit || null,
        emergency_contact: emergencyContact,
        vehicle_details: vehicleDetails,
        is_active: true,
      } satisfies MemberPayload['memberData'];

      const functionPayload: MemberPayload = {
        email: normalizedEmail,
        phone: normalizedPhone || null,
        fullName,
        societyId: activeSocietyId,
        memberData: memberProfileData,
      };

      console.log('Invoking create-member function with payload:', {
        ...functionPayload,
        phone: functionPayload.phone ? '***' : null,
      });

      const { data: functionData, error: functionError } = await supabase.functions.invoke<CreateMemberResponse>(
        'create-member',
        {
          body: functionPayload,
        }
      );

      if (functionError) {
        console.error('create-member function returned error:', functionError);
        throw new Error(functionError.message || 'Failed to save member. Please try again.');
      }

      if (!functionData || functionData.status !== 'success') {
        console.error('Unexpected response from create-member function:', functionData);
        throw new Error('Failed to save member. Please try again.');
      }

      if (functionData.temporaryPassword) {
        console.log('Temporary password generated for new member:', functionData.temporaryPassword);
      }

      console.log('Member data persisted successfully with operation:', functionData.operation);

      // Verify we are still logged in as the admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current auth user after operation:', currentUser?.email);
      if (currentUser?.email === normalizedEmail) {
        console.error('CRITICAL: Session switched to new user! This should not happen.');
      }

      return functionData.operation ?? 'created';
    } catch (error) {
      console.error('onSubmit error:', error);
      throw error;
    }
  };

  const nextStep = async () => {
    const currentFields = steps[currentStep]?.fields || [];
    const isValid = await trigger(currentFields as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderFamilyDetailsStep();
      case 2:
        return renderPropertyInfoStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-8 relative">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="salutation" className="text-sm font-medium text-gray-700">
              Salutation <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('salutation', value)}
              defaultValue={watch('salutation')}
            >
              <SelectTrigger className={errors.salutation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select salutation" />
              </SelectTrigger>
              <SelectContent>
                {salutationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.salutation && (
              <p className="text-sm text-red-500 mt-1">{errors.salutation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Bhaveshbhai"
              className={`${errors.firstName ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">
              Middle Name
            </Label>
            <Input
              id="middleName"
              {...register('middleName')}
              placeholder="Arunbhai"
              className="focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Patel"
              className={`${errors.lastName ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">+91</span>
              <Input
                id="mobile"
                {...register('mobile')}
                placeholder="9876543210"
                maxLength={10}
                className={`pl-12 ${errors.mobile ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
              />
            </div>
            {errors.mobile && (
              <p className="text-sm text-red-500 mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="bhavesh.patel@gmail.com"
              className={`${errors.email ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2 relative z-10">
            <Label className="text-sm font-medium text-gray-700">
              Date of Birth
            </Label>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field, fieldState: { error } }) => (
                <div className="[&_.react-datepicker-popper]:z-20">
                  <DateOfBirthInput
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                  />
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaarNumber" className="text-sm font-medium text-gray-700">
              Aadhaar Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="aadhaarNumber"
              {...register('aadhaarNumber')}
              placeholder="1234 5678 9012"
              maxLength={12}
              className={`${errors.aadhaarNumber ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
            />
            {errors.aadhaarNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.aadhaarNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      {isMinor && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-5 w-5 text-amber-600" />
            <h4 className="text-md font-semibold text-gray-800">Guardian Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guardianName" className="text-sm font-medium text-gray-700">
                Guardian Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guardianName"
                {...register('guardianName')}
                placeholder="Guardian's full name"
                className={`${errors.guardianName ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
              />
              {errors.guardianName && (
                <p className="text-sm text-red-500 mt-1">{errors.guardianName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianRelation" className="text-sm font-medium text-gray-700">
                Relation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guardianRelation"
                {...register('guardianRelation')}
                placeholder="E.g., Father, Mother, etc."
                className={`${errors.guardianRelation ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
              />
              {errors.guardianRelation && (
                <p className="text-sm text-red-500 mt-1">{errors.guardianRelation.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="residentialAddress" className="text-sm font-medium text-gray-700">
              Residential Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="residentialAddress"
              {...register('residentialAddress')}
              placeholder="Full residential address with landmark"
              rows={3}
              className={`${errors.residentialAddress ? 'border-red-500' : ''} focus-visible:ring-blue-500`}
            />
            {errors.residentialAddress && (
              <p className="text-sm text-red-500 mt-1">{errors.residentialAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeAddress" className="text-sm font-medium text-gray-700">
              Office Address (Optional)
            </Label>
            <Textarea
              id="officeAddress"
              {...register('officeAddress')}
              placeholder="Office address (if applicable)"
              rows={2}
              className="focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFamilyDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Family Details</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendFamilyMember({
              name: '',
              relation: '',
              dateOfBirth: new Date(),
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Family Member
        </Button>
      </div>

      <div className="space-y-4">
        {familyMemberFields.map((field, index) => (
          <div key={field.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Family Member {index + 1}</h4>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFamilyMember(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  {...register(`familyMembers.${index}.name`)}
                  placeholder="Full name"
                />
                {errors.familyMembers?.[index]?.name && (
                  <p className="text-sm text-red-500">
                    {errors.familyMembers[index]?.name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Relation</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(`familyMembers.${index}.relation`, value)
                  }
                  defaultValue={field.relation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.familyMembers?.[index]?.relation && (
                  <p className="text-sm text-red-500">
                    {errors.familyMembers[index]?.relation?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative z-10">
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <Controller
                  name={`familyMembers.${index}.dateOfBirth`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <div className="[&_.react-datepicker-popper]:z-50">
                        <DateOfBirthInput
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date);
                          }}
                          onBlur={field.onBlur}
                          error={error?.message}
                          required={false}
                        />
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() =>
            appendFamilyMember({
              name: '',
              relation: '',
              dateOfBirth: new Date(),
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Family Member
        </Button>
      </div>
    </div>
  );

  const renderPropertyInfoStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Property Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flatNumber">Flat/Apartment Number <span className="text-red-500">*</span></Label>
          <Input
            id="flatNumber"
            {...register('flatNumber')}
            placeholder="e.g., A-101"
            className={errors.flatNumber ? 'border-red-500' : ''}
          />
          {errors.flatNumber && (
            <p className="text-sm text-red-500">{errors.flatNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Type of Membership <span className="text-red-500">*</span></Label>
          <Select
            onValueChange={(value: 'owner' | 'associate' | 'tenant') =>
              setValue('membershipType', value)
            }
            defaultValue={watch('membershipType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select membership type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="associate">Associate Member</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date of Possession <span className="text-red-500">*</span></Label>
          <Controller
            control={control}
            name="dateOfPossession"
            render={({ field, fieldState: { error } }) => (
              <DateOfBirthInput
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Date of Share Transfer (if applicable)</Label>
          <Controller
            control={control}
            name="dateOfShareTransfer"
            render={({ field, fieldState: { error } }) => (
              <DateOfBirthInput
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                required={false}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Parking Slots</h4>
        </div>

        {parkingSlotFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                onValueChange={(value: 'car' | 'bike' | 'other') =>
                  setValue(`parkingSlots.${index}.type`, value)
                }
                defaultValue={field.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slot Number</Label>
              <div className="flex space-x-2">
                <Input
                  {...register(`parkingSlots.${index}.slotNumber`)}
                  placeholder="e.g., P-101"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeParkingSlot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendParkingSlot({
              type: 'car',
              slotNumber: '',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Parking Slot
        </Button>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Documents & Additional Information</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Documents</Label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Upload ID Proof, Address Proof, etc. (PDF, JPG, PNG up to 10MB)
                </p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                {...register('documentProofs')}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Vehicle Registration Numbers</Label>
          {vehicleFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-center">
              <Input
                {...register(`vehicleNumbers.${index}`)}
                placeholder="e.g., MH01AB1234"
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeVehicle(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendVehicle('')}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                {...register('emergencyContactName')}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Input
                {...register('emergencyContactNumber')}
                placeholder="Phone Number"
                maxLength={10}
              />
              {errors.emergencyContactNumber && (
                <p className="text-sm text-red-500">
                  {errors.emergencyContactNumber.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={watch('agreeToTerms')}
              onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
            />
            <Label htmlFor="agreeToTerms" className="font-normal">
              I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeToPrivacy"
              checked={watch('agreeToPrivacy')}
              onCheckedChange={(checked) => setValue('agreeToPrivacy', checked as boolean)}
            />
            <Label htmlFor="agreeToPrivacy" className="font-normal">
              I agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </Label>
          </div>
          {errors.agreeToPrivacy && (
            <p className="text-sm text-red-500">{errors.agreeToPrivacy.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = React.useCallback(() => {
    const formData = watch();

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Review & Submit</h3>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p>{`${formData.salutation} ${formData.firstName}${formData.middleName ? ' ' + formData.middleName : ''} ${formData.lastName}`.replace(/\s+/g, ' ').trim()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p>{formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'PPP') : 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p>{formData.mobile}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{formData.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                <p>{formData.aadhaarNumber}</p>
              </div>
              {formData.isMinor && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Guardian Name</p>
                    <p>{formData.guardianName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Relation</p>
                    <p>{formData.guardianRelation}</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Residential Address</p>
              <p className="whitespace-pre-line">{formData.residentialAddress}</p>
            </div>

            {formData.officeAddress && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Office Address</p>
                <p className="whitespace-pre-line">{formData.officeAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {formData.familyMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.familyMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{member.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Relation</p>
                        <p>{member.relation}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p>{member.dateOfBirth ? format(new Date(member.dateOfBirth), 'PPP') : 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Flat Number</p>
                <p>{formData.flatNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Membership Type</p>
                <p className="capitalize">{formData.membershipType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date of Possession</p>
                <p>{format(formData.dateOfPossession, 'PPP')}</p>
              </div>
              {formData.dateOfShareTransfer && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Share Transfer</p>
                  <p>{format(formData.dateOfShareTransfer, 'PPP')}</p>
                </div>
              )}
            </div>

            {formData.parkingSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Parking Slots</p>
                <div className="space-y-2">
                  {formData.parkingSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {slot.type}
                      </Badge>
                      <span>{slot.slotNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p>{formData.emergencyContactName}</p>
                <p className="text-sm text-muted-foreground">{formData.emergencyContactNumber}</p>
              </div>
              {formData.vehicleNumbers.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vehicle Numbers</p>
                  <div className="space-y-1">
                    {formData.vehicleNumbers.map((number, index) => (
                      <p key={index}>{number}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 pt-4 border-t">
          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={watch('agreeToTerms')}
                onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
              />
              <Label htmlFor="agreeToTerms" className="font-normal">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-500 ml-6">{errors.agreeToTerms.message}</p>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToPrivacy"
                checked={watch('agreeToPrivacy')}
                onCheckedChange={(checked) => setValue('agreeToPrivacy', checked as boolean)}
              />
              <Label htmlFor="agreeToPrivacy" className="font-normal">
                I agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {errors.agreeToPrivacy && (
              <p className="text-sm text-red-500 ml-6">{errors.agreeToPrivacy.message}</p>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmDetails"
                checked={watch('agreeToTerms') && watch('agreeToPrivacy')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('agreeToTerms', true);
                    setValue('agreeToPrivacy', true);
                  }
                }}
              />
              <Label htmlFor="confirmDetails" className="font-normal">
                I confirm that all the information provided is accurate
              </Label>
            </div>
          </div>
        </div>
      </div>
    );
  }, [watch]);

  const termsAccepted = watch('agreeToTerms') && watch('agreeToPrivacy');
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleInvalidSubmit = (errors: FieldErrors<FormValues>) => {
    console.error('Form validation failed. Errors:', errors);
    const firstErrorKey = Object.keys(errors)[0];
    const firstErrorMessage = firstErrorKey ? errors[firstErrorKey]?.message : undefined;

    toast({
      title: 'Validation Error',
      description: firstErrorMessage || 'Please fix the highlighted fields before submitting.',
      variant: 'destructive',
    });

    // Focus the first invalid field
    if (firstErrorKey) {
      const invalidField = document.querySelector(`[name="${firstErrorKey}"]`);
      if (invalidField instanceof HTMLElement) {
        invalidField.focus();
        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleFormSubmit = async (data: FormValues) => {
    console.log('Form submission initiated - handleFormSubmit called');
    console.log('Current submission state - isSubmitting:', isSubmitting);

    if (isSubmitting) {
      console.log('Submission already in progress, preventing duplicate submission');
      return;
    }

    try {
      console.log('Starting form submission process...');
      setIsSubmitting(true);
      console.log('Form data being submitted:', JSON.stringify(data, null, 2));

      // Check if terms and privacy are accepted
      if (!data.agreeToTerms || !data.agreeToPrivacy) {
        console.warn('Terms not accepted - preventing submission');
        toast({
          title: 'Accept Terms Required',
          description: 'Please accept both the Terms of Service and Privacy Policy to continue.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      console.log('All validations passed, proceeding with submission...');

      // Call the actual submission handler
      console.log('Calling onSubmit handler...');
      const result = await onSubmit(data);
      console.log('onSubmit handler resolved successfully with result:', result);

      console.log('Form submitted successfully at:', new Date().toISOString());
      toast({
        title: result === 'created' ? 'Member Added Successfully' : 'Member Updated',
        description: result === 'created'
          ? `${data.firstName} ${data.lastName} has been added to the society.`
          : `${data.firstName} ${data.lastName}'s information has been refreshed.`,
      });

      if (onSuccess) {
        console.log('Invoking onSuccess callback');
        onSuccess();
      }

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Submit button clicked');

    try {
      // Mark all fields as touched to trigger validation
      const formValues = getValues();
      await trigger(undefined, { shouldFocus: true });

      // Manually check required fields
      const requiredFields: (keyof FormValues)[] = [
        'firstName', 'lastName', 'email', 'mobile', 'dateOfBirth', 'aadhaarNumber',
        'flatNumber', 'membershipType', 'dateOfPossession', 'emergencyContactName',
        'emergencyContactNumber', 'agreeToTerms', 'agreeToPrivacy'
      ];

      // Check if all required fields have values
      const missingFields = requiredFields.filter(field => {
        const value = formValues[field];

        // Special handling for date fields
        if (field === 'dateOfBirth' || field === 'dateOfPossession') {
          return !(value instanceof Date && !isNaN(value.getTime()));
        }

        // Handle other field types
        return value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
      });

      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        toast({
          title: 'Missing Information',
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: 'destructive',
        });

        // Focus on the first missing field
        const firstMissingField = document.querySelector(`[name="${missingFields[0]}"]`);
        if (firstMissingField) {
          (firstMissingField as HTMLElement).focus();
          (firstMissingField as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // If we get here, all required fields have values
      console.log('All required fields are filled, proceeding with submission...');

      // Proceed with form submission
      await handleFormSubmit(formValues);

      // If we get here, submission was successful
      console.log('Form submission completed successfully from button click');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Main form render
  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        console.log('Native form submit event received');
        event.preventDefault();
        handleSubmit(handleFormSubmit, handleInvalidSubmit)(event);
      }}
      className="space-y-6"
    >
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <button
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col items-center ${currentStep >= index ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= index
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-muted-foreground'
                  }`}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-sm font-medium">{step.name}</span>
            </button>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-muted">
                <div
                  className={`h-full ${currentStep > index ? 'bg-primary' : 'bg-muted'
                    }`}
                  style={{
                    width: currentStep > index ? '100%' : '0%',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!termsAccepted || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit & Create Member'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}

export default AddMemberForm;
