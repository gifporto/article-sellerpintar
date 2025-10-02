"use client";

import { useEffect, useState } from "react";
import { createEditor, SerializedEditorState } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

interface LexicalContentProps {
  content?: string | null;
  className?: string;
}

export default function LexicalContent({ content, className }: LexicalContentProps) {
  const [html, setHtml] = useState("<p>Memuat konten...</p>");

  useEffect(() => {
    if (!content) {
      setHtml("<p>Konten tidak tersedia</p>");
      return;
    }

    try {
      const parsed: SerializedEditorState = JSON.parse(content);
      const editor = createEditor();
      const state = editor.parseEditorState(parsed);

      let generatedHtml = "";
      state.read(() => {
        // Konversi JSON Lexical → HTML dengan semua style dan format
        generatedHtml = $generateHtmlFromNodes(editor);
      });

      setHtml(generatedHtml);
    } catch (err) {
      console.warn("Gagal konversi konten:", err);
      setHtml(content); // fallback ke string mentah
    }
  }, [content]);

  return (
    <div
      className={`${className} [&>p]:mb-6 [&>p]:last:mb-0`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
