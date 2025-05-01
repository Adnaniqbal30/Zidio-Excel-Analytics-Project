import React from "react";

const Upload = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Upload Excel File</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="border p-2 w-full rounded-md"
      />
    </div>
  );
};

export default Upload;
