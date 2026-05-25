import {Background} from "@xyflow/react";
import {CustomBackgrounds} from "@/lib/styles.ts";


export const CustomBackground = () => {
  return (
    <>
      <Background {...CustomBackgrounds[0]}/>
      <Background {...CustomBackgrounds[1]}/>
      <Background {...CustomBackgrounds[2]}/>
    </>
  )
}