import React from "react";

export const RenderSlateContent: React.FC<{ rawData?: string; emptyMessage?: string }> = ({
  rawData,
  emptyMessage = "まだ内容がありません",
}) => {
  if (!rawData) return <p>{emptyMessage}</p>;

  let nodes: any[];
  try {
    nodes = JSON.parse(rawData);
  } catch {
    return <p>{rawData}</p>;
  }

  const renderChild = (child: any, key: number, siblings?: any[], index?: number, spanHeight?: number) => {
    if (!child) return "\u00A0";

    // 🖼️ Image node
    if (child.type === "image") {
      const { url, width = 200, height = 200 } = child;
      return (
        <span
          key={key}
          style={{
            display: "inline-block",
            position: "relative",
            width,
            height: spanHeight,
            margin: "0 2px",
            verticalAlign: "middle", // ✅ keep image vertically centered with text
          }}
        >
          <div
            contentEditable={false}
            style={{
              position: "absolute",
              left: 0,
              width,
              top: 0,
              height,
              overflow: "hidden",
            }}
          >
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                border: "2px solid black",
              }}
            />
          </div>
        </span>
      );
    }

    // 📝 Text node with formatting
    let content: React.ReactNode = child.text ?? "\u00A0";
    if (child.bold) content = <strong key={key}>{content}</strong>;
    if (child.italic) content = <em key={key}>{content}</em>;
    if (child.fontSize)
      content = (
        <span style={{ fontSize: `${child.fontSize}px` }} key={key}>
          {content}
        </span>
      );

    // Avoid extra spacing between consecutive images
    if (
      child.text === "" &&
      siblings &&
      index !== undefined &&
      ((index > 0 && siblings[index - 1]?.type === "image") ||
        (index < siblings.length - 1 && siblings[index + 1]?.type === "image"))
    ) {
      return null;
    }

    return content;
  };

  const renderNode = (node: any, index: number) => {
    if (!node) return null;

    // Determine base font size from children
    let fontSize = 14; // fallback default
    if (node.children) {
      const childFontSizes = node.children.map((c: any) => c.fontSize).filter(Boolean);
      if (childFontSizes.length > 0) fontSize = Math.max(...childFontSizes);
    }

    // Compute lineHeight from paragraphSize
    const lineHeight = node.paragraphSize !== undefined ? 1 + node.paragraphSize : 1.2;
    const paragraphHeight = fontSize * lineHeight;

    const children = (node.children || []).map((c: any, i: number) =>
      renderChild(c, i, node.children, i, paragraphHeight)
    );

    const filteredChildren: React.ReactNode[] = children.filter(
      (c: React.ReactNode | null): c is React.ReactNode => c !== null
    );

    const contentToRender = filteredChildren.length ? (
      filteredChildren
    ) : (
      <span style={{ fontSize }}>{'\u00A0'}</span>
    );

    if (node.type === "block") {
      return (
        <div
          key={index}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: "0em 0",
            lineHeight,
            minHeight: `${paragraphHeight}px`,
            fontSize,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center", // ✅ normalize text+image baseline alignment
          }}
        >
          {contentToRender}
        </div>
      );
    }

    if (node.type === "image") {
      const { url, width = 200, height = 200 } = node;
      return (
        <img
          key={index}
          src={url}
          alt=""
          style={{
            width,
            height,
            display: "inline-block",
            border: "2px solid black",
            verticalAlign: "middle",
          }}
        />
      );
    }

    return <span key={index}>{contentToRender}</span>;
  };

  return <>{nodes.map(renderNode)}</>;
};
