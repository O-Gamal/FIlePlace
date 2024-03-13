import Image from "next/image";
import React from "react";
import UploadButton from "./UploadButton";

const EmptyState = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-6 py-16">
      <div className="select-none pointer-events-none">
        <Image
          src="/empty.svg"
          alt="No files found"
          className="mb-4"
          width={300}
          height={300}
        />
        <span className="text-lg text-gray-500">
          You have no files, upload one now
        </span>
      </div>
      <UploadButton />
    </div>
  );
};

export default EmptyState;
