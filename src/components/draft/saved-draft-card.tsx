"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GlobeHemisphereWest, ArrowsOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ReactionGrid from "../inspiration/reaction-grid";
import { v4 as uuid } from "uuid";
import ContentViewer from "../draft/content-viewer";
import { saveDraft } from "@/actions/draft";
import dynamic from "next/dynamic";
import { Loader2, PenSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { FloatingPanel } from "../ui/floating-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SendIcon from "../icons/send-icon";
import LikeIcon from "../icons/like-icon";
import CommentIcon from "../icons/comment-icon";
import RepostIcon from "../icons/repost-icon";
import { Avatar, AvatarFallback } from "../ui/avatar";
