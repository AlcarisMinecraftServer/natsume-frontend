export default function LoadingSpinner() {
    return (
        <div className="flex p-6 items-center justify-center h-full text-gray-400">
            <div className="w-12 h-12 border-2 border-cyan-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
