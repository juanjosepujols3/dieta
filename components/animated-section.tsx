"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function AnimatedSection({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"section"> & { children: React.ReactNode }) {
  return (
    <motion.section
      {...props}
      className={cn("opacity-0", className)}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 24 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
