import {SettingsNavbar} from "@/components/Navigation/NavBar.tsx";
import {useState} from "react";

export default function Settings() {
  const [newKey, setNewKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  return (
      <div className="min-h-screen bg-white flex flex-col">
        <SettingsNavbar/>
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">

        </main>
      </div>
  )
}