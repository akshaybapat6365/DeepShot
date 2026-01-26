 import { useState, useEffect } from "react";
import { Globe, User, LogOut, Settings, Download, FileJson, FileSpreadsheet } from "lucide-react";
 import type { User as FirebaseUser } from "firebase/auth";
 import { toast } from "sonner";
 
 import { Button } from "@/components/ui/button";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Separator } from "@/components/ui/separator";
 import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
 import type { UserSettings } from "@/hooks/useUserSettings";
 import { updateUserSettings } from "@/lib/firestore";
import { exportToJSON, exportToCSV, downloadFile } from "@/lib/export";
 
 type SettingsDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   user: FirebaseUser | null;
   settings: UserSettings | null;
   onLogout: () => void;
  protocols?: Protocol[];
  injections?: Injection[];
  protocolLookup?: Map<string, Protocol>;
 };
 
 const COMMON_TIMEZONES = [
   "America/New_York",
   "America/Chicago",
   "America/Denver",
   "America/Los_Angeles",
   "America/Phoenix",
   "America/Anchorage",
   "Pacific/Honolulu",
   "Europe/London",
   "Europe/Paris",
   "Europe/Berlin",
   "Asia/Tokyo",
   "Asia/Shanghai",
   "Asia/Kolkata",
   "Asia/Dubai",
   "Australia/Sydney",
   "Australia/Perth",
   "Pacific/Auckland",
   "UTC",
 ];
 
 export function SettingsDialog({
   open,
   onOpenChange,
   user,
   settings,
   onLogout,
  protocols = [],
  injections = [],
  protocolLookup = new Map(),
 }: SettingsDialogProps) {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const [timezone, setTimezone] = useState(settings?.timezone ?? "");
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (settings?.timezone) {
       setTimezone(settings.timezone);
     }
   }, [settings?.timezone]);
 
   const handleTimezoneChange = async (value: string) => {
     if (!user) return;
     setTimezone(value);
     setSaving(true);
 
     try {
       await updateUserSettings({
         uid: user.uid,
         settings: { timezone: value },
       });
       toast.success("Timezone updated");
     } catch {
       toast.error("Failed to update timezone");
     } finally {
       setSaving(false);
     }
   };
 
  const handleExportJSON = () => {
    try {
      const json = exportToJSON(protocols, injections);
      const filename = `deepshot-export-${new Date().toISOString().split("T")[0]}.json`;
      downloadFile(json, filename, "application/json");
      toast.success("Data exported as JSON");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV(injections, protocolLookup);
      const filename = `deepshot-injections-${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(csv, filename, "text/csv");
      toast.success("Injections exported as CSV");
    } catch {
      toast.error("Failed to export data");
    }
  };

   const content = (
     <div className="space-y-6">
       {/* Profile Section */}
       <div className="flex items-center gap-4">
         {user?.photoURL ? (
           <img
             src={user.photoURL}
             alt=""
             className="size-14 rounded-full border-2 border-white/10"
           />
         ) : (
           <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center">
             <User className="size-6 text-primary" />
           </div>
         )}
         <div className="flex-1 min-w-0">
           <p className="text-base font-semibold font-display truncate">
             {user?.displayName ?? "User"}
           </p>
           <p className="text-sm text-muted-foreground truncate">
             {user?.email}
           </p>
         </div>
       </div>
 
       <Separator />
 
       {/* Timezone Setting */}
       <div className="space-y-3">
         <div className="flex items-center gap-2">
           <Globe className="size-4 text-muted-foreground" />
           <Label className="text-sm font-medium">Timezone</Label>
         </div>
         <Select value={timezone} onValueChange={handleTimezoneChange} disabled={saving}>
           <SelectTrigger className="w-full">
             <SelectValue placeholder="Select timezone" />
           </SelectTrigger>
           <SelectContent>
             {COMMON_TIMEZONES.map((tz) => (
               <SelectItem key={tz} value={tz}>
                 {tz.replace(/_/g, " ")}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
        <p className="text-xs md:text-sm text-muted-foreground">
           All dates and times will be displayed in this timezone.
         </p>
       </div>
 
       <Separator />
 
      {/* Data Export */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Export Data</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportJSON}
            disabled={protocols.length === 0 && injections.length === 0}
          >
            <FileJson className="size-4" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportCSV}
            disabled={injections.length === 0}
          >
            <FileSpreadsheet className="size-4" />
            CSV
          </Button>
        </div>
      <p className="text-xs md:text-sm text-muted-foreground">
          Export your protocols and injection history.
        </p>
      </div>

      <Separator />

       {/* Sign Out */}
       <Button
         variant="outline"
         className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
         onClick={() => {
           onOpenChange(false);
           onLogout();
         }}
       >
         <LogOut className="size-4" />
         Sign Out
       </Button>
 
       {/* App Version */}
       <p className="text-center text-xs text-muted-foreground">
         DeepShot v1.0.0
       </p>
     </div>
   );
 
   if (isMobile) {
     return (
       <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="px-4 pb-8">
           <DrawerHeader className="text-left px-0">
             <DrawerTitle className="flex items-center gap-2">
               <Settings className="size-5" />
               Settings
             </DrawerTitle>
           </DrawerHeader>
           {content}
         </DrawerContent>
       </Drawer>
     );
   }
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Settings className="size-5" />
             Settings
           </DialogTitle>
         </DialogHeader>
         {content}
       </DialogContent>
     </Dialog>
   );
 }
