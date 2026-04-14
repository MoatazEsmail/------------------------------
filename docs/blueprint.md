# **App Name**: انتاجية قسم التحويلات والمداخن

## Core Features:

- User Authentication & Authorization: Implement a secure login system for technicians and a general supervisor ('معتز اسماعيل'). Technicians can view all productivity data but are restricted to editing only their own daily entries. The supervisor has comprehensive access and management capabilities across all data.
- Daily Productivity Entry & Modification: Provide a user-friendly interface for individual technicians to accurately record and modify their daily productivity. Entries include categories such as 'تحويل بوتجاز', 'تحويل سخان', 'استبدال اجهزة منزلى', 'استبدال اجهزة تجارى', and 'تحويل اجهزة تجارى'.
- AI Productivity Calculation Tool & Insights: An AI tool that interprets raw daily inputs from technicians and applies the specific conversion rules (e.g., '3 household devices = 1 chimney', '1 commercial device = 1.5 household devices') to calculate normalized productivity scores. It will also provide insights into a technician's performance against their monthly targets.
- Technician Monthly Performance Overview: Display a distinct 'card' for each technician. Clicking on a card presents their detailed productivity for a user-selected month, showcasing their actual output and comparing it directly against their designated monthly targets (e.g., 125 chimneys for chimney technicians, 220 devices for conversion technicians).
- Dynamic Performance Ranking & Status Visualization: Automatically rank technicians based on their productivity from highest to lowest. Visual cues (green for goal achievement, red for falling short) will clearly indicate each technician's status relative to their monthly target.
- Supervisor Dashboard Summary: A dedicated dashboard for the general supervisor ('معتز اسماعيل') that offers a concise and rapid overview of team productivity, individual technician progress, and overall departmental performance.
- Productivity Report Export: Enable the generation and export of detailed productivity reports and summaries directly into an Excel file format for comprehensive record-keeping and external analysis.

## Style Guidelines:

- Primary color: A professional and stable muted blue-grey (#45677B), suitable for navigation and key interface elements.
- Background color: A very light and clean desaturated blue-grey (#ECF2F5), ensuring high readability for data and text.
- Accent color: A brighter cyan-green (#4DC0C0) used sparingly for interactive components like buttons and highlights, providing clear calls to action.
- Status colors: Vivid green (#319531) to denote successful goal achievement and a striking red (#CC2929) to highlight when targets are not met, offering instant visual feedback.
- Headline and body font: 'Inter' (sans-serif) chosen for its excellent legibility across all screen sizes and its modern, neutral aesthetic, ideal for data-driven applications.
- Utilize a consistent set of clean, minimalist line icons to represent various productivity items, user actions, and navigation points. Prominently use checkmark and cross icons for performance status indicators.
- Implement a responsive, modular layout featuring distinct 'cards' for technician overviews, a widget-based supervisor dashboard, and structured forms for daily productivity input. Ensure clear visual hierarchy and easy navigation.
- Incorporate subtle and quick animations for user feedback, such as on button presses, data loading, or expanding sections, enhancing the user experience without introducing delays.