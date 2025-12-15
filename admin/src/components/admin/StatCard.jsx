import React from "react";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow flex flex-col">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
  </div>
);

export default StatCard;
