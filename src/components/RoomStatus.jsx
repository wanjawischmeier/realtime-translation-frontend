import { useTranslation } from "react-i18next";

export default function RoomStatus({ status, label, labelActive, labelInActive }) {
  const colorBg = status ? "bg-green-500" : "bg-gray-800";

  const { t } = useTranslation();

  return (
    <div className="flex justify-start mt-2 items-center">
      <div className="text-gray-100 text-sm mr-1">
        {label}:
      </div>
      <span className="flex items-center z-20">
        <span className="relative flex h-3 w-3 mr-1">
          {
            (status && (<span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorBg} opacity-75`}></span>))
          }
          <span className={`relative inline-flex rounded-full h-3 w-3 ${colorBg}`}></span>
        </span>
      </span>
      <div className={`${status ? "text-green-500" : "text-gray-800"} font-bold text-sm`}>
        {status ? labelActive : labelInActive}
      </div>
    </div>


  );
}