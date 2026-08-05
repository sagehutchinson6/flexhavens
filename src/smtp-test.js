const nodemailer = require("nodemailer");

(async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@eaventra.com",
      pass: "08102747760Ea!"
    },
    logger: true,
    debug: true,
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP verified");

    const info = await transporter.sendMail({
      from: "info@eaventra.com",
      to: "info@eaventra.com",
      subject: "SMTP Test",
      text: "Testing Hostinger SMTP",
    });

    console.log("✅ Sent:", info.messageId);
  } catch (err) {
    console.error("❌ SMTP ERROR");
    console.error(err);
  }
})();