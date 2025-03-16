# Smart CCTV Notification System

A React-based client application for a Smart CCTV notification system that provides real-time alerts for fire and fall incidents.

## Features

- Real-time notifications for fire and fall incidents
- Desktop notifications with sound alerts
- Visual notification badge with animation
- Detailed incident information in modal view
- Historical notification tracking
- Responsive design for mobile and desktop
- Sound toggle functionality
- Severity-based color coding
- Confidence score display

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with notification support

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd royal-mini-project-client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add the API base URL:
```
REACT_APP_API_BASE_URL=http://localhost:5002
```

4. Add sound files to the public directory:
- `public/sounds/fire_alert.wav`
- `public/sounds/fall_alert.wav`

5. Add icon files to the public directory:
- `public/icons/fire-icon.png`
- `public/icons/fall-icon.png`

## Development

Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## API Integration

The application integrates with the following API endpoints:

- `GET /api/notifications/pending` - Fetch unacknowledged notifications
- `POST /api/notifications/<notification_id>/acknowledge` - Acknowledge a notification
- `GET /api/notifications/history` - Get notification history with optional filters
- `GET /api/incidents` - Get list of incidents
- `GET /api/incidents/<incident_uuid>` - Get detailed incident information

## Project Structure

```
src/
├── components/
│   ├── NotificationBadge.tsx
│   ├── NotificationList.tsx
│   ├── NotificationModal.tsx
│   └── NotificationSystem.tsx
├── contexts/
│   └── NotificationContext.tsx
├── services/
│   └── api.ts
└── App.tsx
```

## Technologies Used

- React
- TypeScript
- Material-UI
- Axios
- React Router
- HTML5 Audio API
- Web Notifications API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
