import type * as React from "react"
import { cn } from "@/lib/utils"

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto", className)} {...props}>
      {children}
    </div>
  )
}

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  title?: string
  description?: string
  header?: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function BentoCard({ className, title, description, header, icon, children, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        className,
      )}
      {...props}
    >
      {header && <div className="group-hover/bento:translate-x-2 transition duration-200">{header}</div>}
      {icon && <div className="p-2">{icon}</div>}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {title && <h3 className="font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">{title}</h3>}
        {description && <p className="text-neutral-500 text-sm max-w-lg dark:text-neutral-300">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  title: string
  description: string
  header?: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function BentoGridItem({ className, title, description, header, icon, children, ...props }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        className,
      )}
      {...props}
    >
      {header && <div className="group-hover/bento:translate-x-2 transition duration-200">{header}</div>}
      {icon && <div className="p-2">{icon}</div>}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <h3 className="font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">{title}</h3>
        <p className="text-neutral-500 text-sm max-w-lg dark:text-neutral-300">{description}</p>
        {children}
      </div>
    </div>
  )
}
