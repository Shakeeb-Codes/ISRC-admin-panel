import './globals.css'

export const metadata = {
  title: 'ISRC Sri Lanka - Admin Panel',
  description: 'Admin panel for ISRC Sri Lanka',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}