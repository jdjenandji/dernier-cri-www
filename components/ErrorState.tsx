interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold">Oops!</h2>
        <p className="text-gray-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Retry loading stations"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
