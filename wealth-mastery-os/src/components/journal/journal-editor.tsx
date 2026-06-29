"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered,
  Quote, Code, Undo, Redo, Check, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ToolbarButton({ active, onClick, label, children }: { active?: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg transition-colors [&_svg]:size-4",
        active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 p-2">
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 /></ToolbarButton>
      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
      <ToolbarButton label="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo /></ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo /></ToolbarButton>
    </div>
  );
}

const INITIAL = `<h1>Reflections on capital</h1><p>Today I connected <strong>interest rates</strong> to valuation. The discount rate is gravity — when it rises, every future cash flow weighs less today.</p><ul><li>What I learned</li><li>What confused me</li><li>How I'll apply it</li></ul><blockquote>Own things that compound faster than money decays.</blockquote>`;

export function JournalEditor() {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your reflection… Press / ideas, capture insights, link concepts." }),
    ],
    content: INITIAL,
    editorProps: {
      attributes: {
        class: "prose-journal focus:outline-none min-h-[340px]",
      },
    },
  });

  const triggerSave = useCallback(() => {
    setSaveState("saving");
    const t = setTimeout(() => setSaveState("saved"), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      setSaveState("saving");
    };
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor]);

  // Debounced autosave indicator
  useEffect(() => {
    if (saveState !== "saving") return;
    const t = setTimeout(() => setSaveState("saved"), 900);
    return () => clearTimeout(t);
  }, [saveState]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <input
          defaultValue="Untitled reflection"
          aria-label="Entry title"
          className="bg-transparent font-display text-base font-semibold outline-none placeholder:text-muted-foreground"
        />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</> : <><Check className="size-3.5 text-green" /> Saved</>}
        </span>
      </div>
      {editor && <Toolbar editor={editor} />}
      <div className="p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
