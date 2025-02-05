import axios from "axios";

const main = async () => {
  const key = btoa(process.env.GREENHOUSE_KEY!);

  try {
    const res = await axios.post(
      "https://harvest.greenhouse.io/v1/candidates",
      {
        first_name: "tejas",
        last_name: "shah",
        applications: [
          {
            job_id: 4285367007,
          },
        ],
      },
      {
        headers: {
          Authorization: `Basic ${key}`,
          "On-Behalf-Of": "4280249007",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(res.data);
  } catch (err) {
    console.log(err);
  }
};

main();
