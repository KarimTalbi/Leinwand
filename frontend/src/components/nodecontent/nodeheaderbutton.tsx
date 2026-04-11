import {Button} from "@/components/ui/button";
import {JSX} from "react";

interface NodeHeaderButtonProps {
  onClick: () => void;
  icon: () => JSX.Element;
  disabled?: boolean;
}

const NodeHeaderButton = ({onClick, icon, disabled}: NodeHeaderButtonProps) => {
  return (
    <Button onClick={onClick} disabled={disabled}
            className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full
                hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

      {icon()}
    </Button>
  )
};

export default NodeHeaderButton;