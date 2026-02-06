import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments, type DocumentType } from "@/hooks/useDocuments";
import { useMembers } from "@/hooks/useMembers";
import { useHouses } from "@/hooks/useHouses";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, Plus, User, FileText, Home, Search, Download, Trash2, CheckCircle, Clock } from "lucide-react";
import { formatFileSize, cn } from "@/lib/utils";
import { format } from "date-fns";

interface Member {
  id: string;
  full_name: string;
  unit: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  society_id: string;
  society_name?: string;
  unit?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Document categories for house documents
const DOCUMENT_CATEGORIES = [
  'NOC',
  'Maintenance Receipts',
  'Property Tax',
  'Maintenance Agreement',
  'Other'
];

// Document types for resident documents
const RESIDENT_DOCUMENT_TYPES = [
  'Aadhar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Voter ID',
  'Rental Agreement',
  'NOC',
  'Other'
];

export default function Documents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DocumentType>('resident');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Document state
  const [residentId, setResidentId] = useState<string>('');
  const [docType, setDocType] = useState<string>(RESIDENT_DOCUMENT_TYPES[0]);
  const [houseId, setHouseId] = useState<string>('');
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [notes, setNotes] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  
  // Fetch data
  const { members, loading: loadingMembers } = useMembers();
  const { houses, loading: loadingHouses } = useHouses();
  const { 
    documents, 
    loading: loadingDocuments, 
    uploading, 
    uploadDocument, 
    updateDocumentStatus, 
    deleteDocument 
  } = useDocuments();
  
  // Filter documents based on active tab and search query
  const filteredDocuments = documents.filter(doc => {
    const matchesTab = doc.document_type === activeTab;
    const matchesSearch = 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.document_type === 'resident' 
        ? (doc as any).resident_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc as any).unit?.toLowerCase().includes(searchQuery.toLowerCase())
        : (doc as any).unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc as any).owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesTab && (searchQuery === '' || matchesSearch);
  });
  
  // Set default selected resident/house when data loads
  useEffect(() => {
    if (members.length > 0 && !residentId) {
      setResidentId(members[0]?.id || '');
    }
  }, [members, residentId]);
  
  useEffect(() => {
    if (houses.length > 0 && !houseId) {
      setHouseId(houses[0]?.id || '');
    }
  }, [houses, houseId]);
  
  const selectedResident = members.find(m => m.id === residentId);
  const selectedHouse = houses.find(h => h.id === houseId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;
    
    try {
      if (activeTab === 'resident') {
        if (!residentId) throw new Error('Please select a resident');
        
        await uploadDocument(
          file,
          'resident',
          {
            residentId,
            documentType: docType,
            notes: notes || undefined
          }
        );
      } else {
        if (!houseId) throw new Error('Please select a house');
        
        await uploadDocument(
          file,
          'house',
          {
            houseId,
            documentType: docType,
            category,
            notes: notes || undefined
          }
        );
      }
      
      // Reset form
      setFile(null);
      setNotes('');
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const canUpload = profile?.role === "committee_member" || profile?.role === "society_admin" || profile?.role === "super_admin";
  const isLoading = loadingMembers || loadingHouses || loadingDocuments;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Upload and manage society documents and resident files
          </p>
        </div>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      )}
      
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as DocumentType)} 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="resident" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Resident Documents
          </TabsTrigger>
          <TabsTrigger value="house" className="flex items-center gap-2">
            <Home className="h-4 w-4" /> House Documents
          </TabsTrigger>
        </TabsList>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Form Card */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileUp className="h-4 w-4" /> New {activeTab === 'resident' ? 'Resident' : 'House'} Upload
              </CardTitle>
              <CardDescription>
                {activeTab === 'resident' 
                  ? 'Upload documents for residents' 
                  : 'Upload house-related documents'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canUpload ? (
                <form className="space-y-4" onSubmit={handleUpload}>
                  {activeTab === 'resident' ? (
                    <>
                      <div>
                        <Label className="mb-1 block">Resident</Label>
                        <Select 
                          value={residentId} 
                          onValueChange={setResidentId}
                          disabled={members.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              members.length === 0 ? 'No residents found' : 'Select resident'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {members.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.full_name} • {member.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {members.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            No residents found. Please add residents first.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-1 block">Document type</Label>
                        <Select value={docType} onValueChange={setDocType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESIDENT_DOCUMENT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="mb-1 block">House Unit</Label>
                        <Select 
                          value={houseId} 
                          onValueChange={setHouseId}
                          disabled={houses.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              houses.length === 0 ? 'No houses found' : 'Select house unit'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {houses.map(house => (
                              <SelectItem key={house.id} value={house.id}>
                                {house.unit} • {house.owner_name || 'Owner not specified'}
                              </SelectItem>
                            ))}

const canUpload = profile?.role === "committee_member" || profile?.role === "society_admin" || profile?.role === "super_admin";
const isLoading = loadingMembers || loadingHouses || loadingDocuments;

return (
<div className="p-6 space-y-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
      <p className="text-muted-foreground">
        Upload and manage society documents and resident files
      </p>
    </div>
  </div>
  
  {isLoading && (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading documents...</span>
    </div>
  )}
  
  <Tabs 
    value={activeTab} 
    onValueChange={(v) => setActiveTab(v as DocumentType)} 
    className="space-y-6"
  >
    <TabsList className="grid w-full grid-cols-2 max-w-md">
      <TabsTrigger value="resident" className="flex items-center gap-2">
        <User className="h-4 w-4" /> Resident Documents
      </TabsTrigger>
      <TabsTrigger value="house" className="flex items-center gap-2">
        <Home className="h-4 w-4" /> House Documents
      </TabsTrigger>
    </TabsList>
    
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Upload Form Card */}
      <Card className="lg:col-span-1 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileUp className="h-4 w-4" /> New {activeTab === 'resident' ? 'Resident' : 'House'} Upload
          </CardTitle>
          <CardDescription>
            {activeTab === 'resident' 
              ? 'Upload documents for residents' 
              : 'Upload house-related documents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canUpload ? (
            <form className="space-y-4" onSubmit={handleUpload}>
              {activeTab === 'resident' ? (
                <>
                  <div>
                    <Label className="mb-1 block">Resident</Label>
                    <Select 
                      value={residentId} 
                      onValueChange={setResidentId}
                      disabled={members.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          members.length === 0 ? 'No residents found' : 'Select resident'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name} • {member.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {members.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        No residents found. Please add residents first.
                      </p>
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
                    />
                    <p className="text-xs text-muted-foreground mt-1">PDF or image up to 10MB</p>
                  </div>

                  <div>
                    <Label className="mb-1 block">Notes (optional)</Label>
                    <Textarea 
                      rows={3} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Any additional info" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!file || uploading || 
                      (activeTab === 'resident' && members.length === 0) ||
                      (activeTab === 'house' && houses.length === 0)
                    }
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" /> 
                        Upload {activeTab === 'resident' ? 'Resident' : 'House'} Document
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Only authorized members can upload documents. You can still view existing documents.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Documents List Card */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 
                  {activeTab === 'resident' ? 'Resident' : 'House'} Documents
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
                </p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">{activeTab === 'resident' ? 'Resident' : 'House'}</TableHead>
                      <TableHead className="w-[150px]">Type</TableHead>
                      <TableHead className="min-w-[200px]">File</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Uploaded By</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map(doc => (
                        <TableRow key={doc.id} className="hover:bg-muted/50">
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {doc.document_type === 'resident' ? (
                                <>
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{(doc as any).resident_name || 'Unknown'}</div>
                                    <div className="text-xs text-muted-foreground">{(doc as any).unit || 'N/A'}</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Home className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{(doc as any).unit || 'N/A'}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(doc as any).owner_name || 'Owner not specified'}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{doc.type}</span>
                              {doc.document_type === 'house' && (
                                <span className="text-xs text-muted-foreground">
                                  {(doc as any).category}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{doc.file_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(doc.file_size)} • {doc.file_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={doc.status === 'verified' ? 'default' : 'outline'}
                              className={cn(
                                'flex items-center gap-1',
                                doc.status === 'verified' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              )}
                            >
                              {doc.status === 'verified' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {doc.status === 'verified' ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {doc.uploaded_by === profile?.id ? 'You' : 'Admin'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {profile?.society_name || 'Society Member'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(doc.created_at), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              {(profile?.role === 'committee_member' || profile?.role === 'society_admin' || profile?.role === 'super_admin') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                                      await deleteDocument(doc.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p>No documents found</p>
                            <p className="text-sm">
                              {searchQuery 
                                ? 'Try a different search term' 
                                : activeTab === 'resident'
                                  ? 'Upload a resident document to get started'
                                  : 'Upload a house document to get started'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                            <div className="flex items-center gap-1">
                              {doc.status === "verified" ? (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5 text-success mr-1" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3.5 w-3.5 text-warning-foreground mr-1" />
                                  <span>Pending</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.uploaded_by || 'System'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm">
                              {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(doc.created_at), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell className="w-10">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              {canUpload && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this document?')) {
                                      await deleteDocument(doc.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2 opacity-40" />
                            <p>No documents found</p>
                            <p className="text-sm">
                              {searchQuery ? (
                                'No documents match your search. Try a different term.'
                              ) : activeTab === 'resident' ? (
                                members.length === 0 
                                  ? 'No residents found. Add residents first.'
                                  : 'No resident documents found. Upload a document to get started.'
                              ) : (
                                houses.length === 0
                                  ? 'No houses found. Add houses first.'
                                  : 'No house documents found. Upload a document to get started.'
                              )}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
