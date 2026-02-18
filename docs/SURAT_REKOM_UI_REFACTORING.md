# Surat Rekomendasi UI Refactoring

## Overview
Refactored the Surat Rekomendasi (Letter of Recommendation) component to improve user experience by displaying template preview on page load with accurate F4/Folio paper size representation and moving the setup form to a modal dialog.

## Changes

### 1. Component Logic (`ukom-grade-surat-rekom.component.ts`)
- **Template Fetching**: Immediately fetch and display the template on component load
- **State Management**: 
  - `loading`: Indicates if the template is being loaded
  - `templateExists`: Indicates if a template is set up
  - `showModal`: Controls visibility of the setup modal
- **Methods**:
  - `fetchTemplate()`: Fetches the template from the server
  - `openModal()`: Opens the setup modal
  - `closeModal()`: Closes the setup modal
  - `saveTemplate()`: Saves the template and refreshes the view

### 2. Template Structure (`ukom-grade-surat-rekom.component.html`)

#### Three Main States:
1. **Loading State** - Shows spinner while fetching template
2. **No Template State** - Displays message "Template Belum Diatur" with button to open setup modal
3. **Template Display** - Shows HTML preview in F4/Folio paper size format with "Atur Template" button

#### F4/Folio Paper Preview:
- **Paper Size**: 215mm x 330mm (8.5" x 13") - Standard F4/Folio dimensions
- **Container Features**:
  - Max height: 80vh (viewport height) for optimal viewing
  - Smooth scrolling with custom scrollbar styling
  - Responsive max-height adjustments (70vh on tablets, 65vh on mobile)
  - Auto overflow with horizontal and vertical scrolling
  - Background highlight for paper distinction
- **Visual Design**:
  - White background simulating paper
  - Shadow effect for realistic paper appearance
  - 20mm padding (standard document margins)
  - Responsive scaling for different screen sizes
  - Maintains aspect ratio across devices
- **Responsive Behavior**:
  - Extra large screens (>1600px): 85% scale
  - Large screens (1400-1600px): 85% scale
  - Medium large (1200-1400px): 75% scale
  - Medium (992-1200px): 65% scale
  - Tablet (768-992px): 55% scale
  - Mobile (576-768px): 45% scale
  - Small mobile (400-576px): 35% scale
  - Extra small (<400px): 28% scale
- **Scrolling**:
  - Smooth scroll behavior
  - Custom styled scrollbar (10px width/height)
  - Hover effects on scrollbar
  - Responsive padding adjustments
- **Print Ready**: When printing, displays at actual F4/Folio size without transforms

### 3. Styling (`ukom-grade-surat-rekom.component.scss`)

#### Paper Preview Styling:
- F4/Folio dimensions with proper scaling
- Box shadow for paper effect
- Responsive transforms for different screen sizes
- Print-specific styles for accurate printing
- Negative margins to compensate for scaling
