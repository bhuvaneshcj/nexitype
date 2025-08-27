# NexiType - Typing Practice Application

A modern, responsive typing practice application built with Angular and TailwindCSS. Improve your typing speed and accuracy with various test modes, achievements, and progress tracking.

## Features

### 🎯 Core Functionality
- **Typing Tests**: Practice with random texts or custom content
- **Multiple Durations**: 15s, 30s, 1min, 2min test options
- **Real-time Feedback**: Visual indicators for correct/incorrect typing
- **Progress Tracking**: WPM, accuracy, and error counting
- **Daily Challenges**: Unique daily typing challenges

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Beautiful transitions and hover effects
- **Modern UI**: Clean, intuitive interface with TailwindCSS styling

### 🏆 Gamification
- **Achievements**: Unlock badges for milestones (30 WPM, 50 WPM, etc.)
- **Personal Bests**: Track your best performance for each duration
- **Daily Streaks**: Maintain consistency with streak tracking
- **Progress Visualization**: See your improvement over time

### 💾 Data Management
- **Local Storage**: All data stored locally in your browser
- **No Backend Required**: Fully client-side application
- **Privacy Focused**: Your data never leaves your device

## Technology Stack

- **Frontend Framework**: Angular 20
- **Styling**: TailwindCSS 3.4
- **Language**: TypeScript
- **Build Tool**: Angular CLI
- **Code Formatting**: Prettier with TailwindCSS plugin

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nexitype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── home/              # Home page component
│   │   ├── typing-test/       # Typing test component
│   │   └── results/           # Results display component
│   ├── models/                # TypeScript interfaces and models
│   ├── services/              # Business logic services
│   └── app.*                  # Main app files
├── styles.css                 # Global styles with TailwindCSS
└── main.ts                    # Application entry point
```

## Key Components

### Home Component
- Test duration selection
- Custom text input option
- Daily challenge display
- Personal bests overview
- Achievement showcase

### Typing Test Component
- Real-time text display with highlighting
- Progress tracking and timer
- Error detection and visual feedback
- Keyboard event handling

### Results Component
- Detailed performance metrics
- Personal best comparisons
- Achievement unlocks
- Restart and navigation options

## Customization

### Adding New Text Samples
Edit `src/app/models/typing-test.model.ts` to add new text samples to the `SAMPLE_TEXTS` array.

### Modifying Achievements
Update the `ACHIEVEMENTS` array in the same file to add or modify achievement criteria.

### Styling Changes
The application uses TailwindCSS for styling. Modify `src/styles.css` for global styles or component-specific CSS files for local styles.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run format` to format code
5. Test your changes
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with Angular and TailwindCSS
- Icons and emojis for visual elements
- Roboto Slab font for typography

---

Built with ❤️ by Bhuvanesh
