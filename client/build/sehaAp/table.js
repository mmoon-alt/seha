document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});

function makeEditable(event) {
    try {
        const element = event.target;
        element.setAttribute('contenteditable', 'true');
        element.focus();
        element.addEventListener('blur', () => {
            element.removeAttribute('contenteditable');
            console.log(`Element ${element} edited successfully.`);
        });
    } catch (error) {
        console.error(`Error in makeEditable: ${error.message}`);
    }
}

function showReplaceButton(event, image) {
    try {
        event.stopPropagation();
        const replaceButton = document.getElementById(image + '-replace-btn');
        if (replaceButton) {
            replaceButton.style.display = 'block';
            console.log(`Replace button for ${image} shown.`);
        } else {
            console.error(`Replace button not found for ${image}`);
        }
    } catch (error) {
        console.error(`Error in showReplaceButton: ${error.message}`);
    }
}

function replaceImage(event, imageId) {
    try {
        const imageElement = document.getElementById(imageId);
        imageElement.src = URL.createObjectURL(event.target.files[0]);
        document.getElementById(imageId + '-replace-btn').style.display = 'none';
        console.log(`Image ${imageId} replaced successfully.`);
    } catch (error) {
        console.error(`Error in replaceImage: ${error.message}`);
    }
}

function hideReplaceButtons(event) {
    try {
        if (event.target.tagName !== 'IMG' && !event.target.classList.contains('replace-button')) {
            document.querySelectorAll('.replace-button').forEach(button => {
                button.style.display = 'none';
                console.log(`Replace button hidden.`);
            });
        }
    } catch (error) {
        console.error(`Error in hideReplaceButtons: ${error.message}`);
    }
}

function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const reportContainer = document.getElementById('report-container').innerHTML;

        doc.fromHTML(reportContainer, 10, 10, {
            width: 180
        });

        doc.save('report.pdf');
        console.log('PDF generated and saved successfully.');
    } catch (error) {
        console.error(`Error in generatePDF with jsPDF: ${error.message}`);

        // محاولة استخدام pdfkit في حالة فشل jsPDF
        try {
            const PDFDocument = require('pdfkit');
            const blobStream = require('blob-stream');

            const doc = new PDFDocument();
            const stream = blobStream();

            doc.pipe(stream);

            // كتابة محتوى التقرير في PDFDocument
            doc.text(document.getElementById('report-container').innerText, {
                align: 'justify'
            });

            doc.end();

            stream.on('finish', () => {
                const blob = stream.toBlob('application/pdf');
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'report.pdf';
                link.click();
                console.log('PDF generated and saved successfully with pdfkit.');
            });

        } catch (pdfkitError) {
            console.error(`Error in generatePDF with pdfkit: ${pdfkitError.message}`);
        }
    }
}

// Event listeners for making elements editable on double click
const reportContainer = document.getElementById('report-container');
if (reportContainer) {
    reportContainer.addEventListener('dblclick', function(event) {
        makeEditable(event);
    });

    reportContainer.addEventListener('mousedown', function(event) {
        hideReplaceButtons(event);
    });
}

// Event listener for showing/hiding replace buttons on mouseover/mouseout events
const images = document.querySelectorAll('#report-container img');
images.forEach(function(image) {
    image.addEventListener('mouseover', function(event) {
        showReplaceButton(event, this.id);
    });

    image.addEventListener('mouseout', function(event) {
        hideReplaceButtons(event);
    });
});
=======
/**
 * Medical Report Editor
 * Handles editing, image replacement, and PDF generation for medical reports
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    console.log('Medical Report Editor initialized');
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    const reportContainer = document.getElementById('report-container');
    const generatePdfButton = document.getElementById('generate-pdf-button');
    
    if (reportContainer) {
        // Double-click to edit
        reportContainer.addEventListener('dblclick', makeEditable);
        // Hide replace buttons on mousedown
        reportContainer.addEventListener('mousedown', hideReplaceButtons);
        
        // Setup image-related events
        setupImageEvents();
    }

    if (generatePdfButton) {
        generatePdfButton.addEventListener('click', generatePDF);
    }
}

/**
 * Setup events for all images in the report
 */
function setupImageEvents() {
    const images = document.querySelectorAll('#report-container img');
    images.forEach(image => {
        image.addEventListener('mouseover', (event) => {
            showReplaceButton(event, image.id);
        });

        image.addEventListener('mouseout', hideReplaceButtons);
    });
}

/**
 * Make an element editable on double-click
 * @param {Event} event - The double-click event
 */
function makeEditable(event) {
    try {
        const element = event.target;
        if (!element.classList.contains('non-editable')) {
            element.setAttribute('contenteditable', 'true');
            element.focus();
            
            const onBlur = () => {
                element.removeAttribute('contenteditable');
                element.removeEventListener('blur', onBlur);
                console.log('Content edited successfully');
            };
            
            element.addEventListener('blur', onBlur);
        }
    } catch (error) {
        console.error('Error making element editable:', error);
    }
}

/**
 * Show the replace button for an image
 * @param {Event} event - The mouseover event
 * @param {string} imageId - The ID of the image
 */
function showReplaceButton(event, imageId) {
    try {
        event.stopPropagation();
        const replaceButton = document.getElementById(`${imageId}-replace-btn`);
        if (replaceButton) {
            replaceButton.style.display = 'block';
        }
    } catch (error) {
        console.error('Error showing replace button:', error);
    }
}

/**
 * Replace an image with a new one
 * @param {Event} event - The change event from file input
 * @param {string} imageId - The ID of the image to replace
 */
function replaceImage(event, imageId) {
    try {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const imageElement = document.getElementById(imageId);
            const url = URL.createObjectURL(file);
            
            imageElement.src = url;
            document.getElementById(`${imageId}-replace-btn`).style.display = 'none';
            
            // Clean up the object URL after the image loads
            imageElement.onload = () => URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error replacing image:', error);
    }
}

/**
 * Hide all replace buttons
 * @param {Event} event - The mouseout event
 */
function hideReplaceButtons(event) {
    try {
        if (event.target.tagName !== 'IMG' && !event.target.classList.contains('replace-button')) {
            document.querySelectorAll('.replace-button').forEach(button => {
                button.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Error hiding replace buttons:', error);
    }
}

/**
 * Generate a PDF from the report content
 */
async function generatePDF() {
    try {
        const reportElement = document.getElementById('report-container');
        
        // First try using html2canvas
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('medical-report.pdf');
        
        console.log('PDF generated successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
}