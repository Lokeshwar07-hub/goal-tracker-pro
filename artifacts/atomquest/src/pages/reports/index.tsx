import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();
  const [format, setFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("atomquest_token");
      const url = new URL("/api/reports/export", window.location.origin);
      url.searchParams.append("format", format);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `goals_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast({ title: "Export downloaded successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Export failed", description: "Could not generate report." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Download your data for external analysis.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Export</CardTitle>
          <CardDescription>Export all goal data including status, progress, and alignment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Additional filters can be added here */}
          </div>
          
          <Button onClick={handleExport} disabled={isExporting} className="w-full md:w-auto">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Generating..." : "Download Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
