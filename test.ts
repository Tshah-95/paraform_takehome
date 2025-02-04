const { RateLimiter } = require("limiter");

const limiter = new RateLimiter({ tokensPerInterval: 50, interval: 10000 });

const main = async () => {
  const key = btoa(process.env.GREENHOUSE_KEY!);
  const jobsUrl = new URL("https://harvest.greenhouse.io/v1/jobs");
  jobsUrl.searchParams.append("per_page", "500");

  // would normally use limiter.js to rate-limit and iterate through all pages
  // but since there's only a few active postings, skipping for now
  const res = await fetch(jobsUrl, {
    headers: {
      Authorization: `Basic ${key}`,
    },
  });

  const data = await res.json();

  const positions: Job[] = [];
  let postPromises = [];

  // would validate the api structure via zod in a real project
  for (const job of data) {
    const position = {
      id: job.id,
      name: job.title,
      status: job.status,
      opened_at: job.created_at,
      departments:
        job.departments?.map((department: any) => department.name) ?? [],
      openings:
        job.openings?.filter((o: any) => o.status === "open").length ?? 0,
      employment_type: job.keyed_custom_fields?.employment_type?.value,
      salary_details: job.keyed_custom_fields?.salary_range?.value,
    };

    await limiter.removeTokens(1);
    const postsUrl = new URL(
      `https://harvest.greenhouse.io/v1/jobs/${job.id}/job_posts`
    );
    postsUrl.searchParams.append("active", "true");
    postsUrl.searchParams.append("full_content", "true");

    postPromises.push(
      fetch(postsUrl, {
        headers: {
          Authorization: `Basic ${key}`,
        },
      })
        .then((res: any) => res.json())
        .then((data: any) => {
          for (const post of data) {
            const posCopy = {
              ...position,
              opened_at: post.first_published_at ?? position.opened_at,
              location: post.location.name,
              name: post.title ?? position.name,
              content: post.content,
              questions: post.questions,
            };

            positions.push(posCopy);
          }
        })
    );
  }

  await Promise.all(postPromises);

  return positions;
};

main();
