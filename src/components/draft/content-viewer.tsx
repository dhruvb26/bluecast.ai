"use client";
import { CaretUp } from "@phosphor-icons/react";
import React, { useRef, useEffect, useState } from "react";
import { Descendant, Element as SlateElement, Text } from "slate";

interface ContentViewerProps {
  postId: string;
  disabled?: boolean; // Add this line
  value: Descendant[];
  expanded?: boolean; // Add this line
}

const ContentViewer: React.FC<ContentViewerProps> = ({
  value,
  postId,
  disabled,
  expanded = false,
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const contentRef = useRef<HTMLDivElement>(null);

  const renderElement = (props: any) => {
    switch (props.element.type) {
      case "paragraph":
        const isEmpty =
          props.element.children.length === 1 &&
          props.element.children[0].text === "";
        return (
          <p className={`${isEmpty ? "h-4" : "mb-0"}`}>{props.children}</p>
        );
      default:
        return <p className="mb-4">{props.children}</p>;
    }
  };

  const renderLeaf = (props: any) => {
    return (
      <span
        style={{
          fontWeight: props.leaf.bold ? "bold" : "normal",
          fontStyle: props.leaf.italic ? "italic" : "normal",
          textDecoration: props.leaf.underline ? "underline" : "none",
        }}
      >
        {props.leaf.text}
      </span>
    );
  };

  const renderNode = (node: Descendant): JSX.Element => {
    if (Text.isText(node)) {
      return renderLeaf({ leaf: node });
    } else if (SlateElement.isElement(node)) {
      return renderElement({
        element: node,
        children: node.children.map((child, index) => (
          <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
        )),
      });
    }
    return <></>;
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const isContentOverflowing =
          contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setIsOverflowing(isContentOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [value, isExpanded]);

  const toggleExpand = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };
  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <div className="mb-2">
      <div
        ref={contentRef}
        className={`whitespace-pre-wrap break-words text-sm text-black min-h-[100px] ${
          isExpanded ? "" : "max-h-[100px] overflow-hidden"
        }`}
      >
        {value.map((node, index) => (
          <React.Fragment key={index}>{renderNode(node)}</React.Fragment>
        ))}
      </div>
      {(isOverflowing || isExpanded) && (
        <button
          onClick={toggleExpand}
          className={`text-sm ${
            disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-500 hover:text-blue-700 hover:underline"
          }`}
          disabled={disabled}
        >
          {isExpanded ? (
            <>
              See less <CaretUp weight="bold" className="inline-block" />
            </>
          ) : (
            "...more"
          )}
        </button>
      )}
    </div>
  );
};

export default ContentViewer;
