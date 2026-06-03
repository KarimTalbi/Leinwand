import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {Panel} from "@xyflow/react";
import {Bot, FolderOpen, User} from "lucide-react";
import {useEffect} from "react";


export const Alerts = () => {
  const {currentCanvasId, token, setLoginOpen, setProjectsOpen, setAiSettingsOpen, defaultModel} = useStore(
    useShallow((s) => ({
      currentCanvasId: s.currentCanvasId,
      token: s.token,
      setLoginOpen: s.setLoginOpen,
      setProjectsOpen: s.setProjectsOpen,
      setAiSettingsOpen: s.setAiSettingsOpen,
      defaultModel: s.defaultModel
    }))
  )
  useEffect(() => {
    console.log('hello')
    if (!token) {
      setLoginOpen(true);
    } else if (!defaultModel.model) {
      setAiSettingsOpen(true)
    } else if (!currentCanvasId) {
      setProjectsOpen(true)
    }
  }, [token, defaultModel.model, currentCanvasId]);

  if (!token) {

    return (
      <Panel position="top-left">
        <div role="alert" className="alert alert-info">
          <User size={16}/>
          <span>Please log in or create an account</span>
        </div>
      </Panel>
    )
  }

  if (!defaultModel.model) {

    return (
      <Panel position="top-left">
        <div role="alert" className="alert alert-info">
          <Bot size={16}/>
          <span>Please Add an Api Key and choose a default Model</span>
        </div>
      </Panel>
    )
  }

  if (!currentCanvasId) {

    return (
      <Panel position="top-left">
        <div role="alert" className="alert alert-info">
          <FolderOpen size={16}/>
          <span>Please Choose or create a Project</span>
        </div>
      </Panel>
    )
  }

  return null
}