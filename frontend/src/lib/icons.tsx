import {LucideIcon, LucideProps} from "lucide-react";

interface GetIconProps extends LucideProps {
  icon: LucideIcon,
}

const getIcon = ({icon, color, size, ...props}: GetIconProps) => {
  const Icon = icon

  return (
    <Icon size={size} color={color} {...props} />
  )
}
export default getIcon;