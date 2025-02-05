// might need to worry about rate limiting this serverlessly
// if usage grew significantly
export const POST = async (req: Request) => {
  const formData = await req.formData();

  console.log(formData);

  return Response.json({ hi: "bye" });
};
