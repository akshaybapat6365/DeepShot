import { useMemo } from "react";
import { Bell, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";
 
 import { Button } from "@/components/ui/button";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
 import { useMediaQuery } from "@/hooks/useMediaQuery";
 import type { Protocol } from "@/hooks/useProtocols";
import { formatDate, startOfDay } from "@/lib/date";
 
 type Notification = {
   id: string;
   type: "upcoming" | "missed" | "streak";
   title: string;
   message: string;
   date: Date;
   protocolId?: string;
 };
 
 type NotificationCenterProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   activeProtocol: Protocol | null;
   nextInjectionDate: Date | null;
   daysRemaining: number | null;
   missedCount: number;
   currentStreak: number;
   onLogInjection: () => void;
 };
 
 export function NotificationCenter({
   open,
   onOpenChange,
   activeProtocol,
   nextInjectionDate,
   daysRemaining,
   missedCount,
   currentStreak,
   onLogInjection,
 }: NotificationCenterProps) {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const today = startOfDay(new Date());
 
   const notifications = useMemo(() => {
     const items: Notification[] = [];
 
     // Upcoming injection notification
     if (activeProtocol && nextInjectionDate && daysRemaining !== null) {
       if (daysRemaining === 0) {
         items.push({
           id: "today",
           type: "upcoming",
           title: "Injection Due Today",
           message: `Your ${activeProtocol.name} injection is scheduled for today.`,
           date: nextInjectionDate,
           protocolId: activeProtocol.id,
         });
       } else if (daysRemaining === 1) {
         items.push({
           id: "tomorrow",
           type: "upcoming",
           title: "Injection Tomorrow",
           message: `Your next ${activeProtocol.name} injection is tomorrow.`,
           date: nextInjectionDate,
           protocolId: activeProtocol.id,
         });
       } else if (daysRemaining <= 3) {
         items.push({
           id: "upcoming",
           type: "upcoming",
           title: "Upcoming Injection",
           message: `Next injection in ${daysRemaining} days (${formatDate(nextInjectionDate)}).`,
           date: nextInjectionDate,
           protocolId: activeProtocol.id,
         });
       }
     }
 
     // Missed injections notification
     if (missedCount > 0) {
       items.push({
         id: "missed",
         type: "missed",
         title: `${missedCount} Missed Injection${missedCount > 1 ? "s" : ""}`,
         message: "You have scheduled injections that weren't logged.",
         date: today,
       });
     }
 
     // Streak notification
     if (currentStreak >= 4) {
       items.push({
         id: "streak",
         type: "streak",
         title: `${currentStreak} Week Streak!`,
         message: "You're maintaining great consistency. Keep it up!",
         date: today,
       });
     }
 
     return items;
   }, [activeProtocol, nextInjectionDate, daysRemaining, missedCount, currentStreak, today]);
 
   const getIcon = (type: Notification["type"]) => {
     switch (type) {
       case "upcoming":
         return <Calendar className="size-5 text-primary" />;
       case "missed":
         return <AlertCircle className="size-5 text-destructive" />;
       case "streak":
         return <CheckCircle2 className="size-5 text-accent" />;
     }
   };
 
   const content = (
     <div className="space-y-3">
       {notifications.length === 0 ? (
         <div className="py-8 text-center">
           <Bell className="size-10 text-muted-foreground/30 mx-auto mb-3" />
           <p className="text-sm text-muted-foreground">No notifications</p>
          <p className="text-xs md:text-sm text-muted-foreground/70 mt-1">
             You're all caught up!
           </p>
         </div>
       ) : (
         <AnimatePresence>
           {notifications.map((notification, index) => (
             <motion.div
               key={notification.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ delay: index * 0.05 }}
               className={`
                 p-4 rounded-xl border transition-colors
                 ${notification.type === "upcoming" ? "bg-primary/5 border-primary/20" : ""}
                 ${notification.type === "missed" ? "bg-destructive/5 border-destructive/20" : ""}
                 ${notification.type === "streak" ? "bg-accent/5 border-accent/20" : ""}
               `}
             >
               <div className="flex items-start gap-3">
                 <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold">{notification.title}</p>
                   <p className="text-xs text-muted-foreground mt-0.5">
                     {notification.message}
                   </p>
                   {notification.type === "upcoming" && notification.id === "today" && (
                     <Button
                       size="sm"
                      className="mt-2 h-8 text-xs md:text-sm"
                       onClick={() => {
                         onOpenChange(false);
                         onLogInjection();
                       }}
                     >
                       Log Now
                     </Button>
                   )}
                 </div>
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
       )}
     </div>
   );
 
   if (isMobile) {
     return (
       <Drawer open={open} onOpenChange={onOpenChange}>
         <DrawerContent className="px-4 pb-8">
           <DrawerHeader className="text-left px-0">
             <DrawerTitle className="flex items-center gap-2">
               <Bell className="size-5" />
               Notifications
               {notifications.length > 0 && (
                 <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                   {notifications.length}
                 </span>
               )}
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
             <Bell className="size-5" />
             Notifications
             {notifications.length > 0 && (
               <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                 {notifications.length}
               </span>
             )}
           </DialogTitle>
         </DialogHeader>
         {content}
       </DialogContent>
     </Dialog>
   );
 }
 
 // Notification bell button for header
 type NotificationBellProps = {
   count: number;
   onClick: () => void;
 };
 
 export function NotificationBell({ count, onClick }: NotificationBellProps) {
   return (
     <Button
       variant="ghost"
       size="icon"
       className="size-8 relative"
       onClick={onClick}
       aria-label={`Notifications${count > 0 ? ` (${count})` : ""}`}
     >
       <Bell className="size-3.5" />
       {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
           {count > 9 ? "9+" : count}
         </span>
       )}
     </Button>
   );
 }
