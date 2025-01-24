import React from "react";
import { Badge } from "../ui/badge";
import { Sparkle } from "@phosphor-icons/react";

const NewBadge = () => {
  return (
    <Badge className="absolute top-2 right-2 font-normal bg-purple-50 border hover:bg-purple-100 border-purple-100 text-purple-600">
      <Sparkle weight="duotone" className="inline mr-1" size={12} />
      New
    </Badge>
  );
};

export default NewBadge;
