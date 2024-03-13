import { Loader2 } from "lucide-react";
import React from "react";

const LoadingFiles = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-96">
      <Loader2 className="w-16 h-16 animate-spin text-gray-500" />
      <span className="text-lg text-gray-500">Loading files...</span>
    </div>
  );
};

export default LoadingFiles;
