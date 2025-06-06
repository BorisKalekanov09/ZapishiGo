import React, { useEffect, useState } from 'react';

export default function MindMapPage({ title, text }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const generateMindMap = async () => {
      const response = await fetch('/api/generate_mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `${title}\n${text}`
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
    };
    if (title && text) {
      generateMindMap();
    }
  }, [title, text]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Mind Map за: {title}</h2>
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Mind Map"
            style={{ maxWidth: '80%', border: '1px solid #ddd', marginTop: '20px' }}
          />
          <div style={{ marginTop: '10px' }}>
            <a href={imageUrl} download="mindmap.png" className="btn btn-primary">
              Изтегли изображението
            </a>
          </div>
        </>
      ) : (
        <p>Генериране...</p>
      )}
    </div>
  );
}
