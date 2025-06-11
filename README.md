# 📄 Markdown Documents Exporter

A beautiful, fully client-side markdown document editor that allows you to write, preview, and export your documents in real-time. No server required - works perfectly on GitHub Pages!

## ✨ Features

- **📝 Live Markdown Editor**: Write markdown in a comfortable textarea with syntax highlighting
- **👀 Real-time Preview**: See your formatted document instantly as you type
- **🌓 Dark/Light Theme**: Toggle between themes for comfortable editing
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **💾 Auto-save**: Your content is automatically saved to local storage
- **📄 PDF Export**: Download your document as a professionally formatted PDF
- **📝 Text Export**: Export as plain text (DOCX alternative)
- **📋 Copy & Clear**: Quick actions to manage your content
- **⌨️ Keyboard Shortcuts**: Productivity shortcuts for power users
- **🚀 Zero Dependencies**: Pure client-side app, no server needed

## 🚀 Quick Start

1. **Clone or Download**:

   ```bash
   git clone https://github.com/jajera/markdown-docs-exporter.git
   cd markdown-docs-exporter
   ```

2. **Open in Browser**:
   Simply open `index.html` in any modern web browser.

3. **Start Writing**:
   The editor comes with sample content. Replace it with your own markdown!

## 📁 Project Structure

```plaintext
/
├── index.html              # Main HTML structure
├── style.css              # Complete UI styling with themes
├── script.js              # Core JavaScript functionality
├── libs/                  # External libraries
│   ├── showdown.min.js    # Markdown → HTML converter
│   ├── html2pdf.bundle.min.js # PDF export functionality
│   └── docx.bundle.js     # DOCX export (fallback to text)
├── README.md             # This documentation
└── LICENSE               # MIT License
```

## 🎯 Usage Guide

### Writing Documents

The editor uses standard Markdown syntax:

```markdown
# Document Title

## Introduction
This is where you write your content...

## Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- `inline code` and code blocks
- Lists and tables

## Code Example
```javascript
function hello() {
    console.log('Hello, World!');
}
```

## Table Example

| Feature | Description | Status |
|---------|-------------|--------|
| Export PDF | Generate PDF documents | ✅ |
| Live Preview | Real-time rendering | ✅ |

```plaintext

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save content locally
- `Ctrl/Cmd + /`: Toggle dark/light theme

### Export Options

- **PDF Export**: Creates a professional PDF formatted for printing
- **Text Export**: Downloads as plain text file (cross-platform compatible)

## 🎨 Customization

### Themes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for long editing sessions
- Themes are automatically saved and restored

### Styling
Modify `style.css` to customize:
- Colors and typography
- Layout proportions
- Print/PDF formatting
- Document styling

## 🌐 Deployment

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your editor will be live at `https://yourusername.github.io/repository-name`

### Other Static Hosts
Works on any static hosting service:
- Netlify
- Vercel
- Surge.sh
- Firebase Hosting

## 🔧 Technical Details

### Dependencies
- **Showdown.js**: Converts Markdown to HTML
- **html2pdf.js**: Generates PDF from HTML content
- **Font Awesome**: Icons for the interface
- **Google Fonts (Inter)**: Professional typography

### Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with modern JavaScript support

### Features Implementation
- **Live Preview**: Real-time markdown parsing with Showdown.js
- **Theme System**: CSS custom properties with localStorage persistence
- **Auto-save**: Periodic saves to browser's localStorage
- **PDF Generation**: Client-side PDF creation optimized for documents
- **Responsive Layout**: CSS Flexbox with mobile-first design

## 📝 Use Cases

Perfect for creating:
- **Documentation**: Technical docs, user manuals, guides
- **Reports**: Project reports, research papers, proposals
- **Articles**: Blog posts, tutorials, knowledge base articles
- **Notes**: Meeting notes, study materials, personal notes
- **Presentations**: Simple slide-style documents
- **Books**: Chapters, ebooks, documentation books

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

If you encounter any issues:
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try refreshing or clearing browser cache
4. Open an issue on GitHub

---

**Happy document writing!** 🎉
