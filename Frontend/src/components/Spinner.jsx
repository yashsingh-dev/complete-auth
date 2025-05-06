import React from "react";
import Background from "./Background";
import { Loader } from "lucide-react";

const Spinner = () => {
  return (
    <Background>
      <Loader className="size-10 animate-spin text-white" />
    </Background>
  );
};

export default Spinner; 
