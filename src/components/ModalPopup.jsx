export default function ModalPopup({
  title,
  content,
  confirmText,
  denyText,
  onConfirm,
  onDeny,
  onClose
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-700 p-6 rounded-xl shadow-lg w-full max-w-xs relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <div className="text-white text-2xl mb-4">{title}</div>

        {/* Content */}
        <div className="text-gray-200 mb-4">{content}</div>

        {/* Buttons row */}
        <div className="flex space-x-2">
          <button
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600"
            onClick={onDeny}
          >
            {denyText}
          </button>
        </div>
      </div>
    </div>
  );
}
