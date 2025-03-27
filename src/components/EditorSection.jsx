import React, { useState } from "react";
import { Copy, Play, Save, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import styles from "../styles/EditorSection.module.css";

const EditorSection = ({ currentQuery, setCurrentQuery, setQueryResults, isDarkMode, runQuery }) => {
  const [selectedText, setSelectedText] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);

  const handleEditorDidMount = (editor) => {
    setEditorInstance(editor);
    
    // Add selection change listener
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedText(selection.trim());
    });
  };

  const handleRunQuery = () => {
    if (selectedText) {
      runQuery(selectedText);
    } else {
      runQuery(currentQuery);
    }
  };

  return (
    <>
      <div className={styles.editorSection}>
        <div className={styles.editorToolbar}>
          <div className={styles.editorHead}>
            <h4>Input</h4>
          </div>
          <div className={styles.editorActions}>
            <button
              onClick={handleRunQuery}
              title={selectedText ? "Run Selected Query" : "Run Query"}
              className={`${styles.runButton} ${selectedText ? styles.selectedMode : ''}`}
            >
              <Play size={16} className={styles.playIcon} />
              {selectedText ? 'Run Selected' : 'Run Query'}
            </button>
            <button title="Save Query">
              <Save size={16} />
            </button>
            <button title="Copy Query">
              <Copy size={16} />
            </button>
          </div>
        </div>
        <Editor
          height="100%"
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          defaultLanguage="sql"
          value={currentQuery}
          onChange={(code) => setCurrentQuery(code)}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </>
  );
};

export default EditorSection;
