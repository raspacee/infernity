"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface SidebarContextType {
  open: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setIsOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ open, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error(
      "useSidebarContext must be used within SidebarContextProvider"
    );

  return context;
};
