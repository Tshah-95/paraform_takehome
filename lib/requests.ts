// force request for jobs to be cached for 24 hours in Data Cache before revalidating
export const fetcher = (url: string) =>
  fetch(url, { next: { revalidate: 86400 }, cache: "force-cache" }).then(
    (res) => res.json()
  );
