import React from "react";
import { Oval } from "react-loader-spinner";

const Loader = ({ size = 40 }) => (
  <div className="w-full h-full flex items-center justify-center">
    <Oval height={size} width={size} />
  </div>
);

export default Loader;
