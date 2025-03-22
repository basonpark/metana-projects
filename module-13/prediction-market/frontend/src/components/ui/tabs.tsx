"use client";

import * as React from "react";

// Define the tab context interface
interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}

// Create a context for tabs
const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined
);

// Custom hook to use the tabs context
function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Props for the Tabs component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

// Main Tabs component
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  // Use controlled or uncontrolled state
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

  // Update selected tab when value changes
  React.useEffect(() => {
    if (value) {
      setSelectedTab(value);
    }
  }, [value]);

  // Handle tab selection
  const handleTabChange = React.useCallback(
    (id: string) => {
      if (onValueChange) {
        onValueChange(id);
      }
      if (!value) {
        setSelectedTab(id);
      }
    },
    [onValueChange, value]
  );

  // Create context value
  const contextValue = React.useMemo(
    () => ({
      selectedTab,
      setSelectedTab: handleTabChange,
    }),
    [selectedTab, handleTabChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Props for the TabsList component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

// TabsList component
export function TabsList({ children, className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`flex space-x-2 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Props for the TabsTrigger component
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// TabsTrigger component
export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
  ...props
}: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabsContext();
  const isSelected = selectedTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => setSelectedTab(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
        ${
          isSelected
            ? "bg-primary text-white"
            : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Props for the TabsContent component
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// TabsContent component
export function TabsContent({
  value,
  children,
  className,
  ...props
}: TabsContentProps) {
  const { selectedTab } = useTabsContext();
  const isSelected = selectedTab === value;

  if (!isSelected) return null;

  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  );
}
