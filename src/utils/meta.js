export const buildMeta = ({ title, description }) => ({
  title,
  description,
  openGraph: {
    title,
    description,
  },
})
