import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import axios from 'axios';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

const PdfTextExtractor = () => {
  const [pdfTexts, setPdfTexts] = useState({ text: '', text1: '' });
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event, key) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = new Uint8Array(e.target.result);
      const pdf = await getDocument(pdfData).promise;
      const extractedText = await extractTextFromPdf(pdf);
      setPdfTexts((prev) => ({ ...prev, [key]: extractedText }));
    };
    reader.readAsArrayBuffer(file);
  };
  
  const extractTextFromPdf = async (pdf) => {
    let extractedText = '';
    const pagePromises = Array.from({ length: pdf.numPages }, (_, i) =>
      pdf.getPage(i + 1).then((page) =>
        page.getTextContent().then((textContent) => {
          textContent.items.forEach((item) => {
            extractedText += item.str + ' ';
          });
        })
      )
    );
    await Promise.all(pagePromises);
    return extractedText;
  };

  const onSubmit = async () => {
    setLoading(true);
    setResponseMessage('');
    try {
      const response = await axios.post('http://localhost:8000/generate', pdfTexts);
      setResponseMessage(response.data.data);
    } catch (err) {
      console.error("Error:", err);
      setResponseMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //Styling  
  const styles = {
    container: {
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
    },
    label: {
      fontSize: '16px',
      marginBottom: '10px',
    },
    input: {
      backgroundColor: '#1e1e1e',
      color: '#ffffff',
      border: '1px solid #333',
      borderRadius: '5px',
      padding: '10px',
      marginBottom: '20px',
    },
    button: {
      backgroundColor: loading ? '#444' : '#007BFF',
      color: '#ffffff',
      border: 'none',
      borderRadius: '5px',
      padding: '10px 20px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s',
    },
    response: {
      backgroundColor: '#1e1e1e',
      color: '#ffffff',
      border: '1px solid #333',
      borderRadius: '5px',
      padding: '10px',
      marginTop: '20px',
      maxWidth: '800px',
      whiteSpace: 'pre-wrap',
    },
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Standard Document Format</label>
      <input
        type="file"
        onChange={(e) => handleFileChange(e, 'text')}
        style={styles.input}
      />
      <label style={styles.label}>Your Document Format</label>
      <input
        type="file"
        onChange={(e) => handleFileChange(e, 'text1')}
        style={styles.input}
      />
      <button onClick={onSubmit} disabled={loading} style={styles.button}>
        {loading ? 'Loading...' : 'Click to Compare'}
      </button>
      {responseMessage && (
        <div style={styles.response}>
          {loading ? 'Processing your request...' : responseMessage}
        </div>
      )}
    </div>
  );
};

export default PdfTextExtractor;
