const destinationEmail = "ctxboatdetailing@gmail.com";

function clean(value) {
  return String(value || "").trim();
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "Email is not configured yet. Add RESEND_API_KEY in Vercel, then redeploy."
    });
  }

  const service = clean(request.body.service);
  const lake = clean(request.body.lake);
  const boat = clean(request.body.boat);
  const email = clean(request.body.email);
  const measurementLabel = clean(request.body.measurementLabel);
  const measurement = clean(request.body.measurement);
  const estimate = clean(request.body.estimate);

  if (!boat || !email || !measurement) {
    return response.status(400).json({ error: "Please complete boat type, email, and measurement." });
  }

  const emailBody = [
    "New boat detailing quote request:",
    "",
    `Service package: ${service}`,
    `Lake service area: ${lake}`,
    `Boat type: ${boat}`,
    `Customer email: ${email}`,
    `${measurementLabel}: ${measurement}`,
    `Estimate: ${estimate}`
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "CTX Boat Detailing <onboarding@resend.dev>",
      to: destinationEmail,
      reply_to: email,
      subject: "Boat Detailing Quote Request",
      text: emailBody
    })
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return response.status(502).json({
      error: "Resend rejected the email. Make sure your Resend sender domain is verified, or that ctxboatdetailing@gmail.com is the email on your Resend account when using onboarding@resend.dev.",
      details
    });
  }

  return response.status(200).json({ ok: true });
};
