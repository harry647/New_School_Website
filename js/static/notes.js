// ==================================================
// NOTES PAGE – INTERACTIVE FEATURES
// Bar Union Mixed Secondary School 2025-2026
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. FORM FILTER FUNCTIONALITY
    // ========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noteCards = document.querySelectorAll('.note-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const selectedForm = button.getAttribute('data-form');

            // Filter notes
            noteCards.forEach(card => {
                if (selectedForm === 'all' || card.getAttribute('data-form') === selectedForm) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ========================================
    // 2. PREVIEW MODAL FUNCTIONALITY
    // ========================================
    const modal = document.getElementById('previewModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const closeModal = document.querySelector('.close-modal');
    const previewButtons = document.querySelectorAll('.btn-preview');

    previewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const fileName = button.getAttribute('data-file');
            // For demo purposes, using a placeholder PDF viewer
            // In production, integrate with PDF.js or similar
            pdfViewer.src = `/downloads/notes/${fileName}`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        pdfViewer.src = '';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            pdfViewer.src = '';
        }
    });

    // ========================================
    // 3. UPLOAD FORM HANDLING
    // ========================================
    const uploadForm = document.getElementById('uploadForm');

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        const subject = document.getElementById('subject').value;
        const form = document.getElementById('form').value;
        const topic = document.getElementById('topic').value;
        const file = document.getElementById('file').files[0];

        if (!subject || !form || !topic || !file) {
            alert('Please fill in all required fields.');
            return;
        }

        // Check file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return;
        }

        // In a real application, this would send the data to the server
        // For now, show success message
        alert('Notes uploaded successfully! They will be reviewed by administrators before being published.');

        // Reset form
        uploadForm.reset();
    });

    // ========================================
    // 4. ANIMATIONS AND EFFECTS
    // ========================================
    // Add fadeIn animation and styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
        }

        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 0;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            position: relative;
        }

        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #ddd;
        }

        .modal-body {
            padding: 20px;
        }

        .close-modal {
            position: absolute;
            top: 10px;
            right: 20px;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            color: #aaa;
        }

        .close-modal:hover {
            color: #000;
        }

        .upload-form-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--dark);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
        }

        .filter-tabs {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
            margin: 2rem 0;
        }

        .filter-btn {
            padding: 0.5rem 1rem;
            background: white;
            border: 2px solid var(--gray);
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .filter-btn.active,
        .filter-btn:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .note-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }

        .note-card:hover {
            transform: translateY(-5px);
        }

        .note-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .note-icon {
            font-size: 2rem;
            color: var(--primary);
        }

        .form-badge {
            background: var(--primary);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .note-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .btn-preview,
        .btn-download {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-preview {
            background: #f59e0b;
            color: white;
        }

        .btn-preview:hover {
            background: #d97706;
        }

        .btn-download {
            background: var(--primary);
            color: white;
        }

        .btn-download:hover {
            background: var(--primary-dark);
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // CONSOLE LOG
    // ========================================
    console.log("📚 Notes Page – Interactive Features Loaded");
});