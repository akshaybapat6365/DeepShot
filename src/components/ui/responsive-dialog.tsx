import type { ReactNode } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

type ResponsiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentClassName?: string;
  children: ReactNode;
};

export function ResponsiveDialog({
  open,
  onOpenChange,
  contentClassName,
  children,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const Root = isMobile ? Drawer : Dialog;
  const Content = isMobile ? DrawerContent : DialogContent;

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Content className={cn(contentClassName)}>{children}</Content>
    </Root>
  );
}
