# Personal Finance Dashboard

A modern, secure, and user-friendly personal finance management application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure authentication with NextAuth.js
- 💰 Track income and expenses
- 📊 Interactive financial dashboards
- 📈 Visualize spending patterns
- 🔄 Real-time data updates
- 📱 Responsive design for all devices

## Tech Stack

- **Framework:** Next.js 15.3.0
- **Language:** TypeScript
- **Authentication:** NextAuth.js
- **Database:** Prisma
- **Styling:** Tailwind CSS
- **Form Validation:** Zod
- **Deployment:** Vercel (recommended)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (or your preferred database)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your_database_url"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
personal-finance-dashboard/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and configurations
├── prisma/          # Database schema and migrations
├── public/          # Static assets
└── styles/          # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.
