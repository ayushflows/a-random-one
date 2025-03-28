import React, { useState, useEffect } from "react";
import { Copy, Play, Save, Plus, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import styles from "../styles/EditorSection.module.css";

const EditorSection = ({ currentQuery, setCurrentQuery, setQueryResults, isDarkMode, runQuery }) => {
  const [selectedText, setSelectedText] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Query 1', content: '' }
  ]);
  const [activeTab, setActiveTab] = useState(1);

  // Watch for changes in currentQuery prop
  useEffect(() => {
    // Only update if currentQuery is not empty (meaning it's from saved queries)
    if (currentQuery.trim()) {
      setTabs(prevTabs => prevTabs.map(tab => 
        tab.id === activeTab ? { ...tab, content: currentQuery } : tab
      ));
    }
  }, [currentQuery, activeTab]);

  const handleEditorDidMount = (editor) => {
    setEditorInstance(editor);
    
    // Add selection change listener
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedText(selection.trim());
    });

    // Add keyboard shortcut listener for Alt+Enter
    editor.addCommand(
      // Monaco.KeyMod.Alt | Monaco.KeyCode.Enter
      512 | 3, // Alt + Enter
      () => {
        // Get the current content or selected text
        const currentContent = editor.getValue();
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        
        // Run the appropriate query
        if (selectedText.trim()) {
          runQuery(selectedText.trim());
        } else if (currentContent.trim()) {
          runQuery(currentContent.trim());
        }
      }
    );
  };

  const handleRunQuery = () => {
    const currentTabContent = tabs.find(tab => tab.id === activeTab)?.content || '';
    try {
      if (selectedText) {
        runQuery(selectedText);
      } else if (currentTabContent.trim()) {
        runQuery(currentTabContent);
      }
    } catch (err) {
      console.log("Query execution error: ", err);
      setQueryResults([]);
    }
  };

  const handleAddTab = () => {
    if (tabs.length >= 3) return; // Max 3 tabs
    const newTabId = Math.max(...tabs.map(tab => tab.id)) + 1;
    // Add new empty tab
    const newTab = { id: newTabId, name: `Query ${newTabId}`, content: '' };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
    // Clear the current query when adding new tab
    setCurrentQuery('');
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length === 1) return; // Don't allow closing last tab
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const tabContent = tabs.find(tab => tab.id === tabId)?.content || '';
    setCurrentQuery(tabContent);
  };

  const handleEditorChange = (content) => {
    setCurrentQuery(content);
    setTabs(tabs.map(tab => 
      tab.id === activeTab ? { ...tab, content } : tab
    ));
  };

  return (
    <>
      <div className={styles.editorSection}>
        <div className={styles.editorToolbar}>
          <div className={styles.editorHead}>
            <div className={styles.tabsContainer}>
              {tabs.map(tab => (
                <div 
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <span>{tab.name}</span>
                  {tabs.length > 1 && (
                    <button
                      className={styles.closeTab}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {tabs.length < 3 && (
                <button 
                  className={styles.addTab}
                  onClick={handleAddTab}
                  title="Add new query tab"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
          <div className={styles.editorActions}>
            <button
              onClick={handleRunQuery}
              title={`${selectedText ? "Run Selected Query" : "Run Query"} (Alt+Enter)`}
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
          value={tabs.find(tab => tab.id === activeTab)?.content || ''}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            // Add keyboard shortcut to the editor's options
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </>
  );
};

export default EditorSection;
