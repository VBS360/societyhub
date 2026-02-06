import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { Database } from '@/types/database.types';

export type DocumentType = 'resident' | 'house';

// Define the base document type from the database
export type SocietyDocument = Omit<Database['public']['Tables']['documents']['Row'], 'document_type'> & {
  document_type: DocumentType;
  // Add a computed unit field that will be derived from house or resident data
  unit?: string | null;
};

export function useDocuments() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<SocietyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);


  // Fetch all documents
  const fetchDocuments = useCallback(async () => {
    if (!profile?.society_id) {
      setError('No society ID found. Please sign in again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Fetch documents from the documents table
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('society_id', profile.society_id);

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        throw new Error('Failed to load documents');
      }

      // Log the raw data from the database
      console.log('Raw documents from DB:', docs);

      // Format documents with proper typing
      const formattedDocs: SocietyDocument[] = (docs || []).map(doc => {
        // Create base document with required fields
        const formattedDoc: SocietyDocument = {
          ...doc,
          document_type: (doc.document_type as DocumentType) || 'house',
          // Ensure all required fields have proper values
          file_name: doc.file_name || '',
          file_url: doc.file_url || '',
          file_type: doc.file_type || '',
          file_size: doc.file_size || 0,
          uploaded_by: doc.uploaded_by || 'System',
          // Add computed unit field
          unit: doc.house_id || doc.resident_id || null
        };
        
        console.log('Formatted document:', formattedDoc);
        return formattedDoc;
      });

      // Set the documents
      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.society_id, supabase, toast]);

  // Upload a new document
  const uploadDocument = async (
    file: File, 
    type: DocumentType,
    documentData: {
      residentId?: string;
      houseId?: string;
      documentType: string;
      category?: string;
      notes?: string;
    }
  ) => {
    if (!profile?.society_id) {
      throw new Error('No society ID found');
    }

    setUploading(true);
    
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${profile.society_id}/${type}_documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Save document metadata to database
      const document = {
        society_id: profile.society_id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        document_type: documentData.documentType,
        notes: documentData.notes,
        status: 'pending',
        uploaded_by: profile.id,
      };

      // Insert into the documents table
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          ...document,
          resident_id: type === 'resident' ? documentData.residentId : null,
          house_id: type === 'house' ? documentData.houseId : null,
          category: documentData.category || null,
          document_type: type,
        }]);

      if (insertError) throw insertError;

      // 4. Refresh documents
      await fetchDocuments();
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Error uploading document:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Update document status
  const updateDocumentStatus = async (id: string, status: 'verified' | 'pending') => {
    try {
      // Update document status in the documents table
      const { error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setDocuments(documents.map(doc => 
        doc.id === id ? { ...doc, status } : doc
      ));

      toast({
        title: 'Success',
        description: 'Document status updated',
      });
      
      return true;
    } catch (err) {
      console.error('Error updating document status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update document status',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a document
  const deleteDocument = async (id: string) => {
    try {
      setLoading(true);
      
      // 1. First, get the document to get the file URL
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!doc) throw new Error('Document not found');

      // 2. Delete the file from storage if it exists
      if (doc.file_url) {
        try {
          // Extract the file path from the URL
          const filePath = doc.file_url.split('/').pop();
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('documents') // Make sure this matches your bucket name
              .remove([filePath]);

            if (storageError) {
              console.warn('Error deleting file from storage:', storageError);
              // Continue with database deletion even if storage deletion fails
            }
          }
        } catch (storageError) {
          console.error('Error in storage deletion:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // 3. Delete the document record from the database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // 3. Update local state
      setDocuments(documents.filter(doc => doc.id !== id));

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    uploading,
    uploadDocument,
    updateDocumentStatus,
    deleteDocument,
    refetch: fetchDocuments,
  } as const;
}
