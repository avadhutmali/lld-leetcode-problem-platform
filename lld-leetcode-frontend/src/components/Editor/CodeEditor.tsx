import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = "typescript" }) => {
    return (
        <div className="h-full w-full border border-gray-700 rounded-lg overflow-hidden shadow-xl">
            <Editor
                height="100%"
                defaultLanguage={language}
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;