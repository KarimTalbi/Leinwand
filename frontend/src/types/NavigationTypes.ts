import React from "react";

export interface NavbarButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  title?: string;
}