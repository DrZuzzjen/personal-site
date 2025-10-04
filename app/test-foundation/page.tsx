'use client';
import { useWindowContext } from '../lib/WindowContext';
import { useFileSystemContext } from '../lib/FileSystemContext';

export default function TestFoundation() {
  const { windows, openWindow, closeWindow } = useWindowContext();
  const { rootItems, desktopIcons, createFile } = useFileSystemContext();

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Foundation Test Page</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Window Manager Test</h2>
        <button
          className="bg-blue-500 px-4 py-2 rounded mr-2"
          onClick={() =>
            openWindow({
              title: 'Test Window',
              appType: 'notepad',
              position: { x: 100, y: 100 },
              size: { width: 400, height: 300 },
            })
          }
        >
          Open Test Window
        </button>
        <p className="mt-2">Open Windows: {windows.length}</p>
        <pre className="bg-gray-800 p-2 mt-2 text-xs overflow-auto">
          {JSON.stringify(windows, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">File System Test</h2>
        <button
          className="bg-green-500 px-4 py-2 rounded mr-2"
          onClick={() => createFile('/My Computer', 'test.txt', 'Hello World')}
        >
          Create Test File
        </button>
        <p className="mt-2">Desktop Icons: {desktopIcons.length}</p>
        <p>Root Items: {rootItems.length}</p>
        <pre className="bg-gray-800 p-2 mt-2 text-xs overflow-auto">
          {JSON.stringify(rootItems[0], null, 2)}
        </pre>
      </div>
    </div>
  );
}