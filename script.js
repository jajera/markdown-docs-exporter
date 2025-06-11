// Global variables
let converter;
let currentTheme = 'light';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Showdown converter with better options
    converter = new showdown.Converter({
        headerLevelStart: 1,
        simplifiedAutoLink: true,
        strikethrough: true,
        tables: true,
        tasklists: true,
        smoothLivePreview: true,
        parseImgDimensions: true,
        simpleLineBreaks: false,
        requireSpaceBeforeHeadingText: true,
        openLinksInNewWindow: true,
        backslashEscapesHTMLTags: true
    });

    // Set up event listeners
    setupEventListeners();

    // Initialize theme with system preference
    initializeTheme();

    // Render initial preview
    updatePreview();

    // Update word count
    updateWordCount();

    // Create modal for filename input
    createFilenameModal();
}

function setupEventListeners() {
    const markdownInput = document.getElementById('markdown-input');
    const themeToggle = document.getElementById('theme-toggle');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const downloadDocxBtn = document.getElementById('download-docx');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const tocBtn = document.getElementById('toc-btn');
    const statsBtn = document.getElementById('stats-btn');

    // Live preview update
    markdownInput.addEventListener('input', function() {
        updatePreview();
        updateWordCount();
        saveToLocalStorage();
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Clear button
    clearBtn.addEventListener('click', clearContent);

    // Copy button
    copyBtn.addEventListener('click', copyContent);

    // Export buttons
    downloadPdfBtn.addEventListener('click', () => exportToPDF());
    downloadDocxBtn.addEventListener('click', () => exportToDOCX());

    // Import button
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importFile);

    // New feature buttons
    tocBtn.addEventListener('click', generateTableOfContents);
    statsBtn.addEventListener('click', showDocumentStatistics);

    // Load saved content
    loadFromLocalStorage();
}

function updatePreview() {
    const markdownInput = document.getElementById('markdown-input');
    const previewContent = document.getElementById('preview-content');

    const markdownText = markdownInput.value;
    const htmlContent = converter.makeHtml(markdownText);

    previewContent.innerHTML = htmlContent;
}

function updateWordCount() {
    const markdownInput = document.getElementById('markdown-input');
    const wordCountElement = document.getElementById('word-count');

    const text = markdownInput.value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    wordCountElement.textContent = `${words} words, ${characters} chars (${charactersNoSpaces} no spaces)`;
}

function initializeTheme() {
    // Check system preference first, then saved preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    let defaultTheme;
    if (savedTheme) {
        defaultTheme = savedTheme;
    } else {
        defaultTheme = systemPrefersDark ? 'dark' : 'light';
    }

    setTheme(defaultTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);

    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }

    // Save theme preference
    localStorage.setItem('theme', theme);
}

function clearContent() {
    const markdownInput = document.getElementById('markdown-input');
    markdownInput.value = '';
    updatePreview();
    updateWordCount();
    saveToLocalStorage();

    // Show feedback
    showNotification('Content cleared!', 'success');
}

function copyContent() {
    const markdownInput = document.getElementById('markdown-input');

    // Select and copy the text
    markdownInput.select();
    markdownInput.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(markdownInput.value).then(function() {
        showNotification('Content copied to clipboard!', 'success');
    }).catch(function(err) {
        // Fallback for older browsers
        document.execCommand('copy');
        showNotification('Content copied to clipboard!', 'success');
    });
}

function createFilenameModal() {
    const modal = document.createElement('div');
    modal.id = 'filename-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-signature"></i> Save Document</h3>
                    <button class="modal-close" id="modal-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="filename-input">Enter filename (without extension):</label>
                    <input type="text" id="filename-input" class="filename-input" placeholder="document">
                    <div class="filename-preview">
                        <span>File will be saved as: </span>
                        <strong id="filename-preview-text">document.pdf</strong>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-cancel-btn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-primary" id="modal-save-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal event listeners
    const closeBtn = modal.querySelector('#modal-close-btn');
    const cancelBtn = modal.querySelector('#modal-cancel-btn');
    const saveBtn = modal.querySelector('#modal-save-btn');
    const input = modal.querySelector('#filename-input');
    const overlay = modal.querySelector('.modal-overlay');
    const previewText = modal.querySelector('#filename-preview-text');

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function updatePreview() {
        const filename = input.value.trim() || 'document';
        const extension = modal.dataset.extension || '.pdf';
        previewText.textContent = filename + extension;
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    input.addEventListener('input', updatePreview);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    saveBtn.addEventListener('click', () => {
        const filename = input.value.trim() || 'document';
        const extension = modal.dataset.extension || '.pdf';
        const callback = modal.dataset.callback;

        closeModal();

        if (callback === 'pdf') {
            exportToPDFWithFilename(filename + extension);
        } else if (callback === 'docx') {
            exportToDOCXWithFilename(filename + extension);
        }
    });
}

function showFilenameModal(extension, callback, defaultName = '') {
    const modal = document.getElementById('filename-modal');
    const input = modal.querySelector('#filename-input');
    const previewText = modal.querySelector('#filename-preview-text');

    // Set modal data
    modal.dataset.extension = extension;
    modal.dataset.callback = callback;

    // Set default filename from document title if not provided
    if (!defaultName) {
        defaultName = getDocumentTitle();
    }

    input.value = defaultName;
    previewText.textContent = defaultName + extension;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Focus input and select text
    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
}

function exportToPDF() {
    const defaultTitle = getDocumentTitle();
    showFilenameModal('.pdf', 'pdf', defaultTitle);
}

function exportToPDFWithFilename(filename) {
    const previewContent = document.getElementById('preview-content');

    // Show loading state
    showNotification('Generating PDF...', 'info');

    // Create a properly styled container for PDF
    const printContainer = document.createElement('div');
    printContainer.innerHTML = previewContent.innerHTML;

    // Apply PDF-specific styles
    printContainer.style.cssText = `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.6;
        color: #000;
        background: #fff;
        padding: 40px;
        max-width: none;
        margin: 0;
    `;

    // Style headings properly
    const headings = printContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        heading.style.cssText = `
            font-weight: ${level <= 2 ? '700' : '600'};
            margin-top: ${level === 1 ? '0' : '24px'};
            margin-bottom: ${level <= 2 ? '16px' : '12px'};
            color: #000;
            page-break-after: avoid;
            ${level === 1 ? 'font-size: 28px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;' : ''}
            ${level === 2 ? 'font-size: 22px; border-bottom: 1px solid #ccc; padding-bottom: 4px;' : ''}
            ${level === 3 ? 'font-size: 18px;' : ''}
            ${level === 4 ? 'font-size: 16px;' : ''}
            ${level >= 5 ? 'font-size: 14px;' : ''}
        `;
    });

    // Style paragraphs
    const paragraphs = printContainer.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.cssText = `
            margin-bottom: 12px;
            line-height: 1.6;
            text-align: justify;
        `;
    });

    // Style lists
    const lists = printContainer.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.cssText = `
            margin-bottom: 12px;
            margin-left: 20px;
        `;
    });

    const listItems = printContainer.querySelectorAll('li');
    listItems.forEach(li => {
        li.style.cssText = `
            margin-bottom: 4px;
            line-height: 1.5;
        `;
    });

    // Style code blocks
    const codeBlocks = printContainer.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        block.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 12px;
            margin: 12px 0;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 11px;
            overflow-wrap: break-word;
            white-space: pre-wrap;
        `;
    });

    // Style inline code
    const inlineCodes = printContainer.querySelectorAll('code');
    inlineCodes.forEach(code => {
        if (!code.parentElement.tagName.match(/PRE/i)) {
            code.style.cssText = `
                background: #f1f3f4;
                padding: 2px 4px;
                border-radius: 2px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 11px;
            `;
        }
    });

    // Style tables
    const tables = printContainer.querySelectorAll('table');
    tables.forEach(table => {
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 11px;
        `;

        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.cssText = `
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            `;
        });

        const headers = table.querySelectorAll('th');
        headers.forEach(th => {
            th.style.cssText += `
                background: #f8f9fa;
                font-weight: 600;
            `;
        });
    });

    // Style blockquotes
    const blockquotes = printContainer.querySelectorAll('blockquote');
    blockquotes.forEach(quote => {
        quote.style.cssText = `
            border-left: 4px solid #0066cc;
            margin: 12px 0;
            padding: 8px 16px;
            background: #f8f9fa;
            font-style: italic;
        `;
    });

    // Configure PDF options
    const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: false,
            backgroundColor: '#ffffff'
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate PDF
    html2pdf().set(opt).from(printContainer).save().then(function() {
        showNotification('PDF downloaded successfully!', 'success');
    }).catch(function(error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    });
}

function exportToDOCX() {
    const defaultTitle = getDocumentTitle();
    showFilenameModal('.docx', 'docx', defaultTitle);
}

function exportToDOCXWithFilename(filename) {
    const markdownInput = document.getElementById('markdown-input');
    const markdownText = markdownInput.value;

    showNotification('Generating DOCX...', 'info');

    try {
        // Convert markdown to HTML first
        const htmlContent = converter.makeHtml(markdownText);

        // Create a complete HTML document
        const completeHtml = createCompleteHTMLDocument(htmlContent);

        // Convert HTML to DOCX using html-docx-js
        const docxBlob = htmlDocx.asBlob(completeHtml, {
            orientation: 'portrait',
            margins: {
                top: 1440,    // 1 inch in twentieths of a point
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440    // 1 inch
            }
        });

        // Create download link
        const url = URL.createObjectURL(docxBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('DOCX file downloaded successfully!', 'success');

    } catch (error) {
        console.error('DOCX generation error:', error);
        showNotification('Error generating DOCX. Please try again.', 'error');
    }
}

function createCompleteHTMLDocument(htmlContent) {
    // Create a complete HTML document as required by html-docx-js
    const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getDocumentTitle()}</title>
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #000000;
        }

        h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #2F5496;
            margin-top: 24pt;
            margin-bottom: 12pt;
            page-break-after: avoid;
        }

        h2 {
            font-size: 18pt;
            font-weight: bold;
            color: #2F5496;
            margin-top: 18pt;
            margin-bottom: 6pt;
            page-break-after: avoid;
        }

        h3 {
            font-size: 16pt;
            font-weight: bold;
            color: #1F3763;
            margin-top: 16pt;
            margin-bottom: 4pt;
            page-break-after: avoid;
        }

        h4, h5, h6 {
            font-size: 14pt;
            font-weight: bold;
            color: #1F3763;
            margin-top: 14pt;
            margin-bottom: 4pt;
            page-break-after: avoid;
        }

        p {
            margin-top: 0;
            margin-bottom: 12pt;
            text-align: justify;
        }

        ul, ol {
            margin-top: 0;
            margin-bottom: 12pt;
            padding-left: 24pt;
        }

        li {
            margin-bottom: 6pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12pt;
            margin-bottom: 12pt;
        }

        th, td {
            border: 1pt solid #000000;
            padding: 6pt;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #F2F2F2;
            font-weight: bold;
        }

        code {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 10pt;
            background-color: #F8F9FA;
            padding: 2pt 4pt;
            border: 1pt solid #E9ECEF;
        }

        pre {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 10pt;
            background-color: #F8F9FA;
            border: 1pt solid #E9ECEF;
            padding: 12pt;
            margin-top: 12pt;
            margin-bottom: 12pt;
            white-space: pre-wrap;
            overflow-wrap: break-word;
        }

        pre code {
            background-color: transparent;
            border: none;
            padding: 0;
        }

        blockquote {
            margin-left: 24pt;
            margin-right: 0;
            margin-top: 12pt;
            margin-bottom: 12pt;
            padding-left: 12pt;
            border-left: 3pt solid #2F5496;
            font-style: italic;
            background-color: #F8F9FA;
            padding-top: 6pt;
            padding-bottom: 6pt;
        }

        a {
            color: #0563C1;
            text-decoration: underline;
        }

        strong, b {
            font-weight: bold;
        }

        em, i {
            font-style: italic;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        hr {
            border: none;
            border-top: 1pt solid #CCCCCC;
            margin-top: 24pt;
            margin-bottom: 24pt;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    return completeHtml;
}

function importFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) return;

    // Check if file is .md
    if (!file.name.toLowerCase().endsWith('.md')) {
        showNotification('Please select a .md (Markdown) file.', 'error');
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const markdownInput = document.getElementById('markdown-input');
        markdownInput.value = content;
        updatePreview();
        updateWordCount();
        saveToLocalStorage();
        showNotification(`File "${file.name}" imported successfully!`, 'success');
    };

    reader.onerror = function() {
        showNotification('Error reading file. Please try again.', 'error');
    };

    reader.readAsText(file);
    fileInput.value = ''; // Clear the input
}

function getDocumentTitle() {
    const markdownInput = document.getElementById('markdown-input');
    const content = markdownInput.value;

    // Try to extract title from first h1
    const lines = content.split('\n');
    for (let line of lines) {
        if (line.startsWith('# ')) {
            return line.substring(2).trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'document';
        }
    }

    return 'document';
}

function saveToLocalStorage() {
    const markdownInput = document.getElementById('markdown-input');
    localStorage.setItem('markdownContent', markdownInput.value);
}

function loadFromLocalStorage() {
    const markdownInput = document.getElementById('markdown-input');
    const savedContent = localStorage.getItem('markdownContent');

    if (savedContent && savedContent.trim() !== '') {
        markdownInput.value = savedContent;
        updatePreview();
        updateWordCount();
    }
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        transform: translateX(100%);
        max-width: 300px;
    `;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#0066cc';
            break;
    }

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save (prevent default and show notification)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
        showNotification('Content saved locally!', 'success');
    }

    // Ctrl/Cmd + / to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleTheme();
    }

    // Ctrl/Cmd + O to import file
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.getElementById('file-input').click();
    }

    // Ctrl/Cmd + E to export PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportToPDF();
    }

    // Ctrl/Cmd + T to generate Table of Contents
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        generateTableOfContents();
    }

    // Ctrl/Cmd + I to show document statistics
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        showDocumentStatistics();
    }

    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('filename-modal');
        if (modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Close stats modal if open
        const statsModal = document.querySelector('.modal-overlay');
        if (statsModal) {
            statsModal.remove();
            document.body.style.overflow = '';
        }
    }
});

// Auto-save every 30 seconds
setInterval(saveToLocalStorage, 30000);

// New Features

function generateTableOfContents() {
    const markdownInput = document.getElementById('markdown-input');
    const content = markdownInput.value;
    const lines = content.split('\n');

    const toc = [];
    let tocMarkdown = '\n## Table of Contents\n\n';

    for (let line of lines) {
        if (line.match(/^#{1,6}\s+/)) {
            const level = line.match(/^#+/)[0].length;
            const text = line.substring(level).trim();
            const anchor = text.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            const indent = '  '.repeat(level - 1);
            tocMarkdown += `${indent}- [${text}](#${anchor})\n`;
        }
    }

    if (toc.length === 0) {
        tocMarkdown = '\n## Table of Contents\n\n*No headings found in document*\n';
    }

    // Insert TOC after the first heading or at the beginning
    const firstHeading = lines.findIndex(line => line.match(/^#\s+/));
    const insertPosition = firstHeading >= 0 ? firstHeading + 1 : 0;

    const beforeToc = lines.slice(0, insertPosition);
    const afterToc = lines.slice(insertPosition);

    // Remove existing TOC if present
    const existingTocStart = afterToc.findIndex(line => line.trim() === '## Table of Contents');
    if (existingTocStart >= 0) {
        let existingTocEnd = existingTocStart + 1;
        while (existingTocEnd < afterToc.length &&
               (!afterToc[existingTocEnd].match(/^#{1,6}\s+/) || afterToc[existingTocEnd].startsWith('##'))) {
            if (afterToc[existingTocEnd].match(/^#{1,2}\s+/) && !afterToc[existingTocEnd].startsWith('## Table of Contents')) {
                break;
            }
            existingTocEnd++;
        }
        afterToc.splice(existingTocStart, existingTocEnd - existingTocStart);
    }

    const newContent = [...beforeToc, ...tocMarkdown.split('\n'), ...afterToc].join('\n');

    markdownInput.value = newContent;
    updatePreview();
    updateWordCount();
    saveToLocalStorage();

    showNotification('Table of contents generated!', 'success');
}

function showDocumentStatistics() {
    const markdownInput = document.getElementById('markdown-input');
    const content = markdownInput.value;
    const lines = content.split('\n');

    // Calculate statistics
    const stats = {
        lines: lines.length,
        nonEmptyLines: lines.filter(line => line.trim() !== '').length,
        words: content.trim() === '' ? 0 : content.trim().split(/\s+/).length,
        characters: content.length,
        charactersNoSpaces: content.replace(/\s/g, '').length,
        paragraphs: content.split(/\n\s*\n/).filter(p => p.trim() !== '').length,
        headings: {
            h1: (content.match(/^# /gm) || []).length,
            h2: (content.match(/^## /gm) || []).length,
            h3: (content.match(/^### /gm) || []).length,
            h4: (content.match(/^#### /gm) || []).length,
            h5: (content.match(/^##### /gm) || []).length,
            h6: (content.match(/^###### /gm) || []).length
        },
        lists: (content.match(/^[\s]*[-*+]\s/gm) || []).length,
        numberedLists: (content.match(/^[\s]*\d+\.\s/gm) || []).length,
        links: (content.match(/\[.*?\]\(.*?\)/g) || []).length,
        images: (content.match(/!\[.*?\]\(.*?\)/g) || []).length,
        codeBlocks: (content.match(/```[\s\S]*?```/g) || []).length,
        inlineCode: (content.match(/`[^`]+`/g) || []).length,
        tables: (content.match(/\|.*\|/g) || []).length / Math.max(1, (content.match(/\|.*\|/g) || []).length > 0 ? 3 : 1),
        blockquotes: (content.match(/^>/gm) || []).length
    };

    const totalHeadings = Object.values(stats.headings).reduce((a, b) => a + b, 0);
    const readingTime = Math.ceil(stats.words / 200); // Average reading speed: 200 words per minute

    // Create statistics modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-chart-bar"></i> Document Statistics</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-group">
                        <h4>📝 Content</h4>
                        <div class="stat-item">
                            <span class="stat-label">Words:</span>
                            <span class="stat-value">${stats.words.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Characters:</span>
                            <span class="stat-value">${stats.characters.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Characters (no spaces):</span>
                            <span class="stat-value">${stats.charactersNoSpaces.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Lines:</span>
                            <span class="stat-value">${stats.lines.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Non-empty lines:</span>
                            <span class="stat-value">${stats.nonEmptyLines.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Paragraphs:</span>
                            <span class="stat-value">${stats.paragraphs.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Estimated reading time:</span>
                            <span class="stat-value">${readingTime} min</span>
                        </div>
                    </div>

                    <div class="stat-group">
                        <h4>📋 Structure</h4>
                        <div class="stat-item">
                            <span class="stat-label">Total headings:</span>
                            <span class="stat-value">${totalHeadings}</span>
                        </div>
                        ${stats.headings.h1 > 0 ? `<div class="stat-item"><span class="stat-label">H1:</span><span class="stat-value">${stats.headings.h1}</span></div>` : ''}
                        ${stats.headings.h2 > 0 ? `<div class="stat-item"><span class="stat-label">H2:</span><span class="stat-value">${stats.headings.h2}</span></div>` : ''}
                        ${stats.headings.h3 > 0 ? `<div class="stat-item"><span class="stat-label">H3:</span><span class="stat-value">${stats.headings.h3}</span></div>` : ''}
                        ${stats.headings.h4 > 0 ? `<div class="stat-item"><span class="stat-label">H4:</span><span class="stat-value">${stats.headings.h4}</span></div>` : ''}
                        ${stats.headings.h5 > 0 ? `<div class="stat-item"><span class="stat-label">H5:</span><span class="stat-value">${stats.headings.h5}</span></div>` : ''}
                        ${stats.headings.h6 > 0 ? `<div class="stat-item"><span class="stat-label">H6:</span><span class="stat-value">${stats.headings.h6}</span></div>` : ''}
                        <div class="stat-item">
                            <span class="stat-label">Bullet lists:</span>
                            <span class="stat-value">${stats.lists}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Numbered lists:</span>
                            <span class="stat-value">${stats.numberedLists}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tables:</span>
                            <span class="stat-value">${Math.floor(stats.tables)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Blockquotes:</span>
                            <span class="stat-value">${stats.blockquotes}</span>
                        </div>
                    </div>

                    <div class="stat-group">
                        <h4>🔗 Elements</h4>
                        <div class="stat-item">
                            <span class="stat-label">Links:</span>
                            <span class="stat-value">${stats.links}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Images:</span>
                            <span class="stat-value">${stats.images}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Code blocks:</span>
                            <span class="stat-value">${stats.codeBlocks}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Inline code:</span>
                            <span class="stat-value">${stats.inlineCode}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary modal-close">
                    <i class="fas fa-check"></i> Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}
