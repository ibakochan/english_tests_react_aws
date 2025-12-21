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

  const renderChild = (child: any, key: number, siblings?: any[], index?: number) => {
    if (!child) return "\u00A0";

    // Text node with formatting
    let content: React.ReactNode = child.text ?? "\u00A0";
    if (child.bold) content = <strong key={key}>{content}</strong>;
    if (child.italic) content = <em key={key}>{content}</em>;
    const style: React.CSSProperties = {};
    if (child.fontSize) style.fontSize = `${child.fontSize}px`;
    if (child.color) style.color = child.color;

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

    return <span key={key} style={style}>{content}</span>;
  };

  const renderNode = (node: any, index: number) => {
    if (!node) return null;

    // Block nodes
    if (node.type === "block") {
      const children = (node.children || []).map((c: any, i: number) => renderChild(c, i, node.children, i));
      const fontSize = Math.max(...(node.children?.map((c: any) => c.fontSize).filter(Boolean) || [14]));
      const lineHeight = node.paragraphSize !== undefined ? 1 + node.paragraphSize : 1.2;
      const paragraphHeight = fontSize * lineHeight;

      return (
        <div
          key={index}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight,
            margin: "0em 0",
            minHeight: `${paragraphHeight}px`,
            fontSize,
            textAlign: node.align || "left",
            paddingLeft: "2px",
            paddingRight: "2px",
          }}
        >
          {children.length ? children : <span style={{ fontSize }}>{'\u00A0'}</span>}
        </div>
      );
    }

    // Absolutely positioned image nodes
    if (node.type === "image") {
      const { url, width = 200, height = 200, x = 0, y = 0 } = node;
      return (
        <div
          key={index}
          contentEditable={false}
          style={{
            position: "absolute",
            left: x,
            top: y + 60,
            width,
            height,
            zIndex: 20,
          }}
        >
          <img
            src={url}
            alt=""
            style={{
              width,
              height,
              display: "block",
              border: "2px solid black",
            }}
          />
        </div>
      );
    }

    // Fallback for other nodes
    return <span key={index}>{node.text ?? "\u00A0"}</span>;
  };

  return <>{nodes.map(renderNode)}</>;
};
