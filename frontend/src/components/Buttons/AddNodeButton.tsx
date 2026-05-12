import {useState} from "react";
import CircleButton from "@/components/Buttons/CircleButton.tsx";
import {Plus} from "lucide-react";


export const AddNodeButton = () => {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div>

      <CircleButton onClick={() => setIsOpen(!isOpen)} title="Add Node" tooltipPosition="bottom">
        <Plus/>
      </CircleButton>

    </div>
  )
}