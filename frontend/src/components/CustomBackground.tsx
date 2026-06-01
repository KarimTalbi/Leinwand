import {useTheme} from "@/hooks/useTheme.ts";
import {Background, BackgroundVariant} from "@xyflow/react";


export const CustomBackground = () => {
  const {theme} = useTheme()

  if (theme === "dark") {
    return (
      <>

      </>
    )
  }

  return (
    <>
      <Background
        id="1"
        size={3}
        gap={[60, 60]}
        offset={132}
        bgColor="white"
      />

      <Background
        id="2"
        size={6}
        gap={[300, 300]}
        offset={160}
        variant={BackgroundVariant.Lines}
        lineWidth={12}
      />

      <Background
        id="3"
        size={4}
        gap={[300, 300]}
        offset={160}
        variant={BackgroundVariant.Lines}
        lineWidth={1}
        style={{strokeDasharray: "15, 10", strokeDashoffset: "20"}}
      />
    </>
  )
}