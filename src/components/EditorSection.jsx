import React, { useState, useEffect } from "react";
import { Copy, Play, Save, Plus, X, Type, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import Editor from "@monaco-editor/react";
import styles from "../styles/EditorSection.module.css";

const EditorSection = ({ currentQuery, setCurrentQuery, setQueryResults, isDarkMode, runQuery, setPastQueries }) => {
  const [selectedText, setSelectedText] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Query 1', content: '' }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [fontSize, setFontSize] = useState(14);
  const [showDropdown, setShowDropdown] = useState(false);

  // Watch for changes in currentQuery prop
  useEffect(() => {
    // Only update if currentQuery is not empty (meaning it's from saved queries)
    if (currentQuery.trim()) {
      setTabs(prevTabs => prevTabs.map(tab => 
        tab.id === activeTab ? { ...tab, content: currentQuery } : tab
      ));
    }
  }, [currentQuery, activeTab]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(`.${styles.mobileActions}`)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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

  // Add font size handlers
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(prev => prev + 2);
      editorInstance?.updateOptions({ fontSize: fontSize + 2 });
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 10) {
      setFontSize(prev => prev - 2);
      editorInstance?.updateOptions({ fontSize: fontSize - 2 });
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${styles[type]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.classList.add(styles.fadeOut);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = selectedText || currentQuery;
      await navigator.clipboard.writeText(textToCopy);
      showNotification('Query copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy query:', err);
      showNotification('Failed to copy query', 'error');
    }
  };

  const handleSave = () => {
    if (!currentQuery.trim()) {
      showNotification('Cannot save empty query', 'error');
      return;
    }
    
    setPastQueries(prev => {
      if (!prev.includes(currentQuery)) {
        return [currentQuery, ...prev.slice(0, 4)]; // Keep last 5 queries
      }
      return prev;
    });
    
    showNotification('Query saved to history!');
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
                      <X size={10} />
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
                  <Plus size={12} />
                </button>
              )}
            </div>
          </div>
          <div className={styles.editorActions}>
            <button
              className={`${styles.runButton} ${selectedText ? styles.selectedMode : ''}`}
              onClick={handleRunQuery}
              title="Run Query (Alt+Enter)"
            >
              <Play size={16} />
              <span className={styles.runButtonText}>
                {selectedText ? 'Run Selected' : 'Run Query'}
              </span>
              <span className={styles.runButtonMobileText}>Run</span>
            </button>

            {/* Desktop view buttons */}
            <div className={styles.desktopActions}>
              <div className={styles.actionButtons}>
                <button
                  className={styles.actionButton}
                  onClick={handleCopy}
                  title="Copy Query"
                >
                  <Copy size={14} />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={handleSave}
                  title="Save Query"
                >
                  <Save size={14} />
                </button>
              </div>

              <div className={styles.fontSizeControls}>
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 10}
                  title="Decrease font size"
                >
                  <ChevronDown size={14} />
                </button>
                <span className={styles.fontSizeDisplay}>{fontSize}</span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize >= 24}
                  title="Increase font size"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
            </div>

            {/* Mobile/Tablet view dropdown */}
            <div className={styles.mobileActions}>
              <button 
                className={styles.moreButton} 
                onClick={() => setShowDropdown(!showDropdown)}
                title="More Actions"
              >
                <MoreVertical size={16} />
              </button>
              {showDropdown && (
                <div className={styles.dropdown}>
                  <button onClick={() => { handleCopy(); setShowDropdown(false); }}>
                    <Copy size={14} />
                    Copy Query
                  </button>
                  <button onClick={() => { handleSave(); setShowDropdown(false); }}>
                    <Save size={14} />
                    Save Query
                  </button>
                  <div className={styles.dropdownDivider} />
                  <div className={styles.fontSizeSection}>
                    <span>Font Size: {fontSize}</span>
                    <div className={styles.fontSizeButtons}>
                      <button 
                        onClick={() => { decreaseFontSize(); }}
                        disabled={fontSize <= 10}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button 
                        onClick={() => { increaseFontSize(); }}
                        disabled={fontSize >= 24}
                      >
                        <ChevronUp size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            fontSize: fontSize,
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </>
  );
};

export default EditorSection;
