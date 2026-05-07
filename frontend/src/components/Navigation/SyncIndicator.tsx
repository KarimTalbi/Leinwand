const SyncIndicator = ({label, syncing}: { label: string, syncing: boolean }) => (

  <div
    className="z-50 flex items-center gap-2 rounded-full px-3 py-3">

    <span className="text-s font-semibold text-black/80">{label}</span>

    <div
      className={`h-2.5 w-2.5 rounded-full ${syncing ? 'bg-yellow-400' : 'bg-green-500'}`}/>

  </div>

)

export default SyncIndicator;