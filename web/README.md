# Homes Ivry

Real estate visualization application for Ivry-sur-Seine.

## Data Management

The application uses property transaction data from `ValeursFoncieres-2024.txt`. This file is stored locally but not tracked in Git due to its size (440MB).

### Data File Location

- Development: `web/src/data/ValeursFoncieres-2024.txt`
- This file is excluded from Git via `.gitignore`
- Keep this file as a backup for reprocessing or troubleshooting data issues

### Data Pipeline

1. Raw data is stored in `ValeursFoncieres-2024.txt`
2. Data is processed and imported into Supabase using the import script
3. Properties are geocoded using the geocoding script
4. Current database state: 344 unique properties with 476 transactions

### Running Data Import

If you need to reimport or reprocess the data:

1. Ensure `ValeursFoncieres-2024.txt` is in `web/src/data/`
2. Run the import script: `npm run import-data`
3. Run the geocoding script: `npm run geocode-properties`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
