 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import {
   Calendar,
   ChevronRight,
   Syringe,
   TrendingUp,
   CheckCircle2,
 } from "lucide-react";
 
 import { Button } from "@/components/ui/button";
 
 type OnboardingWizardProps = {
   onComplete: () => void;
   onCreateCycle: () => void;
 };
 
 const steps = [
   {
     id: "welcome",
     icon: Syringe,
     title: "Welcome to DeepShot",
     description:
       "Track your TRT protocol with precision. Log injections, monitor your schedule, and stay on top of your therapy.",
     action: "Get Started",
   },
   {
     id: "calendar",
     icon: Calendar,
     title: "Your Injection Calendar",
     description:
       "See your entire schedule at a glance. Scheduled injections appear in blue, logged ones in cyan. Never miss a dose.",
     action: "Next",
   },
   {
     id: "insights",
     icon: TrendingUp,
     title: "Track Your Progress",
     description:
       "Monitor adherence, view dosage trends, and celebrate your consistency streaks. All your data in one place.",
     action: "Next",
   },
   {
     id: "ready",
     icon: CheckCircle2,
     title: "You're All Set!",
     description:
       "Create your first cycle to get started. You can always adjust your protocol settings later.",
     action: "Create First Cycle",
   },
 ];
 
 export function OnboardingWizard({
   onComplete,
   onCreateCycle,
 }: OnboardingWizardProps) {
   const [currentStep, setCurrentStep] = useState(0);
 
   const handleNext = () => {
     if (currentStep < steps.length - 1) {
       setCurrentStep(currentStep + 1);
     } else {
       onComplete();
       onCreateCycle();
     }
   };
 
   const handleSkip = () => {
     onComplete();
   };
 
   const step = steps[currentStep];
   const Icon = step.icon;
   const isLastStep = currentStep === steps.length - 1;
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
       <div className="w-full max-w-md px-6">
         {/* Progress dots */}
         <div className="flex items-center justify-center gap-2 mb-8">
           {steps.map((_, idx) => (
             <div
               key={idx}
               className={`h-1.5 rounded-full transition-all duration-300 ${
                 idx === currentStep
                   ? "w-8 bg-primary"
                   : idx < currentStep
                     ? "w-4 bg-primary/50"
                     : "w-4 bg-white/10"
               }`}
             />
           ))}
         </div>
 
         <AnimatePresence mode="wait">
           <motion.div
             key={step.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
             className="text-center"
           >
             {/* Icon */}
             <div className="mx-auto mb-6 size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)]">
               <Icon className="size-10 text-primary" />
             </div>
 
             {/* Title */}
             <h2 className="text-2xl font-bold font-display mb-3">{step.title}</h2>
 
             {/* Description */}
             <p className="text-muted-foreground leading-relaxed mb-8">
               {step.description}
             </p>
 
             {/* Actions */}
             <div className="space-y-3">
               <Button
                 size="lg"
                 className="w-full gap-2 h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                 onClick={handleNext}
               >
                 {step.action}
                 {!isLastStep && <ChevronRight className="size-4" />}
               </Button>
 
               {!isLastStep && (
                 <Button
                   variant="ghost"
                   size="sm"
                   className="text-muted-foreground hover:text-foreground"
                   onClick={handleSkip}
                 >
                   Skip intro
                 </Button>
               )}
             </div>
           </motion.div>
         </AnimatePresence>
       </div>
     </div>
   );
 }
