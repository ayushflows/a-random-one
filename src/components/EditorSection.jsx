import React from "react";
import { Copy, Play, Save } from "lucide-react";
import Editor from "@monaco-editor/react";
import styles from "../styles/EditorSection.module.css";

const EditorSection = ({ currentQuery, setCurrentQuery, setQueryResults, isDarkMode, runQuery }) => {
  const handleRunQuery = () => {
    runQuery();
    const randomRowCount = Math.floor(Math.random() * 50) + 1; // Generate random rows between 1 and 50
    const mockResults = Array.from({ length: randomRowCount }, (_, i) => ({
      id: i + 1,
      name: `Random Entity ${i + 1}`,
      value: (Math.random() * 100).toFixed(2),
    }));
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
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          defaultLanguage="sql"
          value={currentQuery}
          onChange={(code) => setCurrentQuery(code)}
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
