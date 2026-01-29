 import type { Injection } from "@/hooks/useInjections";
 import type { Protocol } from "@/hooks/useProtocols";
 
 type ExportData = {
   exportedAt: string;
   protocols: Protocol[];
   injections: Injection[];
 };
 
 export function exportToJSON(protocols: Protocol[], injections: Injection[]): string {
   const data: ExportData = {
     exportedAt: new Date().toISOString(),
     protocols: protocols.map((p) => ({
       ...p,
       startDate: p.startDate instanceof Date ? p.startDate : new Date(p.startDate),
       endDate: p.endDate ? (p.endDate instanceof Date ? p.endDate : new Date(p.endDate)) : null,
     })),
     injections: injections.map((i) => ({
       ...i,
       date: i.date instanceof Date ? i.date : new Date(i.date),
     })),
   };
 
   return JSON.stringify(data, null, 2);
 }
 
 export function exportToCSV(injections: Injection[], protocolLookup: Map<string, Protocol>): string {
   const headers = ["Date", "Protocol", "Dose (mL)", "Concentration (mg/mL)", "Total Dose (mg)", "Notes"];
   
   const rows = injections
     .filter((i) => !i.isTrashed)
     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .map((injection) => {
       const protocol = protocolLookup.get(injection.protocolId);
       const date = injection.date instanceof Date ? injection.date : new Date(injection.date);
       
       return [
         date.toISOString().split("T")[0],
         protocol?.name ?? "Unknown",
         injection.doseMl.toString(),
         injection.concentrationMgPerMl.toString(),
         injection.doseMg.toString(),
         `"${(injection.notes ?? "").replace(/"/g, '""')}"`,
       ].join(",");
     });
 
   return [headers.join(","), ...rows].join("\n");
 }
 
 export function downloadFile(content: string, filename: string, mimeType: string) {
   const blob = new Blob([content], { type: mimeType });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
 }
