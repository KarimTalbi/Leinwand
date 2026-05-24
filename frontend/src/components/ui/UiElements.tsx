import {LucideIcon, LucideProps} from "lucide-react";

interface GetIconProps {
  icon: LucideIcon,
  props?: LucideProps,
}

export const getIcon = ({icon, props}: GetIconProps) => {
  const Icon = icon

  return (
    <Icon {...props}/>
  )
}