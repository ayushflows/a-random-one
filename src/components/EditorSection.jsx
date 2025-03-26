import React from "react";
import { Copy, Play, Save } from "lucide-react";
import Editor from "@monaco-editor/react"; // Import Monaco Editor
import styles from "../styles/SqlEditor.module.css";

const EditorSection = ({ currentQuery, setCurrentQuery, setQueryResults }) => {
  const handleRunQuery = () => {
    const mockResults = [
      { id: 1, name: "Sample Result", value: 100 },
      { id: 2, name: "Another Result", value: 200 },
    ];
    setQueryResults(mockResults);
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
              title="Run Query"
              className={styles.runButton}
            >
              <Play /> Run Query
            </button>
            <button title="Save Query">
              <Save />
            </button>
            <button title="Copy Query">
              <Copy />
            </button>
          </div>
        </div>
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={currentQuery}
          onChange={(code) => setCurrentQuery(code)}
          options={{
            fontSize: 14,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </>
  );
};

export default EditorSection;
