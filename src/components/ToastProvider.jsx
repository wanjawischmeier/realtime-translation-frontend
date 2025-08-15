import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Toast } from "flowbite-react";
import {
  HiOutlineInformationCircle,
  HiExclamation,
  HiXCircle,
  HiX,
} from "react-icons/hi";

const ToastContext = createContext(null);

// Icons and styles per toast type
const toastTypeInfo = {
  info: {
    icon: <HiOutlineInformationCircle className="h-5 w-5" />,
    iconBg: "bg-blue-100 text-blue-500",
    titleDefault: "Info",
  },
  warning: {
    icon: <HiExclamation className="h-5 w-5" />,
    iconBg: "bg-yellow-100 text-yellow-600",
    titleDefault: "Warning",
  },
  error: {
    icon: <HiXCircle className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-500",
    titleDefault: "Error",
  },
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef({});

  const addToast = useCallback(({ title, message, type = "info" }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, title, message, type, visible: true },
    ]);

    // Start fade-out after 2 seconds
    timeouts.current[id] = setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, visible: false } : toast
        )
      );
      // Remove from DOM after fade-out duration (300ms)
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        delete timeouts.current[id];
      }, 300);
    }, 5000);
  }, []);

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="
          fixed bottom-4 left-1/2 -translate-x-1/2
          flex flex-col-reverse items-center gap-2 z-50
          sm:left-4 sm:translate-x-0
        "
      >
        {toasts.map((toast) => {
          const { icon, iconBg, titleDefault } =
            toastTypeInfo[toast.type] || toastTypeInfo.info;

          return (
            <Toast
              key={toast.id}
              className={`transition-opacity duration-300 min-w-[320px] bg-gray-700 text-white flex items-start shadow-lg`}
              style={{ opacity: toast.visible ? 1 : 0 }}
            >
              <div
                className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg mr-3 mt-1 ${iconBg}`}
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="mb-1 font-semibold text-sm">
                  {toast.title || titleDefault}
                </div>
                <div className="text-sm max-w-[310px] break-all">{toast.message}</div>
              </div>
            </Toast>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
