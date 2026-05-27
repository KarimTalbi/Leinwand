import {nodeTypeProperties} from "@/lib/styles.ts";
import {CustomButton, CustomButtonProps} from "@/components/ui/CustomButtons.tsx";
import {useStoreWithId} from "@/hooks/useStoreWithId.ts";


const AddConnectedNode = ({sourceId}: { sourceId: string }) => {
  const {conPrompt, conText, conMerge, conSummary} = useStoreWithId(sourceId)

  const addNodeMenu: CustomButtonProps[] = [
    {
      icon: nodeTypeProperties.promptNode.icon,
      iconProps: {color: nodeTypeProperties.promptNode.color, size: 10},
      onClick: conPrompt,
      tooltipLabel: "Add Chat Node",
      tooltipPosition: "bottom",
    },
    {
      icon: nodeTypeProperties.textNode.icon,
      iconProps: {color: nodeTypeProperties.textNode.color, size: 10},
      onClick: conText,
      tooltipLabel: "Add Note Node",
      tooltipPosition: "bottom",
    },
    {
      icon: nodeTypeProperties.summaryNode.icon,
      iconProps: {color: nodeTypeProperties.summaryNode.color, size: 10},
      onClick: () => conSummary(),
      tooltipLabel: "Add Summary Node",
      tooltipPosition: "bottom",
    },
    {
      icon: nodeTypeProperties.mergeNode.icon,
      iconProps: {color: nodeTypeProperties.mergeNode.color, size: 10},
      onClick: () => conMerge(),
      tooltipLabel: "Add Merge Node",
      tooltipPosition: "bottom",
    }
  ]

  return (
    <div className="translate-x-45">
      <div className="flex flex-row items-center justify-around bg-neutral-100 ring-1 ring-neutral-200 rounded-b-md w-25">

        {addNodeMenu.map((button, index) => (
          <CustomButton key={index} className={"px-1 cursor-pointer"} {...button}/>
        ))}

      </div>
    </div>
  )
};

export default AddConnectedNode;