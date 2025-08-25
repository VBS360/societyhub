import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { FileUp, Plus, User, FileText } from "lucide-react";

interface Resident { id: string; name: string; unit: string }
interface DocItem { id: string; residentId: string; residentName: string; unit: string; type: string; fileName: string; notes?: string; uploadedAt: string; status: "verified" | "pending" }

const mockResidents: Resident[] = [
  { id: "1", name: "Rajesh Kumar", unit: "B-304" },
  { id: "2", name: "Priya Sharma", unit: "A-201" },
  { id: "3", name: "Amit Patel", unit: "C-105" },
  { id: "4", name: "Sarah Johnson", unit: "A-403" },
];

export default function Documents() {
  const { profile } = useAuth();
  const [residentId, setResidentId] = useState<string>(mockResidents[0].id);
  const [docType, setDocType] = useState<string>("Share Certificate");
  const [notes, setNotes] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<DocItem[]>([
    { id: "d1", residentId: "1", residentName: "Rajesh Kumar", unit: "B-304", type: "Share Certificate", fileName: "share-cert-rajesh.pdf", uploadedAt: new Date().toISOString(), status: "verified" },
    { id: "d2", residentId: "2", residentName: "Priya Sharma", unit: "A-201", type: "ID Proof", fileName: "aadhar-priya.jpg", uploadedAt: new Date(Date.now()-86400000).toISOString(), status: "pending" },
  ]);

  const selectedResident = mockResidents.find(r => r.id === residentId)!;

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const newItem: DocItem = {
      id: Math.random().toString(36).slice(2),
      residentId,
      residentName: selectedResident.name,
      unit: selectedResident.unit,
      type: docType,
      fileName: file.name,
      notes,
      uploadedAt: new Date().toISOString(),
      status: "pending",
    };
    setItems(prev => [newItem, ...prev]);
    // reset
    setFile(null);
    setNotes("");
  };

  const isSecretary = profile?.role === "committee_member" || profile?.role === "society_admin" || profile?.role === "super_admin";

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Resident Documents</h1>
          <p className="text-muted-foreground">Upload and manage resident certificates and documents.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><FileUp className="h-4 w-4" /> New Upload</CardTitle>
            </CardHeader>
            <CardContent>
              {isSecretary ? (
                <form className="space-y-4" onSubmit={handleUpload}>
                  <div>
                    <Label className="mb-1 block">Resident</Label>
                    <Select value={residentId} onValueChange={(v) => setResidentId(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resident" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockResidents.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name} • {r.unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1 block">Document type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Share Certificate">Share Certificate</SelectItem>
                        <SelectItem value="ID Proof">ID Proof</SelectItem>
                        <SelectItem value="Rental Agreement">Rental/Lease Agreement</SelectItem>
                        <SelectItem value="NOC">NOC</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1 block">File</Label>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <p className="text-xs text-muted-foreground mt-1">PDF or image up to 10MB</p>
                  </div>

                  <div>
                    <Label className="mb-1 block">Notes (optional)</Label>
                    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional info" />
                  </div>

                  <Button type="submit" className="w-full" disabled={!file}><Plus className="h-4 w-4 mr-2" /> Upload</Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">Only secretaries/admins can upload. You can still view existing documents.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap flex items-center gap-2"><User className="h-4 w-4" /> {item.residentName} • {item.unit}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="truncate max-w-[220px]">{item.fileName}</TableCell>
                      <TableCell>
                        {item.status === "verified" ? (
                          <Badge className="bg-success text-success-foreground">Verified</Badge>
                        ) : (
                          <Badge className="bg-warning text-warning-foreground">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(item.uploadedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
