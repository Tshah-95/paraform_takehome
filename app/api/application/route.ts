import axios from "axios";

// might need to worry about rate limiting this serverlessly
// if usage grew significantly
export const POST = async (req: Request) => {
  const key = btoa(process.env.GREENHOUSE_KEY!);
  const formData = await req.formData();
  let customKeys = [...formData.entries()].filter(
    ([key, value]) => key.startsWith("question_") && value !== ""
  );

  const baseBody: Record<string, any> = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    applications: [
      {
        job_id: formData.get("job_id"),
      },
    ],
  };

  if (!!formData.get("email")) {
    baseBody.email_addresses = [
      {
        value: formData.get("email"),
        type: "personal",
      },
    ];
  }

  if (!!formData.get("phone")) {
    baseBody.phone_numbers = [
      {
        value: formData.get("phone"),
        type: "mobile",
      },
    ];
  }

  try {
    const applicationRes = await axios.post(
      "https://harvest.greenhouse.io/v1/candidates",
      baseBody,
      {
        headers: {
          Authorization: `Basic ${key}`,
          "On-Behalf-Of": "4280249007",
          "Content-Type": "application/json",
        },
      }
    );

    const appData = applicationRes.data;

    // this seems quite close to what the API wants, but it's throwing 403s
    // if i had time i'd probably tinker with this a bit longer and/or try
    // uploading to s3 and just handing over a url, so for now resumes/cover letters
    // don't upload
    // if (formData.get("resume")) {
    //   const resume = formData.get("resume") as File;

    //   // Convert the file to an ArrayBuffer, then to a Base64 string
    //   const buffer = await resume.arrayBuffer();
    //   const base64Resume = arrayBufferToBase64(buffer);

    //   const resumeUploadRes = await axios.post(
    //     `https://harvest.greenhouse.io/v1/candidates/${appData.id}/attachments`,
    //     {
    //       filename: resume.name,
    //       type: "resume",
    //       content_type: resume.type,
    //       content: base64Resume,
    //     },
    //     {
    //       headers: {
    //         Authorization: `Basic ${key}`,
    //         "On-Behalf-Of": "4280249007",
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    // }

    return Response.json(appData);
  } catch (err) {
    console.log(err);
    return Response.error();
  }
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
