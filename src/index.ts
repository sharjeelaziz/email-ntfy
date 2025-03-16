import PostalMime from "postal-mime";
import { convert } from "html-to-text";

const getPlainText = (text?: string, html?: string): string | null => {
  let plainText = text;
  if (!plainText && html) {
    plainText = convert(html);
  }

  if (!plainText) {
    return null;
  }

  return plainText.trim();
};

export default {
  async email(message, env, ctx) {

    try {
      const topic = env.NTFY_TOPIC;
      if (!topic) throw new Error('Missing NTFY_TOPIC. Please create a secret with the topic URL.');

      const token = env.NTFY_TOKEN;
      if (!token) throw new Error('Missing NTFY_TOKEN. Please create a secret with the token.');

      const email = await PostalMime.parse(message.raw);

      const subject = email.subject;
      const plainText = getPlainText(email.text, email.html);
      const from = message.from;
      const date = email.date;

      // Extract domain from email address
      const atIndex = from.lastIndexOf('@');
      const domain = atIndex !== -1 ? from.substring(atIndex + 1) : '';

      const isAllowedSender = Array.isArray(env.allowed_senders) &&
        env.allowed_senders.some((sender: string) => from.toLowerCase() === sender.toLowerCase());
      const isAllowedDomain = Array.isArray(env.allowed_domains)
        && env.allowed_domains.some((allowedDomain: string) => domain.toLowerCase() === allowedDomain.toLowerCase());

      console.log("Sender domain:", domain);
      console.log("Is allowed sender:", isAllowedSender);
      console.log("Is allowed domain:", isAllowedDomain);

      if (isAllowedSender || isAllowedDomain) {
        /**
       * gatherResponse awaits and returns a response body as a string.
       * Use await gatherResponse(..) in an async function to get the response body
       * @param {Response} response
       */
        async function gatherResponse(response) {
          const { headers } = response;
          const contentType = headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            return JSON.stringify(await response.json());
          } else if (contentType.includes("application/text")) {
            return response.text();
          } else if (contentType.includes("text/html")) {
            return response.text();
          } else {
            return response.text();
          }
        }

        const init = {
          body: JSON.stringify(`${plainText}\n\nFrom: ${from}\nDate: ${date}`),
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Title": `${subject}`,
            "Tags": "email",
            "X-Priority": 5,
            "Accept": "application/json"
          },
        };

        const response = await fetch(`${env.NTFY_TOPIC}`, init);

        // Check API response
        if (!response.ok) {
          const results = await gatherResponse(response);
          console.log(init);
          console.log(email)
          console.error(results);
          message.setReject("Failed to process email.");
        } else {
          console.log("Email processed and forwarded to API.");
        }
      }
      else {
        console.log("Sender or domain not in allowed list.");

        if (env.forwarding_address) {
          await message.forward(env.forwarding_address);
        }
        else {
          console.log("No forwarding address provided.");
          message.setReject("Sender or domain not in allowed list.");
        }
      }

    } catch (error) {
      console.error("Failed to process email:", error);
      message.setReject("Failed to process email.");
    }
  },
} satisfies ExportedHandler<Env>;
