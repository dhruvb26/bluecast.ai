"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, MotionConfig, Variants, motion } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { ArrowsIn, X } from "@phosphor-icons/react";

const TRANSITION = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
};

interface FloatingPanelContextType {
  isOpen: boolean;
  openFloatingPanel: () => void;
  closeFloatingPanel: () => void;
  uniqueId: string;
  note: string;
  setNote: (note: string) => void;
  title: string;
  setTitle: (title: string) => void;
}

const FloatingPanelContext = createContext<
  FloatingPanelContextType | undefined
>(undefined);

function useFloatingPanel() {
  const context = useContext(FloatingPanelContext);
  if (!context) {
    throw new Error(
      "useFloatingPanel must be used within a FloatingPanelProvider"
    );
  }
  return context;
}

function useFloatingPanelLogic() {
  const uniqueId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");

  const openFloatingPanel = () => {
    setIsOpen(true);
  };
  const closeFloatingPanel = () => {
    setIsOpen(false);
    setNote("");
  };

  return {
    isOpen,
    openFloatingPanel,
    closeFloatingPanel,
    uniqueId,
    note,
    setNote,
    title,
    setTitle,
  };
}

interface FloatingPanelRootProps {
  children: React.ReactNode;
  className?: string;
}

function FloatingPanelRoot({ children, className }: FloatingPanelRootProps) {
  const floatingPanelLogic = useFloatingPanelLogic();

  return (
    <FloatingPanelContext.Provider value={floatingPanelLogic}>
      <MotionConfig transition={TRANSITION}>
        <div className={cn("relative", className)}>{children}</div>
      </MotionConfig>
    </FloatingPanelContext.Provider>
  );
}

interface FloatingPanelTriggerProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

function FloatingPanelTrigger({
  children,
  className,
  title,
  tooltipContent,
}: FloatingPanelTriggerProps & { tooltipContent?: React.ReactNode }) {
  const { openFloatingPanel, uniqueId, setTitle } = useFloatingPanel();

  const handleClick = () => {
    openFloatingPanel();
    setTitle(title);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={cn(className)}
            onClick={handleClick}
            size={"sm"}
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            <div className="flex items-center">
              <span className="text-sm">{children}</span>
            </div>
          </Button>
        </TooltipTrigger>
        {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

interface FloatingPanelContentProps {
  children: React.ReactNode;
  className?: string;
}

function FloatingPanelContent({
  children,
  className,
}: FloatingPanelContentProps) {
  const { isOpen, closeFloatingPanel, uniqueId, title } = useFloatingPanel();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        closeFloatingPanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeFloatingPanel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFloatingPanel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeFloatingPanel]);

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(4px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={contentRef}
              layoutId={`floating-panel-${uniqueId}`}
              className={cn(
                "overflow-hidden border border-zinc-950/10 bg-white shadow-lg outline-none dark:border-zinc-50/10 dark:bg-zinc-800",
                className
              )}
              style={{
                borderRadius: 12,
                maxHeight: "calc(75vh - 2rem)",
                maxWidth: "full",
                display: "flex",
                flexDirection: "column",
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`floating-panel-title-${uniqueId}`}
            >
              <FloatingPanelTitle>{title}</FloatingPanelTitle>
              <div className="flex-grow overflow-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FloatingPanelTitleProps {
  children: React.ReactNode;
}

function FloatingPanelTitle({ children }: FloatingPanelTitleProps) {
  const { uniqueId } = useFloatingPanel();

  return (
    <motion.div
      layoutId={`floating-panel-label-container-${uniqueId}`}
      className="px-4 py-2 bg-white dark:bg-zinc-800"
    >
      <motion.div
        layoutId={`floating-panel-label-${uniqueId}`}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        id={`floating-panel-title-${uniqueId}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface FloatingPanelFormProps {
  children: React.ReactNode;
  onSubmit?: (note: string) => void;
  className?: string;
}

function FloatingPanelForm({
  children,
  onSubmit,
  className,
}: FloatingPanelFormProps) {
  const { note, closeFloatingPanel } = useFloatingPanel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(note);
    closeFloatingPanel();
  };

  return (
    <form
      className={cn("flex h-full flex-col", className)}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}

interface FloatingPanelLabelProps {
  children: React.ReactNode;
  htmlFor: string;
  className?: string;
}

function FloatingPanelLabel({
  children,
  htmlFor,
  className,
}: FloatingPanelLabelProps) {
  const { note } = useFloatingPanel();

  return (
    <motion.label
      htmlFor={htmlFor}
      style={{ opacity: note ? 0 : 1 }}
      className={cn(
        "block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100",
        className
      )}
    >
      {children}
    </motion.label>
  );
}

interface FloatingPanelTextareaProps {
  className?: string;
  id?: string;
}

function FloatingPanelTextarea({ className, id }: FloatingPanelTextareaProps) {
  const { note, setNote } = useFloatingPanel();

  return (
    <textarea
      id={id}
      className={cn(
        "h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-none",
        className
      )}
      autoFocus
      value={note}
      onChange={(e) => setNote(e.target.value)}
    />
  );
}

interface FloatingPanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function FloatingPanelHeader({
  children,
  className,
}: FloatingPanelHeaderProps) {
  return (
    <motion.div
      className={cn(
        "px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelBodyProps {
  children: React.ReactNode;
  className?: string;
}

function FloatingPanelBody({ children, className }: FloatingPanelBodyProps) {
  return (
    <motion.div
      className={cn("overflow-hidden min-w-[50vw] ", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

function FloatingPanelFooter({
  children,
  className,
}: FloatingPanelFooterProps) {
  return (
    <motion.div
      className={cn("flex justify-between px-4 py-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingPanelCloseButtonProps {
  className?: string;
}

function FloatingPanelCloseButton({
  className,
}: FloatingPanelCloseButtonProps) {
  const { closeFloatingPanel } = useFloatingPanel();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={cn(className)}
            onClick={closeFloatingPanel}
            size={"sm"}
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            <div className="flex items-center">
              <span className="text-sm">
                <ArrowsIn size={15} weight="bold" />
              </span>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Close</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface FloatingPanelSubmitButtonProps {
  className?: string;
}

function FloatingPanelSubmitButton({
  className,
}: FloatingPanelSubmitButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative ml-1 flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800",
        className
      )}
      type="submit"
      aria-label="Submit note"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Submit Note
    </motion.button>
  );
}

interface FloatingPanelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function FloatingPanelButton({
  children,
  onClick,
  className,
}: FloatingPanelButtonProps) {
  return (
    <motion.button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700",
        className
      )}
      onClick={onClick}
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

const FloatingPanel = {
  Root: FloatingPanelRoot,
  Trigger: FloatingPanelTrigger,
  Content: FloatingPanelContent,
  Form: FloatingPanelForm,
  Label: FloatingPanelLabel,
  Textarea: FloatingPanelTextarea,
  Header: FloatingPanelHeader,
  Body: FloatingPanelBody,
  Footer: FloatingPanelFooter,
  CloseButton: FloatingPanelCloseButton,
  SubmitButton: FloatingPanelSubmitButton,
  Button: FloatingPanelButton,
};

export { FloatingPanel };
export type {
  FloatingPanelRootProps,
  FloatingPanelTriggerProps,
  FloatingPanelContentProps,
  FloatingPanelFormProps,
  FloatingPanelLabelProps,
  FloatingPanelTextareaProps,
  FloatingPanelHeaderProps,
  FloatingPanelBodyProps,
  FloatingPanelFooterProps,
  FloatingPanelCloseButtonProps,
  FloatingPanelSubmitButtonProps,
  FloatingPanelButtonProps,
};
