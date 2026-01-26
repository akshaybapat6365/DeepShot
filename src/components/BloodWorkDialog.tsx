 import { useState, useEffect } from "react";
 import { FlaskConical } from "lucide-react";
 import { toast } from "sonner";
 
 import { Button } from "@/components/ui/button";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { useMediaQuery } from "@/hooks/useMediaQuery";
 import type { BloodWork } from "@/hooks/useBloodWork";
 import { addBloodWork, updateBloodWork } from "@/lib/firestore";
 import { formatInputDate } from "@/lib/date";
 
 type BloodWorkDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   uid: string | undefined;
   initialBloodWork?: BloodWork | null;
 };
 
 export function BloodWorkDialog({
   open,
   onOpenChange,
   uid,
   initialBloodWork,
 }: BloodWorkDialogProps) {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const isEditing = !!initialBloodWork;
 
   const [date, setDate] = useState("");
   const [totalT, setTotalT] = useState("");
   const [freeT, setFreeT] = useState("");
   const [e2, setE2] = useState("");
   const [shbg, setShbg] = useState("");
   const [hematocrit, setHematocrit] = useState("");
   const [psa, setPsa] = useState("");
   const [notes, setNotes] = useState("");
   const [saving, setSaving] = useState(false);
 
   useEffect(() => {
     if (open) {
       if (initialBloodWork) {
         setDate(formatInputDate(initialBloodWork.date));
         setTotalT(initialBloodWork.totalT?.toString() ?? "");
         setFreeT(initialBloodWork.freeT?.toString() ?? "");
         setE2(initialBloodWork.e2?.toString() ?? "");
         setShbg(initialBloodWork.shbg?.toString() ?? "");
         setHematocrit(initialBloodWork.hematocrit?.toString() ?? "");
         setPsa(initialBloodWork.psa?.toString() ?? "");
         setNotes(initialBloodWork.notes ?? "");
       } else {
         setDate(formatInputDate(new Date()));
         setTotalT("");
         setFreeT("");
         setE2("");
         setShbg("");
         setHematocrit("");
         setPsa("");
         setNotes("");
       }
     }
   }, [open, initialBloodWork]);
 
   const handleSubmit = async () => {
     if (!uid || !date) return;
 
     setSaving(true);
     try {
       const data = {
         uid,
         date: new Date(date),
         totalT: totalT ? parseFloat(totalT) : null,
         freeT: freeT ? parseFloat(freeT) : null,
         e2: e2 ? parseFloat(e2) : null,
         shbg: shbg ? parseFloat(shbg) : null,
         hematocrit: hematocrit ? parseFloat(hematocrit) : null,
         psa: psa ? parseFloat(psa) : null,
         notes,
       };
 
       if (isEditing && initialBloodWork) {
         await updateBloodWork({ ...data, bloodWorkId: initialBloodWork.id });
         toast.success("Blood work updated");
       } else {
         await addBloodWork(data);
         toast.success("Blood work logged");
       }
       onOpenChange(false);
     } catch {
       toast.error("Failed to save blood work");
     } finally {
       setSaving(false);
     }
   };
 
  const formContent = (
    <div className="space-y-5">
       {/* Date */}
       <div className="space-y-2">
         <Label htmlFor="bw-date">Date</Label>
         <Input
           id="bw-date"
           type="date"
           value={date}
           onChange={(e) => setDate(e.target.value)}
           className="invert-calendar-icon"
         />
       </div>
 
       {/* Primary markers */}
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label htmlFor="bw-totalT">Total T (ng/dL)</Label>
           <Input
             id="bw-totalT"
             type="number"
             step="0.1"
             placeholder="e.g. 800"
             value={totalT}
             onChange={(e) => setTotalT(e.target.value)}
           />
         </div>
         <div className="space-y-2">
           <Label htmlFor="bw-freeT">Free T (pg/mL)</Label>
           <Input
             id="bw-freeT"
             type="number"
             step="0.1"
             placeholder="e.g. 20"
             value={freeT}
             onChange={(e) => setFreeT(e.target.value)}
           />
         </div>
       </div>
 
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label htmlFor="bw-e2">Estradiol (pg/mL)</Label>
           <Input
             id="bw-e2"
             type="number"
             step="0.1"
             placeholder="e.g. 30"
             value={e2}
             onChange={(e) => setE2(e.target.value)}
           />
         </div>
         <div className="space-y-2">
           <Label htmlFor="bw-shbg">SHBG (nmol/L)</Label>
           <Input
             id="bw-shbg"
             type="number"
             step="0.1"
             placeholder="e.g. 35"
             value={shbg}
             onChange={(e) => setShbg(e.target.value)}
           />
         </div>
       </div>
 
       {/* Safety markers */}
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label htmlFor="bw-hct">Hematocrit (%)</Label>
           <Input
             id="bw-hct"
             type="number"
             step="0.1"
             placeholder="e.g. 48"
             value={hematocrit}
             onChange={(e) => setHematocrit(e.target.value)}
           />
         </div>
         <div className="space-y-2">
           <Label htmlFor="bw-psa">PSA (ng/mL)</Label>
           <Input
             id="bw-psa"
             type="number"
             step="0.01"
             placeholder="e.g. 1.2"
             value={psa}
             onChange={(e) => setPsa(e.target.value)}
           />
         </div>
       </div>
 
       {/* Notes */}
       <div className="space-y-2">
         <Label htmlFor="bw-notes">Notes</Label>
         <Textarea
           id="bw-notes"
           placeholder="Lab name, fasting status, etc."
           value={notes}
           onChange={(e) => setNotes(e.target.value)}
           rows={2}
         />
       </div>
     </div>
   );
 
   const footer = (
     <div className="flex gap-2">
       <Button
         variant="outline"
         className="flex-1"
         onClick={() => onOpenChange(false)}
         disabled={saving}
       >
         Cancel
       </Button>
       <Button
         className="flex-1"
         onClick={handleSubmit}
         disabled={saving || !date}
       >
         {saving ? "Saving..." : isEditing ? "Update" : "Log Blood Work"}
       </Button>
     </div>
   );
 
   if (isMobile) {
     return (
       <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="px-4">
           <DrawerHeader className="text-left px-0">
             <DrawerTitle className="flex items-center gap-2">
               <FlaskConical className="size-5" />
               {isEditing ? "Edit Blood Work" : "Log Blood Work"}
             </DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Add lab values and optional notes for reference.
            </p>
           </DrawerHeader>
           {formContent}
           <DrawerFooter className="px-0">{footer}</DrawerFooter>
         </DrawerContent>
       </Drawer>
     );
   }
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <FlaskConical className="size-5" />
             {isEditing ? "Edit Blood Work" : "Log Blood Work"}
           </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add lab values and optional notes for reference.
          </p>
         </DialogHeader>
         {formContent}
         <DialogFooter>{footer}</DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }
