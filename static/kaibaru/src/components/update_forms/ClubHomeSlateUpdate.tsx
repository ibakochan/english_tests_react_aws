import React, { useCallback, useMemo, useState, useRef } from "react";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { createEditor, Transforms, Element as SlateElement, Editor, Text } from "slate";
import type { Descendant } from "slate";
import { withHistory } from "slate-history";
import { FaBold, FaItalic } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { FaUpload } from "react-icons/fa";


// Custom types
type CustomText = { text: string; bold?: boolean; italic?: boolean, fontSize?: number; };
type BlockElement = {
  type: "block";
  children: CustomText[];
  paragraphSize?: number;
};
type ImageElement = {
  type: "image";
  id?: number;
  url: string;
  width?: number;
  height?: number;
  children: CustomText[];
};
type CustomElement = BlockElement | ImageElement;

declare module "slate" {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface Props {
  clubId: number;
  club?: any;
  initialValue?: Descendant[];
  onUpdated?: (newHome: Descendant[]) => void;
  scale: number;
  category?: "home" | "trial" | "system" | "contact";
}

const withImages = (editor: ReactEditor) => {
  const { isVoid, isInline } = editor;
  editor.isInline = element => (element.type === "image" ? true : isInline(element));
  editor.isVoid = element => (element.type === "image" ? true : isVoid(element));
  return editor;
};

const ClubSlateUpdate: React.FC<Props> = ({ club, clubId, onUpdated, scale, category }) => {
  const [cookies] = useCookies(["csrftoken"]);
  
  const initialValue: Descendant[] = useMemo(() => {
    if (!club) 
      return [{ type: "block", children: [{ text: "", fontSize: 22 }] }];
  
    const rawData = club[category as keyof typeof club];
    if (!rawData) 
      return [{ type: "block", children: [{ text: "", fontSize: 22 }] }];
  
    try {
      const parsed = JSON.parse(rawData);
      // Ensure every text node has fontSize default
      const addDefaultFontSize = (nodes: Descendant[]): Descendant[] =>
        nodes.map(node => {
          if (Text.isText(node)) {
            return { text: node.text, bold: node.bold, italic: node.italic, fontSize: node.fontSize ?? 22 };
          } else if ("type" in node && node.type === "block") {
            const children = node.children.map(child =>
              Text.isText(child)
                ? { text: child.text, bold: child.bold, italic: child.italic, fontSize: child.fontSize ?? 22 }
                : child
            );
            return { ...node, children };
          } else if ("type" in node && node.type === "image") {
            const children = node.children.map(child =>
              Text.isText(child)
                ? { text: child.text, bold: child.bold, italic: child.italic, fontSize: child.fontSize ?? 22 }
                : child
            );
            return { ...node, children };
          }
          return node;
        });
  
      return parsed.length ? addDefaultFontSize(parsed) : [{ type: "block", children: [{ text: "", fontSize: 22 }] }];
    } catch {
      return [{ type: "block", children: [{ text: "", fontSize: 22 }] }];
    }
  }, [club, category]);

  const [value, setValue] = useState<Descendant[]>(initialValue);



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<number>(0);
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const imgRefs = useRef<Set<HTMLImageElement>>(new Set());
  const editorContainerRef = useRef<HTMLDivElement>(null);

   

  const adjustEditorHeight = () => {
    const editorEl = editorContainerRef.current;
    if (!editorEl) return;

    // Find the bottom-most image
    let maxBottom = 0;
    imgRefs.current.forEach(img => {
      if (img) {
        const bottom = img.offsetTop + img.offsetHeight * scale;
        if (bottom > maxBottom) maxBottom = bottom;
      }
    });

    const editorHeight = editorEl.offsetHeight;

    if (editorHeight < maxBottom) {
      const missingHeight = maxBottom - editorHeight;
      const blockHeight = 22 * 1.2;
      const blocksToAdd = Math.ceil(missingHeight / blockHeight);

      if (blocksToAdd > 0) {
        const newBlocks: BlockElement[] = Array.from({ length: blocksToAdd }, () => ({
          type: "block",
          children: [{ text: "", fontSize: 22 }],
        }));

        Transforms.insertNodes(editor, newBlocks, { at: [value.length] });
      }
    }
  };




  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);

  // --- Text formatting ---
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [fontSizeActive, setFontSizeActive] = useState<number>(22);
  const [paragraphSizeActive, setParagraphSizeActive] = useState(0);



  const toggleFontSize = (size: number) => {
    Editor.addMark(editor, "fontSize", size);
    setFontSizeActive(size);
  };

  const toggleParagraphSize = (size: number) => {
    const { selection } = editor;
    if (!selection) return;
  
    const [blockEntry] = Editor.nodes(editor, {
      at: selection,
      match: n => !Text.isText(n) && "type" in n && n.type === "block",
    });
  
    if (blockEntry) {
      const [_block, path] = blockEntry;
      Transforms.setNodes(editor, { paragraphSize: size }, { at: path });
    }
    setParagraphSizeActive(size);
  };

  const handleSelectionChange = () => {
    setBoldActive(isMarkActive(editor, "bold"));
    setItalicActive(isMarkActive(editor, "italic"));
    
    const [match] = Editor.nodes(editor, {
      match: n => Text.isText(n) && n.fontSize !== undefined,
      universal: true,
    });
    if (match) {
      const [node] = match;
      setFontSizeActive((node as CustomText).fontSize ?? 22);
    } else {
      setFontSizeActive(22);
    }
    
    const [blockMatch] = Editor.nodes(editor, {
      match: n => !Text.isText(n) && "type" in n && n.type === "block",
    });
    setParagraphSizeActive(blockMatch ? (blockMatch[0] as BlockElement).paragraphSize ?? 0 : 0);
  };









  const isMarkActive = (editor: Editor, format: keyof CustomText) => {
    const [match] = Editor.nodes(editor, {
      match: n => Text.isText(n) && n[format] === true,
      universal: true,
    });
    return !!match;
  };



  const toggleMark = (mark: "bold" | "italic") => {
    if (mark === "bold") {
      const newState = !boldActive;
      setBoldActive(newState);
      Editor.addMark(editor, "bold", newState);
    } else if (mark === "italic") {
      const newState = !italicActive;
      setItalicActive(newState);
      Editor.addMark(editor, "italic", newState);
    }
  };





  // --- Image upload to backend ---
  const uploadImage = async (file: File): Promise<{ id: number; url: string } | null> => {
    const formData = new FormData();
    formData.append("club", clubId.toString());
    formData.append("image", file);
    formData.append("category", category || "home");


    try {
      const res = await fetch("/api/slate_images/", {
        method: "POST",
        headers: { "X-CSRFToken": cookies.csrftoken },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "画像アップロード失敗");

      return { id: data.id, url: data.image };
    } catch (err) {
      console.error(err);
      setError("画像アップロードに失敗しました");
      return null;
    }
  };

  const insertImage = async (file: File) => {
    setError(null);
    setPendingUploads(prev => prev + 1);

    const tempUrl = URL.createObjectURL(file);
    const tempNode: ImageElement = {
      type: "image",
      url: tempUrl,
      children: [{ text: "" }],
      width: 200,
      height: 200,
    };

    const { selection } = editor;
    const insertAtEnd =
      selection && Editor.after(editor, selection) === undefined;

    // Insert image node at current cursor position
    Transforms.insertNodes(editor, tempNode);

    // Only insert a paragraph if we're at the end of a block
    if (insertAtEnd) {
      Transforms.insertNodes(editor, {
        type: "block",
        children: [{ text: "", fontSize: 22 }],
      });
    }

    const uploaded = await uploadImage(file);
    if (!uploaded) {
      const [entry] = Editor.nodes(editor, {
        at: [],
        match: n =>
          SlateElement.isElement(n) &&
          n.type === "image" &&
          n.url === tempUrl,
      });
      if (entry) {
        const [_node, path] = entry;
        Transforms.removeNodes(editor, { at: path });
      }
      setPendingUploads(prev => prev - 1);
      return;
    }

    const [entry] = Editor.nodes(editor, {
      at: [],
      match: n =>
        SlateElement.isElement(n) &&
        n.type === "image" &&
        n.url === tempUrl,
    });
    if (entry) {
      const [_node, path] = entry;
      Transforms.setNodes(
        editor,
        { url: uploaded.url, id: uploaded.id },
        { at: path }
      );
    }
    setPendingUploads(prev => prev - 1);
  };


  // --- Update home content ---
  const updateHome = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/update_slate_section/${category}/`, {
        method: "PATCH",
        headers: { "X-CSRFToken": cookies.csrftoken, "Content-Type": "application/json" },
        body: JSON.stringify({ [category || "home"]: value }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "ホーム更新に失敗しました");
        setLoading(false);
        return;
      }

      if (onUpdated) onUpdated(value);
    } catch (err) {
      console.error(err);
      setError("ホーム更新でエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // --- Rendering ---
  const renderElement = useCallback(
    (props: any) => {
      const { element, attributes, children } = props;

      if (element.type === "block") {
        return (
          <div
            {...attributes}
            style={{
              margin: '0em 0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: element.paragraphSize
                ? `${1 + element.paragraphSize}` 
                : "1.2",
            }}
          >
            {children}
          </div>
        );
      }


      if (element.type === "image") {
        const { url, width = 200, height = 200 } = element;

        const resizingRef = useRef(false);
        const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
        const startSizeRef = useRef<{ width: number; height: number }>({ width, height });

        const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation(); // don't trigger drag
          resizingRef.current = true;
          startPosRef.current = { x: e.clientX, y: e.clientY };
          startSizeRef.current = { width, height };
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!resizingRef.current) return;
          const dx = (e.clientX - startPosRef.current.x) / scale;
          const dy = (e.clientY - startPosRef.current.y) / scale;
          const newWidth = Math.max(20, startSizeRef.current.width + dx);
          const newHeight = Math.max(20, startSizeRef.current.height + dy);
          const path = ReactEditor.findPath(editor, element);
          Transforms.setNodes(editor, { width: newWidth, height: newHeight }, { at: path });
          adjustEditorHeight();
        };

        const handleMouseUp = () => {
          resizingRef.current = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };


        return (
          <div
            {...attributes}
            contentEditable={false}
            style={{
              display: "inline-block",
              position: "relative",
              width,
              height: "0em",
              margin: "0 2px",
              verticalAlign: "top",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 0,
                height,          
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", display: "inline-block", width, height }}>
            <img
              ref={el => {
                if (el) {
                  imgRefs.current.add(el);
                } else {
                  imgRefs.current.forEach(img => {
                    if (!img.isConnected) imgRefs.current.delete(img);
                  });
                }
              }}
              src={url}
              alt=""
              draggable
              onLoad={() => {
                if (element.id || !url.startsWith("blob:")) loadedImagesRef.current.add(url);
                adjustEditorHeight();
              }}
              onDragStart={e => {
                if (!loadedImagesRef.current.has(url)) e.preventDefault();
              }}
              style={{ width, height, display: "block", border: "2px solid black", position: "relative" }}
            />

            <div
              onMouseDown={handleResizeMouseDown}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 12,
                height: 12,
                background: "white",
                border: "1px solid black",
                cursor: "nwse-resize",
                zIndex: 10,
              }}
            />
            </span>
            {children}
          </div>
        );
      }




      return <p style={{ margin: "0em 0" }} {...attributes}>{children}</p>;
    },
    [editor, pendingUploads, scale]
  );

  const renderLeaf = useCallback((props: any) => {
    let { children } = props;

    if (props.leaf.bold) children = <strong>{children}</strong>;
    if (props.leaf.italic) children = <em>{children}</em>;
    if (props.leaf.fontSize) children = <span style={{ fontSize: `${props.leaf.fontSize}px` }}>{children}</span>;

    return <span {...props.attributes}>{children}</span>;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    insertImage(e.target.files[0]);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button
          className={`editor-button ${boldActive ? "active" : ""}`}
          onMouseDown={e => { e.preventDefault(); toggleMark("bold"); }}
        >
          <FaBold />
        </button>
        <button
          className={`editor-button ${italicActive ? "active" : ""}`}
          onMouseDown={e => { e.preventDefault(); toggleMark("italic"); }}
        >
          <FaItalic />
        </button>

        <div className="editor-select-wrapper">
          <select
            className="editor-select"
            id="font-size-select"
            value={fontSizeActive}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              toggleFontSize(newSize);
              ReactEditor.focus(editor);
            }}
          >
            {[48,40,32,26,22,18,14].map(sz => (
              <option key={sz} value={sz}>文字サイズ:{sz}</option>
            ))}
          </select>
        </div>

        <div className="editor-select-wrapper">
          <select
            className="editor-select"
            id="paragraph-size-select"
            value={paragraphSizeActive}
            onChange={(e) => {
              const newSize = parseFloat(e.target.value);
              toggleParagraphSize(newSize);
              setParagraphSizeActive(newSize);
              ReactEditor.focus(editor);
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (i + 1) * 0.2).map(sz => (
              <option key={sz} value={sz}>
                段落サイズ:{sz.toFixed(1)}em
              </option>
            ))}

          </select>
        </div>



        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading || pendingUploads > 0}
          />
          <label htmlFor="file-upload">画像をアップロード<FaUpload /></label>
        </div>

      </div>

      <div
        ref={editorContainerRef}
        onDragOver={e => {
          if ([...e.dataTransfer.types].includes("Files")) e.preventDefault();
        }}
        onDrop={async e => {
          const files = e.dataTransfer.files;
          if (!files?.length) return;

          e.preventDefault();

          const selection = editor.selection || Editor.end(editor, []);
          Transforms.select(editor, selection);

          for (const file of Array.from(files)) {
            if (file.type.startsWith("image/") && !(pendingUploads > 0 || loading)) {
              await insertImage(file);
            }
          }
        }}
        style={{
          border: "2px solid black",
        }}
      >

        <Slate editor={editor} initialValue={value} onChange={setValue}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="ホームの内容を入力..."
            spellCheck
            autoFocus
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            style={{
              caretColor: "black",
              outline: "none",
              fontWeight: 500,
            }}
          />
        </Slate>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={updateHome} disabled={loading || pendingUploads > 0} style={{ marginTop: "10px" }}>
        {loading ? "更新中..." : "ホームを更新"}
      </button>
    </div>
  );
};

export default ClubSlateUpdate;