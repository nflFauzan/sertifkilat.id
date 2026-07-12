export default function EditorLoading() {
  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden animate-pulse">
      {/* Top Toolbar Skeleton */}
      <div className="h-14 bg-slate-800 border-b border-slate-700/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-slate-700 rounded-lg" />
          <div className="h-5 w-40 bg-slate-700 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-700 rounded-lg" />
          <div className="h-8 w-32 bg-slate-700 rounded-lg" />
          <div className="h-8 w-24 bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar Strip (Figma Style) */}
        <div className="w-16 bg-slate-850 border-r border-slate-700/30 flex flex-col items-center py-4 gap-4 shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 bg-slate-700 rounded-xl" />
          ))}
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 relative">
          {/* Main Template Board Outline */}
          <div className="aspect-[1122/794] w-2/3 max-w-4xl bg-slate-800/40 rounded-xl border border-slate-700/40 shadow-2xl flex flex-col p-8 justify-between">
            <div className="flex justify-between">
              <div className="h-10 w-24 bg-slate-700/60 rounded" />
              <div className="h-8 w-8 bg-slate-700/60 rounded-full" />
            </div>
            <div className="space-y-4 self-center w-full max-w-md">
              <div className="h-12 w-full bg-slate-700/65 rounded-lg" />
              <div className="h-4 w-2/3 bg-slate-700/50 rounded mx-auto" />
            </div>
            <div className="flex justify-between">
              <div className="h-8 w-24 bg-slate-700/60 rounded" />
              <div className="h-8 w-24 bg-slate-700/60 rounded" />
            </div>
          </div>
        </div>

        {/* Right Sidebar Properties Skeleton */}
        <div className="w-72 bg-slate-850 border-l border-slate-700/30 p-5 flex flex-col gap-6 shrink-0">
          <div className="space-y-2">
            <div className="h-5 w-28 bg-slate-700 rounded" />
            <div className="h-4 w-full bg-slate-700/60 rounded" />
          </div>
          <div className="h-px bg-slate-700/40" />
          <div className="space-y-3">
            <div className="h-4 w-16 bg-slate-700 rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-9 bg-slate-700 rounded-lg" />
              <div className="h-9 bg-slate-700 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-20 bg-slate-700 rounded" />
            <div className="h-9 w-full bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
