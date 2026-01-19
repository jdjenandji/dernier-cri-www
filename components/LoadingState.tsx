export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
