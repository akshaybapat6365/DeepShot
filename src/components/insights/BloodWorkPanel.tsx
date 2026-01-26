 import { useMemo } from "react";
 import { FlaskConical, Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   Tooltip,
   ResponsiveContainer,
 } from "recharts";
 
 import { Button } from "@/components/ui/button";
 import type { BloodWork } from "@/hooks/useBloodWork";
 import { formatDate } from "@/lib/date";
 
 type BloodWorkPanelProps = {
   bloodWork: BloodWork[];
   onAdd: () => void;
   onEdit: (bw: BloodWork) => void;
   onDelete: (bw: BloodWork) => void;
 };
 
 const MARKERS = [
   { key: "totalT", label: "Total T", unit: "ng/dL", color: "#3b82f6", range: [300, 1000] },
   { key: "freeT", label: "Free T", unit: "pg/mL", color: "#22d3ee", range: [9, 30] },
   { key: "e2", label: "E2", unit: "pg/mL", color: "#f97316", range: [20, 50] },
   { key: "hematocrit", label: "HCT", unit: "%", color: "#ef4444", range: [38, 52] },
 ] as const;
 
 function getTrend(values: (number | null)[]): "up" | "down" | "stable" | null {
   const valid = values.filter((v): v is number => v !== null);
   if (valid.length < 2) return null;
   const diff = valid[0] - valid[valid.length - 1];
   if (Math.abs(diff) < valid[0] * 0.05) return "stable";
   return diff > 0 ? "up" : "down";
 }
 
 export function BloodWorkPanel({
   bloodWork,
   onAdd,
   onEdit,
   onDelete,
 }: BloodWorkPanelProps) {
   const chartData = useMemo(() => {
     return [...bloodWork]
       .sort((a, b) => a.date.getTime() - b.date.getTime())
       .slice(-6)
       .map((bw) => ({
         date: formatDate(bw.date),
         totalT: bw.totalT,
         freeT: bw.freeT,
         e2: bw.e2,
         hematocrit: bw.hematocrit,
       }));
   }, [bloodWork]);
 
   const latestValues = useMemo(() => {
     if (bloodWork.length === 0) return null;
     const latest = bloodWork[0];
     return {
       totalT: latest.totalT,
       freeT: latest.freeT,
       e2: latest.e2,
       hematocrit: latest.hematocrit,
     };
   }, [bloodWork]);
 
   const trends = useMemo(() => {
     const recent = bloodWork.slice(0, 3);
     return {
       totalT: getTrend(recent.map((b) => b.totalT)),
       freeT: getTrend(recent.map((b) => b.freeT)),
       e2: getTrend(recent.map((b) => b.e2)),
       hematocrit: getTrend(recent.map((b) => b.hematocrit)),
     };
   }, [bloodWork]);
 
   const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" | null }) => {
     if (!trend) return null;
     if (trend === "up") return <TrendingUp className="size-3 text-green-400" />;
     if (trend === "down") return <TrendingDown className="size-3 text-red-400" />;
     return <Minus className="size-3 text-muted-foreground" />;
   };
 
   return (
     <section className="glass-card p-4 space-y-4">
       {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
           <FlaskConical className="size-3.5" />
           <span className="font-medium text-foreground font-display tracking-wide">
             Blood Work
           </span>
         </div>
         <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onAdd}>
           <Plus className="size-3" />
           Log
         </Button>
       </div>
 
       {bloodWork.length === 0 ? (
         <div className="py-6 text-center">
           <FlaskConical className="size-8 text-muted-foreground/30 mx-auto mb-2" />
           <p className="text-sm text-muted-foreground">No blood work logged</p>
          <p className="text-xs md:text-sm text-muted-foreground/70 mt-1">
             Track your testosterone levels over time
           </p>
         </div>
       ) : (
         <>
           {/* Latest Values */}
           {latestValues && (
             <div className="grid grid-cols-2 gap-2">
               {MARKERS.map((marker) => {
                 const value = latestValues[marker.key as keyof typeof latestValues];
                 const trend = trends[marker.key as keyof typeof trends];
                 const inRange =
                   value !== null &&
                   value >= marker.range[0] &&
                   value <= marker.range[1];
 
                 return (
                   <div
                     key={marker.key}
                     className="p-2.5 rounded-lg bg-white/[0.04] border border-white/5"
                   >
                     <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                         {marker.label}
                       </span>
                       <TrendIcon trend={trend} />
                     </div>
                     <div className="flex items-baseline gap-1 mt-1">
                       <span
                         className={`text-lg font-bold font-display ${
                           value === null
                             ? "text-muted-foreground"
                             : inRange
                               ? "text-foreground"
                               : "text-amber-400"
                         }`}
                       >
                         {value ?? "--"}
                       </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                         {marker.unit}
                       </span>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
 
           {/* Chart */}
           {chartData.length > 1 && (
             <div className="h-32 rounded-lg border border-white/5 bg-white/[0.03] p-2">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                   <XAxis
                     dataKey="date"
                     tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }}
                     tickLine={false}
                     axisLine={false}
                   />
                   <YAxis hide />
                   <Tooltip
                     contentStyle={{
                       background: "rgba(9,12,18,0.95)",
                       border: "1px solid rgba(255,255,255,0.1)",
                       borderRadius: 8,
                       fontSize: 11,
                     }}
                   />
                   <Line
                     type="monotone"
                     dataKey="totalT"
                     stroke="#3b82f6"
                     strokeWidth={2}
                     dot={false}
                   />
                   <Line
                     type="monotone"
                     dataKey="e2"
                     stroke="#f97316"
                     strokeWidth={2}
                     dot={false}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           )}
 
           {/* Recent entries */}
           <div className="space-y-2">
            <p className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">
               Recent Labs
             </p>
             {bloodWork.slice(0, 3).map((bw) => (
               <div
                 key={bw.id}
                 className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5"
               >
                 <div>
                  <p className="text-xs md:text-sm font-medium">{formatDate(bw.date)}</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                     {bw.totalT && `T: ${bw.totalT}`}
                     {bw.e2 && ` · E2: ${bw.e2}`}
                   </p>
                 </div>
                 <div className="flex items-center gap-1">
                   <Button
                     variant="ghost"
                     size="icon"
                     className="size-6"
                     onClick={() => onEdit(bw)}
                   >
                     <Pencil className="size-3" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="size-6 text-destructive"
                     onClick={() => onDelete(bw)}
                   >
                     <Trash2 className="size-3" />
                   </Button>
                 </div>
               </div>
             ))}
           </div>
         </>
       )}
     </section>
   );
 }
