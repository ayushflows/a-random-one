import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";
import { Copy, Play, Save } from "lucide-react";
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
          value={currentQuery}
          onValueChange={(code) => setCurrentQuery(code)}
          highlight={(code) => highlight(code, languages.sql)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: "#ffffff",
            color: "#000000",
            height: "100%",
            overflow: "auto",
          }}
        />
      </div>
    </>
  );
};

export default EditorSection;
